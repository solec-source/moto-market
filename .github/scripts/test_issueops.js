#!/usr/bin/env node

/**
 * Zestaw testów jednostkowych i integracyjnych "na sucho" dla IssueOps (test_issueops.js)
 * Uruchomienie: node .github/scripts/test_issueops.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  parseIssueBody,
  validateUsername,
  calculateExpirationDate,
  formatDate,
  loadState,
  saveState,
  addOrUpdateIntern,
  revokeIntern
} = require('./lib/utils');

const tempStateFile = path.resolve(__dirname, '../../data/test_interns_temp.json');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Komunikat: ${err.message}`);
    console.error(err.stack);
  }
}

console.log('🧪 ========================================================');
console.log('🧪 Uruchamianie testów automatycznych IssueOps (Node.js)');
console.log('🧪 ========================================================\n');

// 1. Testy walidacji loginu
console.log('🔹 1. Testy walidacji nazw użytkowników (GitHub Username):');
runTest('Poprawny standardowy login', () => {
  assert.strictEqual(validateUsername('octocat'), true);
  assert.strictEqual(validateUsername('jan-kowalski'), true);
  assert.strictEqual(validateUsername('dev123'), true);
});

runTest('Niepoprawny login (niedozwolone znaki, podwójne myślniki na start/koniec)', () => {
  assert.strictEqual(validateUsername(''), false);
  assert.strictEqual(validateUsername('-leadingdash'), false);
  assert.strictEqual(validateUsername('invalid_chars!'), false);
});

// 2. Testy parsowania zgłoszenia Issue Form
console.log('\n🔹 2. Testy parsowania treści formularza GitHub Issue:');
runTest('Parsowanie pełnego formularza GitHub Issue z rolą Write', () => {
  const issueMarkdown = `### Login praktykanta na GitHubie (GitHub Username)

@test-intern-99

### Rola / Uprawnienia

Write (odczyt i zapis - push)

### Czas dostępu (w dniach)

60

### Repozytorium docelowe (opcjonalnie)

_No response_

### Notatki / Cel dostępu (opcjonalnie)

Praktyki wakacyjne backend
`;

  const parsed = parseIssueBody(issueMarkdown, 'solec-source/moto-market');
  assert.strictEqual(parsed.username, 'test-intern-99');
  assert.strictEqual(parsed.roleName, 'Write');
  assert.strictEqual(parsed.permission, 'push');
  assert.strictEqual(parsed.durationDays, 60);
  assert.strictEqual(parsed.repository, 'solec-source/moto-market');
  assert.strictEqual(parsed.notes, 'Praktyki wakacyjne backend');
});

runTest('Parsowanie formularza z rolą Read i niestandardowym repozytorium', () => {
  const issueMarkdown = `### Login praktykanta na GitHubie (GitHub Username)

anna-nowak

### Rola / Uprawnienia

Read (tylko odczyt - pull)

### Czas dostępu (w dniach)

14

### Repozytorium docelowe (opcjonalnie)

other-org/other-repo
`;

  const parsed = parseIssueBody(issueMarkdown, 'solec-source/moto-market');
  assert.strictEqual(parsed.username, 'anna-nowak');
  assert.strictEqual(parsed.roleName, 'Read');
  assert.strictEqual(parsed.permission, 'pull');
  assert.strictEqual(parsed.durationDays, 14);
  assert.strictEqual(parsed.repository, 'other-org/other-repo');
});

// 3. Testy kalkulacji terminów ważności:
console.log('\n🔹 3. Testy kalkulacji terminów ważności:');
runTest('Kalkulacja daty wygaśnięcia (+30 dni)', () => {
  const start = new Date('2026-09-01T12:00:00Z');
  const expires = calculateExpirationDate(start, 30);
  assert.strictEqual(formatDate(expires), '2026-10-01');
});

runTest('Kalkulacja daty wygaśnięcia (+90 dni)', () => {
  const start = new Date('2026-01-01T00:00:00Z');
  const expires = calculateExpirationDate(start, 90);
  assert.strictEqual(formatDate(expires), '2026-04-01');
});

// 4. Testy operacji na pliku stanu data/interns.json
console.log('\n🔹 4. Testy zarządzania stanem (dodawanie, aktualizacja, wygaszanie):');
runTest('Inicjalizacja i zapis stanu', () => {
  if (fs.existsSync(tempStateFile)) fs.unlinkSync(tempStateFile);

  const state = loadState(tempStateFile);
  assert.strictEqual(state.interns.length, 0);
  assert.strictEqual(state.history.length, 0);

  // Dodanie praktykanta
  const intern1 = {
    username: 'praktykant-1',
    repository: 'solec-source/moto-market',
    role: 'Write',
    permission: 'push',
    duration_days: 30,
    granted_at: '2026-09-01T10:00:00.000Z',
    expires_at: '2026-10-01T10:00:00.000Z',
    issue_number: 10,
    status: 'active'
  };

  addOrUpdateIntern(state, intern1);
  assert.strictEqual(state.interns.length, 1);
  assert.strictEqual(state.interns[0].username, 'praktykant-1');

  // Wygasły praktykant
  const internExpired = {
    username: 'stary-praktykant',
    repository: 'solec-source/moto-market',
    role: 'Read',
    permission: 'pull',
    duration_days: 14,
    granted_at: '2026-08-01T10:00:00.000Z',
    expires_at: '2026-08-15T10:00:00.000Z', // W przeszłości
    issue_number: 5,
    status: 'active'
  };

  addOrUpdateIntern(state, internExpired);
  assert.strictEqual(state.interns.length, 2);

  // Zapis do pliku tymczasowego
  saveState(tempStateFile, state);
  assert.strictEqual(fs.existsSync(tempStateFile), true);

  // Ponowny odczyt
  const reloaded = loadState(tempStateFile);
  assert.strictEqual(reloaded.interns.length, 2);

  // Wygaszenie 'stary-praktykant'
  const revoked = revokeIntern(reloaded, 'stary-praktykant', 'solec-source/moto-market', 'expired');
  assert.ok(revoked);
  assert.strictEqual(revoked.username, 'stary-praktykant');
  assert.strictEqual(revoked.status, 'revoked');
  assert.strictEqual(reloaded.interns.length, 1);
  assert.strictEqual(reloaded.history.length, 1);
  assert.strictEqual(reloaded.history[0].username, 'stary-praktykant');

  saveState(tempStateFile, reloaded);

  // Sprzątanie po teście
  if (fs.existsSync(tempStateFile)) fs.unlinkSync(tempStateFile);
});

console.log('\n========================================================');
console.log(`📊 Wynik testów: ${passedTests}/${totalTests} zakończonych sukcesem.`);
if (passedTests === totalTests) {
  console.log('🎉 Wszystkie testy automatyczne zaliczone pomyślnie!');
  process.exit(0);
} else {
  console.error('💥 Część testów nie powiodła się.');
  process.exit(1);
}
