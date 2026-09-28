#!/usr/bin/env node

/**
 * IssueOps - Skrypt wygaszania uprawnień praktykantów (revoke_access.js)
 * Wyzwalany codziennie przez cron GitHub Actions (revoke_access.yml) lub ręcznie przez CLI.
 */

const fs = require('fs');
const path = require('path');
const {
  formatDate,
  loadState,
  saveState,
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
const forceUser = getArg('force') || process.env.FORCE_USER;
const token = process.env.GH_ADMIN_TOKEN || process.env.GITHUB_TOKEN;
const stateFilePath = getArg('state-file') || path.resolve(__dirname, '../../data/interns.json');
const stepSummaryFile = process.env.GITHUB_STEP_SUMMARY;

async function main() {
  console.log('⏰ [IssueOps] Rozpoczynanie cyklicznej weryfikacji wygasłych uprawnień praktykantów...');
  if (isDryRun) {
    console.log('🔍 [DRY-RUN] Tryb symulacji aktywny — żadne uprawnienia nie zostaną faktycznie odebrane.');
  }

  const state = loadState(stateFilePath);
  const now = new Date();
  const todayFormatted = formatDate(now);
  console.log(`📅 Bieżący czas: ${now.toISOString()} (${todayFormatted})`);
  console.log(`📊 Liczba aktywnych praktykantów w bazie: ${state.interns.length}`);

  const expiredInterns = [];
  const remainingInterns = [];

  for (const intern of state.interns) {
    const expiresAt = new Date(intern.expires_at);
    const isExpired = expiresAt <= now;
    const isForced = forceUser && forceUser.toLowerCase() === intern.username.toLowerCase();

    if (isExpired || isForced) {
      expiredInterns.push({
        ...intern,
        forceRevoked: isForced && !isExpired
      });
    } else {
      remainingInterns.push(intern);
    }
  }

  if (expiredInterns.length === 0) {
    console.log('✅ Brak wygasłych dostępów na dzień dzisiejszy. Wszyscy praktykanci mają ważny dostęp.');
    if (stepSummaryFile && fs.existsSync(stepSummaryFile)) {
      fs.appendFileSync(
        stepSummaryFile,
        `### 🛡️ IssueOps: Raport Weryfikacji Uprawnień (${todayFormatted})\n\nBrak praktykantów z wygasłym dostępem. Wszyscy aktywni użytkownicy (${state.interns.length}) posiadają ważny termin dostępu.\n`
      );
    }
    return;
  }

  console.log(`🚨 Znaleziono ${expiredInterns.length} praktykantów do odebrania dostępu:`);

  const revokedResults = [];

  for (const intern of expiredInterns) {
    console.log(`\n⏳ Przetwarzanie: @${intern.username} w ${intern.repository} (Wygasł: ${intern.expires_at})...`);
    const [owner, repo] = intern.repository.split('/');

    let apiSuccess = false;
    let errorDetail = null;

    if (isDryRun) {
      console.log(`[DRY-RUN] Symulacja: Odebrano dostęp dla @${intern.username} z repozytorium ${intern.repository}.`);
      apiSuccess = true;
    } else {
      if (!token) {
        throw new Error('Brak wymaganego tokenu (GH_ADMIN_TOKEN lub GITHUB_TOKEN)!');
      }

      const delRes = await callGitHubApi(`/repos/${owner}/${repo}/collaborators/${intern.username}`, {
        method: 'DELETE',
        token
      });

      if (delRes.status === 204) {
        console.log(`✅ Pomyślnie usunięto kolaboranta @${intern.username} z repozytorium ${intern.repository}.`);
        apiSuccess = true;
      } else if (delRes.status === 404) {
        console.log(`ℹ️ Użytkownik @${intern.username} nie był już kolaborantem w ${intern.repository} (został wcześniej usunięty ręcznie).`);
        apiSuccess = true;
      } else {
        const text = await delRes.text();
        errorDetail = `HTTP ${delRes.status}: ${text}`;
        console.error(`❌ Błąd usuwania kolaboranta @${intern.username}: ${errorDetail}`);
      }

      // Powiadomienie w powiązanym Issue (jeśli istnieje)
      if (intern.issue_number && apiSuccess) {
        try {
          const expirationNotice = `### 🔒 Dostęp wygasł — uprawnienia zostały automatycznie odebrane

- **Użytkownik:** @${intern.username}
- **Repozytorium:** \`${intern.repository}\`
- **Data wygaśnięcia:** \`${formatDate(intern.expires_at)}\`
- **Data odebrania:** \`${todayFormatted}\`
- **Powód:** ${intern.forceRevoked ? 'Ręczne wymuszenie odebrania dostępu' : 'Upłynięcie zadeklarowanego czasu praktyk'}

Użytkownik został pomyślnie usunięty z listy kolaborantów przez zaplanowane zadanie IssueOps.`;

          await callGitHubApi(`/repos/${owner}/${repo}/issues/${intern.issue_number}/comments`, {
            method: 'POST',
            token,
            body: { body: expirationNotice }
          });
          console.log(`💬 Dodano komentarz do zgłoszenia #${intern.issue_number}`);
        } catch (commentErr) {
          console.warn(`[Ostrzeżenie] Nie udało się dodać komentarza do Issue #${intern.issue_number}:`, commentErr.message);
        }
      }
    }

    if (apiSuccess || isDryRun) {
      const historyEntry = {
        username: intern.username,
        repository: intern.repository,
        role: intern.role,
        permission: intern.permission,
        duration_days: intern.duration_days,
        granted_at: intern.granted_at,
        expires_at: intern.expires_at,
        revoked_at: now.toISOString(),
        issue_number: intern.issue_number,
        status: 'revoked',
        reason: intern.forceRevoked ? 'manual_force' : 'expired'
      };
      state.history.push(historyEntry);
      revokedResults.push({ ...intern, success: true });
    } else {
      // Zachowaj w aktywnych jeśli wystąpił błąd, aby ponowić w kolejnym cyklu
      remainingInterns.push(intern);
      revokedResults.push({ ...intern, success: false, error: errorDetail });
    }
  }

  // Zaktualizuj listę aktywnych praktykantów
  state.interns = remainingInterns;
  saveState(stateFilePath, state);
  console.log(`\n💾 Zaktualizowano bazę danych stanu: ${stateFilePath}`);
  console.log(`Pozostało aktywnych praktykantów: ${state.interns.length}`);

  // Przygotowanie raportu Markdown (np. do GitHub Step Summary)
  const summaryMarkdown = `### 🛡️ IssueOps: Raport Wygaszania Uprawnień (${todayFormatted})

Wykryto i przetworzono wygasłe uprawnienia dla **${revokedResults.length}** użytkowników:

| Użytkownik | Rola | Repozytorium | Data wygaśnięcia | Status operacji |
| :--- | :--- | :--- | :--- | :--- |
${revokedResults
  .map(
    (r) =>
      `| **@${r.username}** | ${r.role} | \`${r.repository}\` | \`${formatDate(r.expires_at)}\` | ${
        r.success ? '✅ Odebrano dostęp' : `❌ Błąd: ${r.error || 'Nieznany'}`
      } |`
  )
  .join('\n')}

- **Pozostałych aktywnych praktykantów:** ${state.interns.length}
- **Całkowita liczba wpisów w historii:** ${state.history.length}
`;

  console.log('\n📄 Raport podsumowujący:\n' + summaryMarkdown);

  if (stepSummaryFile) {
    try {
      fs.appendFileSync(stepSummaryFile, summaryMarkdown + '\n');
    } catch (err) {
      console.warn('[Ostrzeżenie] Nie udało się zapisać podsumowania GitHub Step Summary:', err.message);
    }
  }

  console.log('🎉 [IssueOps] Wygaszanie uprawnień zakończone pomyślnie!');
}

main().catch((err) => {
  console.error('💥 [Krytyczny błąd w revoke_access]:', err);
  process.exit(1);
});
