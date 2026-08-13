import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statSync, readFileSync } from 'node:fs';

// Byte sizes are the verified upstream originals. A mismatch means the file was
// re-encoded or subset, which changes the metrics the layout was tuned against.
//
// Fonts only. An image was pinned here too — the poster frame for a video 05.6
// no longer uses — but a byte count says nothing useful about a photograph, and
// the size that actually matters is checked properly elsewhere: the figure test
// reads each image's intrinsic dimensions out of its header and compares them
// against what the markup declares.
const EXPECTED = {
  'assets/fonts/public-sans.woff2': 26636,
  'assets/fonts/spline-sans-mono.woff2': 36528,
};

for (const [path, bytes] of Object.entries(EXPECTED)) {
  test(`${path} exists at ${bytes} bytes`, () => {
    assert.equal(statSync(path).size, bytes);
  });
}

test('OFL licence ships with the fonts', () => {
  const ofl = readFileSync('assets/fonts/OFL.txt', 'utf8');
  assert.match(ofl, /SIL OPEN FONT LICENSE/i);
  assert.match(ofl, /Public Sans/);
  assert.match(ofl, /Spline Sans Mono/);
});
