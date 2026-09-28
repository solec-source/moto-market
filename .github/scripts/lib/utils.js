/**
 * IssueOps Intern Access Management - Moduł narzędziowy (lib/utils.js)
 * Obsługa parsowania zgłoszeń, kalkulacji dat, operacji na pliku stanu i API GitHuba.
 */

const fs = require('fs');
const path = require('path');

/**
 * Normalizuje i parsuje treść zgłoszenia GitHub Issue Form
 * @param {string} body - Treść zgłoszenia w formacie Markdown
 * @param {string} defaultRepo - Domyślne repozytorium (np. solec-source/moto-market)
 * @returns {object} Sparsowane dane wniosku
 */
function parseIssueBody(body, defaultRepo = '') {
  if (!body || typeof body !== 'string') {
    throw new Error('Treść zgłoszenia jest pusta lub nieprawidłowa.');
  }

  const sections = {};
  const lines = body.split(/\r?\n/);
  let currentHeader = null;
  let currentContent = [];

  for (const line of lines) {
    const headerMatch = line.match(/^###\s+(.+)$/);
    if (headerMatch) {
      if (currentHeader) {
        sections[currentHeader.toLowerCase()] = currentContent.join('\n').trim();
      }
      currentHeader = headerMatch[1].trim();
      currentContent = [];
    } else if (currentHeader) {
      currentContent.push(line);
    }
  }

  if (currentHeader) {
    sections[currentHeader.toLowerCase()] = currentContent.join('\n').trim();
  }

  // Wyszukiwanie odpowiednich pól po słowach kluczowych w nagłówkach
  const findValue = (keywords) => {
    for (const [key, value] of Object.entries(sections)) {
      if (keywords.some((kw) => key.includes(kw))) {
        return value;
      }
    }
    return '';
  };

  // 1. Login użytkownika
  let rawUsername = findValue(['login', 'username', 'użytkownik']);
  // Fallback dla prostego formatu klucz: wartość
  if (!rawUsername) {
    const match = body.match(/(?:username|login):\s*@?([a-zA-Z0-9-]+)/i);
    if (match) rawUsername = match[1];
  }
  const cleanUsername = rawUsername
    .replace(/^@+/, '')
    .trim()
    .split(/\s+/)[0];

  // 2. Rola / Uprawnienia
  let rawRole = findValue(['rola', 'uprawnienia', 'role', 'permission']);
  if (!rawRole) {
    const match = body.match(/(?:role|uprawnienia):\s*([a-zA-Z\s\(\)-]+)/i);
    if (match) rawRole = match[1];
  }
  const roleLower = (rawRole || '').toLowerCase();
  let permission = 'pull';
  let roleName = 'Read';
  if (roleLower.includes('write') || roleLower.includes('push') || roleLower.includes('zapis')) {
    permission = 'push';
    roleName = 'Write';
  } else if (roleLower.includes('admin')) {
    permission = 'admin';
    roleName = 'Admin';
  }

  // 3. Czas dostępu (dni)
  let rawDuration = findValue(['czas', 'dni', 'duration', 'okres']);
  if (!rawDuration) {
    const match = body.match(/(?:duration|dni|czas):\s*(\d+)/i);
    if (match) rawDuration = match[1];
  }
  const durationMatch = (rawDuration || '').match(/\d+/);
  const durationDays = durationMatch ? parseInt(durationMatch[0], 10) : 30;

  // 4. Repozytorium docelowe
  let rawRepo = findValue(['repozytorium', 'repository', 'target_repo']);
  let targetRepo = defaultRepo;
  if (rawRepo && !rawRepo.includes('_No response_') && rawRepo.trim().length > 0) {
    const cleaned = rawRepo.trim().split(/\s+/)[0];
    if (cleaned.includes('/')) {
      targetRepo = cleaned;
    }
  }

  // 5. Notatki / Cel
  let notes = findValue(['notatki', 'notes', 'uzasadnienie', 'cel dostępu', 'cel wizyty', 'opis']);
  if (notes.includes('_No response_')) notes = '';

  return {
    username: cleanUsername,
    roleName,
    permission,
    durationDays,
    repository: targetRepo,
    notes: notes.trim(),
  };
}

/**
 * Waliduje login użytkownika GitHub
 * @param {string} username 
 * @returns {boolean}
 */
function validateUsername(username) {
  if (!username) return false;
  // Dozwolone znaki w GitHub username: znaki alfanumeryczne i pojedyncze myślniki, max 39 znaków
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username);
}

/**
 * Wylicza datę wygaśnięcia na podstawie daty początkowej i liczby dni
 * @param {Date|string} startDate 
 * @param {number} durationDays 
 * @returns {Date}
 */
function calculateExpirationDate(startDate, durationDays) {
  const start = new Date(startDate);
  const expiration = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
  return expiration;
}

/**
 * Formatuje datę do czytelnego formatu YYYY-MM-DD
 * @param {Date|string} date 
 * @returns {string}
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Ładuje plik stanu data/interns.json
 * @param {string} filePath 
 * @returns {object} Stan bazy
 */
function loadState(filePath) {
  const defaultState = {
    version: '1.0',
    description: 'Baza danych stanu uprawnień praktykantów zarządzana automatycznie przez GitHub IssueOps',
    last_updated: null,
    interns: [],
    history: []
  };

  if (!fs.existsSync(filePath)) {
    return defaultState;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.interns)) parsed.interns = [];
    if (!Array.isArray(parsed.history)) parsed.history = [];
    return parsed;
  } catch (err) {
    console.warn(`[Ostrzeżenie] Nie udało się odczytać pliku stanu (${err.message}). Używanie stanu domyślnego.`);
    return defaultState;
  }
}

/**
 * Zapisuje plik stanu data/interns.json
 * @param {string} filePath 
 * @param {object} state 
 */
function saveState(filePath, state) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  state.last_updated = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

/**
 * Dodaje lub aktualizuje wpis praktykanta w stanie
 * @param {object} state 
 * @param {object} internData 
 * @returns {object} Zaktualizowany wpis
 */
function addOrUpdateIntern(state, internData) {
  const existingIdx = state.interns.findIndex(
    (i) => i.username.toLowerCase() === internData.username.toLowerCase() &&
           i.repository.toLowerCase() === internData.repository.toLowerCase()
  );

  if (existingIdx >= 0) {
    // Aktualizacja istniejącego aktywnego wpisu (np. przedłużenie lub zmiana roli)
    state.interns[existingIdx] = {
      ...state.interns[existingIdx],
      ...internData,
      status: 'active'
    };
    return state.interns[existingIdx];
  } else {
    // Dodanie nowego wpisu
    state.interns.push(internData);
    return internData;
  }
}

/**
 * Oznacza praktykanta jako wygaszonego i przenosi do historii
 * @param {object} state 
 * @param {string} username 
 * @param {string} repository 
 * @param {string} reason 
 * @returns {object|null} Odnaleziony i wygaszony rekord
 */
function revokeIntern(state, username, repository, reason = 'expired') {
  const idx = state.interns.findIndex(
    (i) => i.username.toLowerCase() === username.toLowerCase() &&
           (!repository || i.repository.toLowerCase() === repository.toLowerCase())
  );

  if (idx === -1) {
    return null;
  }

  const [revokedRecord] = state.interns.splice(idx, 1);
  const historyEntry = {
    ...revokedRecord,
    revoked_at: new Date().toISOString(),
    status: 'revoked',
    reason
  };

  state.history.push(historyEntry);
  return historyEntry;
}

/**
 * Wywołanie GitHub REST API za pomocą natywnego fetch
 * @param {string} endpoint 
 * @param {object} options 
 * @returns {Promise<Response>}
 */
async function callGitHubApi(endpoint, { method = 'GET', body = null, token } = {}) {
  const url = endpoint.startsWith('https://') ? endpoint : `https://api.github.com${endpoint}`;
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'MotoMarket-IssueOps/1.0',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
}

module.exports = {
  parseIssueBody,
  validateUsername,
  calculateExpirationDate,
  formatDate,
  loadState,
  saveState,
  addOrUpdateIntern,
  revokeIntern,
  callGitHubApi
};
