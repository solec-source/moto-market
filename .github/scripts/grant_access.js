#!/usr/bin/env node

/**
 * IssueOps - Skrypt nadawania uprawnień praktykantowi (grant_access.js)
 * Wyzwalany przez GitHub Actions (grant_access.yml) lub ręcznie przez CLI.
 */

const path = require('path');
const {
  parseIssueBody,
  validateUsername,
  calculateExpirationDate,
  formatDate,
  loadState,
  saveState,
  addOrUpdateIntern,
  callGitHubApi
} = require('./lib/utils');

// Parsowanie argumentów CLI
const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const isDryRun = hasFlag('dry-run') || process.env.DRY_RUN === 'true';
const token = process.env.GH_ADMIN_TOKEN || process.env.GITHUB_TOKEN;
const repoFullName = getArg('repo') || process.env.GITHUB_REPOSITORY || 'solec-source/moto-market';
const issueNumber = getArg('issue') || process.env.ISSUE_NUMBER;
const stateFilePath = getArg('state-file') || path.resolve(__dirname, '../../data/interns.json');

async function main() {
  console.log('🚀 [IssueOps] Rozpoczynanie procesu nadawania dostępu praktykantowi...');
  if (isDryRun) {
    console.log('🔍 [DRY-RUN] Tryb symulacji aktywny — żadne zmiany w GitHub API nie zostaną zapisane.');
  }

  // 1. Pobranie treści zgłoszenia
  let rawBody = process.env.ISSUE_BODY || '';
  
  // Jeśli podano CLI bezpośrednio
  const cliUsername = getArg('username');
  const cliRole = getArg('role');
  const cliDuration = getArg('duration');

  let parsedData;

  if (cliUsername) {
    parsedData = {
      username: cliUsername.replace(/^@+/, ''),
      roleName: cliRole && cliRole.toLowerCase().includes('read') ? 'Read' : 'Write',
      permission: cliRole && cliRole.toLowerCase().includes('read') ? 'pull' : 'push',
      durationDays: cliDuration ? parseInt(cliDuration, 10) : 30,
      repository: repoFullName,
      notes: getArg('notes') || 'Dodano przez CLI'
    };
  } else if (!rawBody && issueNumber && token && !isDryRun) {
    console.log(`📥 Pobieranie treści Issue #${issueNumber} z GitHub API...`);
    const [owner, repo] = repoFullName.split('/');
    const issueRes = await callGitHubApi(`/repos/${owner}/${repo}/issues/${issueNumber}`, { token });
    if (!issueRes.ok) {
      throw new Error(`Nie udało się pobrać treści Issue #${issueNumber}: HTTP ${issueRes.status}`);
    }
    const issueJson = await issueRes.json();
    rawBody = issueJson.body || '';
    parsedData = parseIssueBody(rawBody, repoFullName);
  } else if (rawBody) {
    parsedData = parseIssueBody(rawBody, repoFullName);
  } else {
    // Fallback dla symulacji dry-run bez podanych parametrów
    console.log('ℹ️ Brak danych w ENV — używanie przykładowych danych testowych dla symulacji...');
    parsedData = {
      username: 'praktykant-test',
      roleName: 'Write',
      permission: 'push',
      durationDays: 30,
      repository: repoFullName,
      notes: 'Testowa symulacja dry-run'
    };
  }

  console.log('📋 Dane wniosku:', JSON.stringify(parsedData, null, 2));

  // 2. Walidacja
  if (!validateUsername(parsedData.username)) {
    const errorMsg = `❌ Błąd: Nieprawidłowy login GitHuba: "${parsedData.username}". Dozwolone są tylko znaki alfanumeryczne i myślniki.`;
    console.error(errorMsg);
    if (issueNumber && token && !isDryRun) {
      const [owner, repo] = repoFullName.split('/');
      await callGitHubApi(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
        method: 'POST',
        token,
        body: { body: errorMsg }
      });
    }
    process.exit(1);
  }

  const targetRepo = parsedData.repository || repoFullName;
  const [targetOwner, targetRepoName] = targetRepo.split('/');
  if (!targetOwner || !targetRepoName) {
    throw new Error(`Nieprawidłowy format repozytorium docelowego: ${targetRepo}. Wymagany format: owner/repo.`);
  }

  // 3. Weryfikacja użytkownika i nadanie uprawnień w GitHub API
  if (isDryRun) {
    console.log(`[DRY-RUN] Symulacja: Dodano użytkownika @${parsedData.username} do ${targetRepo} z uprawnieniem "${parsedData.permission}".`);
  } else {
    if (!token) {
      throw new Error('Brak wymaganego tokenu (GH_ADMIN_TOKEN lub GITHUB_TOKEN)!');
    }

    console.log(`➕ Nadawanie uprawnień: @${parsedData.username} -> ${targetRepo} (${parsedData.permission})...`);
    const putRes = await callGitHubApi(
      `/repos/${targetOwner}/${targetRepoName}/collaborators/${parsedData.username}`,
      {
        method: 'PUT',
        token,
        body: { permission: parsedData.permission }
      }
    );

    if (putRes.status === 201) {
      console.log(`✅ Zaproszenie do repozytorium zostało wysłane do @${parsedData.username}.`);
    } else if (putRes.status === 204) {
      console.log(`✅ Użytkownik @${parsedData.username} był już kolaborantem — uprawnienia zaktualizowane.`);
    } else {
      const errText = await putRes.text();
      const failMsg = `❌ Błąd GitHub API (HTTP ${putRes.status}): Nie udało się nadać uprawnień użytkownikowi @${parsedData.username}.\n\`\`\`json\n${errText}\n\`\`\``;
      console.error(failMsg);
      if (issueNumber) {
        await callGitHubApi(`/repos/${targetOwner}/${targetRepoName}/issues/${issueNumber}/comments`, {
          method: 'POST',
          token,
          body: { body: failMsg }
        });
      }
      process.exit(1);
    }
  }

  // 4. Kalkulacja dat
  const grantedAt = new Date();
  const expiresAt = calculateExpirationDate(grantedAt, parsedData.durationDays);
  const grantedFormatted = formatDate(grantedAt);
  const expiresFormatted = formatDate(expiresAt);

  console.log(`📅 Okres dostępu: od ${grantedFormatted} do ${expiresFormatted} (${parsedData.durationDays} dni)`);

  // 5. Zapisanie do bazy stanu data/interns.json
  const state = loadState(stateFilePath);
  const internRecord = {
    username: parsedData.username,
    repository: targetRepo,
    role: parsedData.roleName,
    permission: parsedData.permission,
    duration_days: parsedData.durationDays,
    granted_at: grantedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    issue_number: issueNumber ? parseInt(issueNumber, 10) : null,
    notes: parsedData.notes || null,
    status: 'active'
  };

  addOrUpdateIntern(state, internRecord);
  saveState(stateFilePath, state);
  console.log(`💾 Zapisano wpis praktykanta w pliku stanu: ${stateFilePath}`);

  // 6. Dodanie komentarza i zamknięcie Issue
  const confirmationComment = `### ✅ Pomyślnie nadano dostęp dla praktykanta!

- **Użytkownik:** @${parsedData.username}
- **Poziom uprawnień:** ${parsedData.roleName} (\`${parsedData.permission}\`)
- **Repozytorium:** \`${targetRepo}\`
- **Data rozpoczęcia:** \`${grantedFormatted}\`
- **Data wygaśnięcia:** \`${expiresFormatted}\` (**${parsedData.durationDays} dni**)

> [!NOTE]
> Zaproszenie zostało wysłane (lub uprawnienia zaktualizowane). Dostęp zostanie automatycznie odebrany dnia **${expiresFormatted}** przez zaplanowane zadanie IssueOps.

*Zgłoszenie zostało pomyślnie obsłużone i zamknięte automatycznie.*`;

  if (isDryRun) {
    console.log('[DRY-RUN] Treść komentarza do Issue:');
    console.log(confirmationComment);
    console.log(`[DRY-RUN] Zamknięcie Issue #${issueNumber || 'N/A'}`);
  } else if (issueNumber && token) {
    const [owner, repo] = repoFullName.split('/');
    console.log(`💬 Dodawanie komentarza do Issue #${issueNumber}...`);
    await callGitHubApi(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
      method: 'POST',
      token,
      body: { body: confirmationComment }
    });

    console.log(`🔒 Zamykanie Issue #${issueNumber}...`);
    await callGitHubApi(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      token,
      body: { state: 'closed', state_reason: 'completed' }
    });
  }

  console.log('🎉 [IssueOps] Proces nadania dostępu zakończony sukcesem!');
}

main().catch((err) => {
  console.error('💥 [Krytyczny błąd]:', err);
  process.exit(1);
});
