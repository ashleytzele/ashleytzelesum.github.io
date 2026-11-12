import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

test('no client-identifying term appears in any tracked file', () => {
  if (!existsSync('.confidential-terms')) return;
  const terms = readFileSync('.confidential-terms', 'utf8').split('\n').map((t) => t.trim()).filter((t) => t && !t.startsWith('#')).map((t) => t.toLowerCase());
  const files = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter((f) => f && /\.(html|md|txt|xml|json|js|mjs|css|yml)$/.test(f));
  const hits = [];
  for (const f of files) {
    const body = readFileSync(f, 'utf8').toLowerCase();
    terms.forEach((t, i) => { if (body.includes(t)) hits.push(`${f}: term #${i + 1}`); });
  }
  assert.deepEqual(hits, [], 'Forbidden terms found (numbers refer to lines in .confidential-terms)');
});
