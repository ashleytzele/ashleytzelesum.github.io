# Blueprint Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the production `index.html` at ashleytzelesum.com with the verified Blueprint drawing-set design, split into cacheable files, guarded by a contract test suite that fails when the design's accessibility and structure rules are broken.

**Architecture:** The prototype at `/private/tmp/claude-501/-Users-leleditit-Desktop-Github-ashleytzelesum-github-io/f48a849c-cccc-48af-abe0-9c37130f78fe/scratchpad/bp/v2.tpl.html` is one 933-line file with three build tokens (`__PS__`, `__MONO__`, `__SW__`) standing in for base64 assets. Production splits it at its existing seams — `<style>` on lines 2–269, the icon sprite on line 271, the behaviour script on lines 873–933 — into `index.html` + `assets/css/blueprint.css` + `assets/js/blueprint.js`, with the three tokens becoming real files. No build step, no bundler, no package manager.

**Tech Stack:** Static HTML/CSS/JS. GitHub Pages. Node's built-in test runner (`node --test`) for contract tests — no npm dependencies, no `package.json`.

## Global Constraints

Copied verbatim from `docs/superpowers/specs/2026-08-06-blueprint-portfolio-design.md`. Every task's requirements implicitly include these.

- **No dependencies.** No npm packages, no CDN, no third-party requests, no build step. Fonts self-hosted, icons inline.
- **Contrast:** zero failures in both themes, for HTML text and SVG text alike.
- **Headings:** exactly one `<h1>`, no skipped levels, outline does not change when the page is interacted with.
- **Touch targets:** every interactive element at least 44×44 CSS pixels at every width.
- **Keyboard:** every control operable, focus visible, DOM order equals tab order, no traps. Scrollable regions focusable.
- **Motion never gates content.** Reveal states applied only when JS is present to remove them, plus a `<noscript>` fallback.
- **Zero console errors. Zero infinite animations. Zero layout properties animated.**
- **Palette:** eleven greyscale tokens. No hex value outside a theme block. No accent colour.
- **Forbidden:** box-shadow, gradients, backdrop-filter, blur, emoji, cards, hero metric rows, numbered editorial section labels.
- **Sheet numbers `A-001`…`A-006` are load-bearing.** The index, anchors, in-drawing cross-references and any shared link depend on them. Renumbering is a breaking change.

**Reference files (read-only inputs, outside the repo):**
- Prototype: `<SCRATCH>/v2.tpl.html` where `<SCRATCH>` = `/private/tmp/claude-501/-Users-leleditit-Desktop-Github-ashleytzelesum-github-io/f48a849c-cccc-48af-abe0-9c37130f78fe/scratchpad/bp`
- Fonts: `<SCRATCH>/ps.woff2` (Public Sans, 26,636 B), `<SCRATCH>/mono.woff2` (Spline Sans Mono, 36,528 B) — both verified byte-identical to their Google Fonts sources, both SIL OFL 1.1
- Image: `<SCRATCH>/sw.jpg` (87,213 B)
- Audit record: `<SCRATCH>/CRITIQUE.md`

---

### Task 1: Correct the spec's network line, then land the real assets

The spec says "Zero network requests beyond the document." That was written against the prototype, where an artifact CSP forbids external hosts and everything must be base64. In production the opposite is correct: base64 fonts and images cannot be cached separately, so inlining them costs ~200 KB on **every** page load. Fix the spec first so the plan and the spec agree.

**Files:**
- Modify: `docs/superpowers/specs/2026-08-06-blueprint-portfolio-design.md` (Performance Contract, first bullet)
- Create: `assets/fonts/public-sans.woff2`
- Create: `assets/fonts/spline-sans-mono.woff2`
- Create: `assets/fonts/OFL.txt`
- Create: `assets/images/splitwise-dashboard.jpg`
- Test: `test/assets.test.mjs`

**Interfaces:**
- Produces: four asset paths that Task 3's CSS and HTML reference — `assets/fonts/public-sans.woff2`, `assets/fonts/spline-sans-mono.woff2`, `assets/images/splitwise-dashboard.jpg`. From `assets/css/blueprint.css` the font paths resolve as `../fonts/<name>.woff2`.

- [ ] **Step 1: Correct the spec's Performance Contract**

In `docs/superpowers/specs/2026-08-06-blueprint-portfolio-design.md`, replace the first bullet under `## Performance Contract`:

```markdown
- Zero network requests beyond the document. Fonts self-hosted, icons inline, no dependencies.
```

with:

```markdown
- Zero third-party requests. No CDN, no analytics, no embeds, no dependencies. Fonts are self-hosted as separate cacheable files and icons are inlined in the document; the prototype inlines fonts as base64 only because an artifact CSP forbids external hosts, and production must not, since a base64 font cannot be cached across page loads.
```

- [ ] **Step 2: Write the failing asset test**

Create `test/assets.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statSync, readFileSync } from 'node:fs';

// Byte sizes are the verified upstream originals. A mismatch means the file was
// re-encoded or subset, which changes the metrics the layout was tuned against.
const EXPECTED = {
  'assets/fonts/public-sans.woff2': 26636,
  'assets/fonts/spline-sans-mono.woff2': 36528,
  'assets/images/splitwise-dashboard.jpg': 87213,
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
```

- [ ] **Step 3: Run it to make sure it fails**

```bash
node --test test/assets.test.mjs
```

Expected: FAIL — `ENOENT: no such file or directory, stat 'assets/fonts/public-sans.woff2'`

- [ ] **Step 4: Copy the assets in**

```bash
SCRATCH=/private/tmp/claude-501/-Users-leleditit-Desktop-Github-ashleytzelesum-github-io/f48a849c-cccc-48af-abe0-9c37130f78fe/scratchpad/bp
mkdir -p assets/fonts
cp "$SCRATCH/ps.woff2"   assets/fonts/public-sans.woff2
cp "$SCRATCH/mono.woff2" assets/fonts/spline-sans-mono.woff2
cp "$SCRATCH/sw.jpg"     assets/images/splitwise-dashboard.jpg
```

- [ ] **Step 5: Write the licence file**

Create `assets/fonts/OFL.txt`:

```text
The fonts in this directory are licensed under the SIL Open Font License, Version 1.1.

  public-sans.woff2       — Public Sans, Copyright (c) 2015 Impallari Type,
                            Copyright (c) 2019 United States Government (USWDS).
                            https://public-sans.digital.gov/

  spline-sans-mono.woff2  — Spline Sans Mono, Copyright (c) 2021 The Spline Sans
                            Mono Project Authors.
                            https://github.com/SorkinType/SplineSansMono

Both files are unmodified copies of the woff2 builds served by Google Fonts and
are redistributed here under the terms below.

Full licence text: https://openfontlicense.org/open-font-license-official-text/

-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply to any
document created using the fonts or their derivatives.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining a
copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components, in
Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or in
the appropriate machine-readable metadata fields within text or binary
files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name
as presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any Modified
Version, except to acknowledge the contribution(s) of the Copyright
Holder(s) and the Author(s) or with their explicit written permission.

5) The Font Software, modified or unmodified, in part or in whole, must
be distributed entirely under this license, and must not be distributed
under any other license. The requirement for fonts to remain under this
license does not apply to any document created using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF
COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM OTHER
DEALINGS IN THE FONT SOFTWARE.
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
node --test test/assets.test.mjs
```

Expected: PASS — 4 tests.

- [ ] **Step 7: Commit**

```bash
git add assets/fonts assets/images/splitwise-dashboard.jpg test/assets.test.mjs docs/superpowers/specs/2026-08-06-blueprint-portfolio-design.md
git commit -m "Add self-hosted fonts and figure asset with OFL licence

Public Sans and Spline Sans Mono, both unmodified woff2 builds, both OFL 1.1.
Corrects the spec's network line: base64 fonts cannot be cached per-load, so
production ships them as separate files."
```

---

### Task 2: Contract test suite

Written before the page exists so it fails against the current `index.html`, proving each assertion is live rather than vacuous. Every rule here corresponds to a defect that actually occurred during the audit — see `<SCRATCH>/CRITIQUE.md`.

**Files:**
- Create: `test/contracts.test.mjs`
- Create: `test/read.mjs`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `readSite()` from `test/read.mjs`, returning `{ html, css, js }` as strings. Task 4 imports it.

- [ ] **Step 1: Write the shared reader**

Create `test/read.mjs`:

```javascript
import { readFileSync } from 'node:fs';

// Reads the three production files as text. Every contract test parses strings
// rather than a DOM: Node has no HTML parser built in and adding one would mean
// a dependency, which this repo does not have and should not gain.
export function readSite() {
  return {
    html: readFileSync('index.html', 'utf8'),
    css: readFileSync('assets/css/blueprint.css', 'utf8'),
    js: readFileSync('assets/js/blueprint.js', 'utf8'),
  };
}
```

- [ ] **Step 2: Write the failing contract tests**

Create `test/contracts.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readSite } from './read.mjs';

const { html, css, js } = readSite();

test('exactly one h1', () => {
  const h1s = html.match(/<h1[\s>]/g) || [];
  assert.equal(h1s.length, 1);
});

test('no skipped heading levels', () => {
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map(m => Number(m[1]));
  const skips = [];
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1) skips.push(`${levels[i - 1]}->${levels[i]}`);
  }
  assert.deepEqual(skips, []);
});

test('no placeholder copy', () => {
  assert.doesNotMatch(html, /\bTBC\b|\bTODO\b|Lorem ipsum|author input/i);
});

test('every aria-controls target exists', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  const dangling = [...html.matchAll(/aria-controls="([^"]+)"/g)]
    .map(m => m[1]).filter(id => !ids.has(id));
  assert.deepEqual(dangling, []);
});

test('every aria-labelledby target exists', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  const dangling = [...html.matchAll(/aria-labelledby="([^"]+)"/g)]
    .flatMap(m => m[1].split(/\s+/)).filter(id => !ids.has(id));
  assert.deepEqual(dangling, []);
});

test('sprite has no dead symbols and no dangling references', () => {
  const defined = new Set([...html.matchAll(/<symbol id="(i-[a-z0-9]+)"/g)].map(m => m[1]));
  const used = new Set([...html.matchAll(/<use href="#(i-[a-z0-9]+)"/g)].map(m => m[1]));
  const dead = [...defined].filter(id => !used.has(id));
  const dangling = [...used].filter(id => !defined.has(id));
  assert.deepEqual(dangling, [], 'referenced icons with no symbol');
  assert.deepEqual(dead, [], 'symbols defined but never used');
});

test('no icon-only control: every icon svg is aria-hidden', () => {
  const icons = html.match(/<svg class="ico"[^>]*>/g) || [];
  assert.ok(icons.length > 0, 'expected icons in the document');
  const exposed = icons.filter(tag => !tag.includes('aria-hidden="true"'));
  assert.deepEqual(exposed, []);
});

test('grid tracks that must shrink are declared minmax(0,1fr)', () => {
  // A bare `1fr` floors at min-content. With a figure that has a scale floor in
  // the track, that pushed the whole page to 746px wide at a 390px viewport.
  const bare = css.match(/grid-template-columns:\s*1fr\s*[;}]/g) || [];
  assert.deepEqual(bare, []);
});

test('no hex colour outside a theme block', () => {
  const withoutThemes = css.replace(/:root[^{]*\{[^}]*\}/g, '');
  const strays = withoutThemes.match(/#[0-9A-Fa-f]{6}\b/g) || [];
  assert.deepEqual(strays, []);
});

test('forbidden visual effects are absent', () => {
  for (const banned of ['box-shadow', 'backdrop-filter', 'gradient(', 'blur(']) {
    assert.ok(!css.includes(banned), `${banned} is forbidden by the spec`);
  }
});

test('no emoji anywhere', () => {
  assert.doesNotMatch(html, /[\u{1F300}-\u{1FAFF}\u{2700}-\u{27BF}]/u);
});

test('reveal is js-guarded and has a noscript fallback', () => {
  // Without this, content sits at opacity 0 forever when JS is off.
  assert.match(css, /\.js\s+\.an\s*\{[^}]*opacity:\s*0/);
  assert.match(html, /<noscript>/);
  assert.match(html, /document\.documentElement\.className\s*\+=\s*" js"/);
});

test('scrollable regions are keyboard reachable and labelled', () => {
  const boxes = html.match(/<div class="(figbox|dwgbox)"[^>]*>/g) || [];
  assert.ok(boxes.length > 0, 'expected scrollable figure regions');
  for (const box of boxes) {
    assert.ok(box.includes('tabindex="0"'), `not focusable: ${box}`);
    assert.ok(box.includes('aria-label='), `not labelled: ${box}`);
  }
});

test('interactive SVG is not inside a presentational role', () => {
  // role="img" collapses its subtree, hiding every control in it.
  const a001 = html.slice(html.indexOf('id="a001"'), html.indexOf('id="a002"'));
  assert.ok(a001.includes('role="group"'), 'assembly svg must be role=group');
  assert.ok(!/role="img"[\s\S]{0,4000}role="tab"/.test(a001));
});

test('component group uses tab semantics, not aria-pressed', () => {
  assert.ok(!html.includes('aria-pressed'), 'single-select group must not use aria-pressed');
  assert.equal((html.match(/role="tablist"/g) || []).length, 1);
  assert.equal((html.match(/role="tab"/g) || []).length, 4);
  assert.equal((html.match(/role="tabpanel"/g) || []).length, 1);
});

test('every img declares intrinsic size and a substantive alt', () => {
  const imgs = html.match(/<img[^>]*>/g) || [];
  for (const img of imgs) {
    assert.match(img, /\bwidth="\d+"/, `no width: ${img}`);
    assert.match(img, /\bheight="\d+"/, `no height: ${img}`);
    const alt = /alt="([^"]*)"/.exec(img);
    assert.ok(alt && alt[1].length > 20, `alt too thin: ${img}`);
  }
});

test('every local asset referenced actually exists', () => {
  const refs = [...html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)].map(m => m[1])
    .concat([...css.matchAll(/url\(\.\.\/([^)]+)\)/g)].map(m => `assets/${m[1]}`));
  const missing = [...new Set(refs)].filter(p => !existsSync(p));
  assert.deepEqual(missing, []);
});

test('no third-party resource loads', () => {
  // Navigation links to GitHub and LinkedIn are content the spec requires under
  // Contact. What is forbidden is *loading* from another host — CDN, analytics,
  // fonts, embeds — so only resource-loading elements are checked, not <a href>.
  const loads = html.match(/<(?:link|script|img|video|source|iframe|audio|embed|object)\b[^>]*\b(?:src|href|data)="https?:\/\/[^"]*"/g) || [];
  const offenders = loads.filter(u => !u.includes('ashleytzelesum.com'));
  assert.deepEqual(offenders, [], 'the spec forbids CDN, fonts, analytics and embeds from other hosts');
});

test('behaviour script has no dependencies and parses', () => {
  assert.ok(!/\b(import|require)\s*[(\s]/.test(js), 'script must be dependency-free');
  new Function(js); // throws on a syntax error
});

test('a failed script load cannot leave content hidden', () => {
  // The `js` class is set by an inline script that always runs, but the behaviour
  // script is a separate request. If it 404s or is blocked, nothing would remove
  // the reveal state and 15 blocks would stay at opacity 0 forever — and <noscript>
  // would not fire, because JS is enabled. The onerror handler is the only guard.
  const tag = /<script[^>]*src="assets\/js\/blueprint\.js"[^>]*>/.exec(html);
  assert.ok(tag, 'behaviour script tag not found');
  assert.match(tag[0], /onerror="[^"]*classList\.remove\('js'\)[^"]*"/);
});
```

- [ ] **Step 3: Run to verify it fails**

```bash
node --test test/contracts.test.mjs
```

Expected: FAIL — `ENOENT ... 'assets/css/blueprint.css'` from `readSite()`. The current `index.html` has no such file. This is the correct failure: the suite cannot pass until Task 3 exists.

- [ ] **Step 4: Commit**

```bash
git add test/contracts.test.mjs test/read.mjs
git commit -m "Add contract tests for the Blueprint design

Each assertion maps to a defect found during the dual-agent audit: dead sprite
symbols, bare 1fr tracks, aria-pressed on a single-select group, role=img over
interactive children, and reveal states that hid content when JS was off."
```

---

### Task 3: Split the prototype into production files

**Files:**
- Create: `assets/css/blueprint.css`
- Create: `assets/js/blueprint.js`
- Modify: `index.html` (full replacement)
- Delete: `assets/css/site.css`

**Interfaces:**
- Consumes: the asset paths from Task 1; `readSite()` from Task 2.
- Produces: `index.html` with ids `a001`–`a006`, `specpanel`, `spec-t`, `spec-p`, `spec-d`, `tab-engineering`, `tab-experience`, `tab-education`, `tab-modules`, and `j1`–`j4`/`p1`–`p6` detail panels. Task 4 modifies the `p4` project figure. Task 5 measures this file in a browser.

- [ ] **Step 1: Extract the stylesheet, substituting real font URLs**

```bash
SCRATCH=/private/tmp/claude-501/-Users-leleditit-Desktop-Github-ashleytzelesum-github-io/f48a849c-cccc-48af-abe0-9c37130f78fe/scratchpad/bp
mkdir -p assets/css assets/js
sed -n '3,268p' "$SCRATCH/v2.tpl.html" \
  | sed 's|__PS__|../fonts/public-sans.woff2|; s|__MONO__|../fonts/spline-sans-mono.woff2|' \
  > assets/css/blueprint.css
head -3 assets/css/blueprint.css
grep -c '__' assets/css/blueprint.css || echo "0 tokens left"
```

Lines 3–268 are the interior of the prototype's `<style>` block; line 2 is `<style>` and line 269 is `</style>`, both dropped.

Expected: the file starts with the `:root{` token block, and no `__` tokens remain.

- [ ] **Step 2: Extract the behaviour script**

```bash
SCRATCH=/private/tmp/claude-501/-Users-leleditit-Desktop-Github-ashleytzelesum-github-io/f48a849c-cccc-48af-abe0-9c37130f78fe/scratchpad/bp
sed -n '874,932p' "$SCRATCH/v2.tpl.html" > assets/js/blueprint.js
node --check assets/js/blueprint.js && echo "parses"
```

Lines 874–932 are the interior of the prototype's second `<script>` block (line 873 is `<script>`, line 933 is `</script>`).

Expected: `parses`.

- [ ] **Step 3: Assemble the production index.html**

```bash
SCRATCH=/private/tmp/claude-501/-Users-leleditit-Desktop-Github-ashleytzelesum-github-io/f48a849c-cccc-48af-abe0-9c37130f78fe/scratchpad/bp
{
cat <<'HEAD'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ashley Sum — Software Engineer</title>
<meta name="description" content="Ashley Sum, Computer Science at San Francisco State. A portfolio presented as an engineering drawing set: identity, education, experience, system modules, projects and contact.">
<meta name="author" content="Ashley Sum">
<meta name="robots" content="index, follow">
<meta name="google-site-verification" content="googlebc73ba2c4c8d6dbc">
<link rel="canonical" href="https://ashleytzelesum.com/">
<link rel="icon" href="assets/logos/ASHLEYTZELE_LOGO.png" type="image/png">
<link rel="apple-touch-icon" href="assets/logos/ASHLEYTZELE_LOGO.png">
<meta property="og:type" content="website">
<meta property="og:url" content="https://ashleytzelesum.com/">
<meta property="og:title" content="Ashley Sum — Software Engineer">
<meta property="og:description" content="A portfolio presented as an engineering drawing set. Six sheets: identity, education, experience, system modules, projects and contact.">
<meta property="og:image" content="https://ashleytzelesum.com/assets/logos/ASHLEYTZELE_LOGO.png">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="Ashley Sum — Software Engineer">
<meta name="twitter:description" content="A portfolio presented as an engineering drawing set.">
<meta name="twitter:image" content="https://ashleytzelesum.com/assets/logos/ASHLEYTZELE_LOGO.png">
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0D0D0D" media="(prefers-color-scheme: dark)">
<link rel="preload" href="assets/fonts/public-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/spline-sans-mono.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/blueprint.css">
</head>
<body>
HEAD
sed -n '271,871p' "$SCRATCH/v2.tpl.html" | sed 's|__SW__|assets/images/splitwise-dashboard.jpg|'
cat <<'FOOT'
<script src="assets/js/blueprint.js" onerror="document.documentElement.classList.remove('js')"></script>
</body>
</html>
FOOT
} > index.html
grep -c '__' index.html || echo "0 tokens left"
wc -l index.html
```

Lines 271–871 are the sprite, the `js`-class script, the `<noscript>` fallback, the skip link, the `<nav>` index and the whole `<main>` — everything between the closing `</style>` and the opening of the behaviour script.

Expected: no `__` tokens; roughly 630 lines.

- [ ] **Step 4: Remove the superseded stylesheet**

```bash
git rm assets/css/site.css
```

The old stylesheet belonged to the previous design and nothing in the new `index.html` references it. Confirm before deleting:

```bash
grep -c 'site.css' index.html || echo "not referenced — safe to remove"
```

- [ ] **Step 5: Run the full test suite**

```bash
node --test
```

Expected: PASS — all of `test/assets.test.mjs` and `test/contracts.test.mjs`.

If `every local asset referenced actually exists` fails, the `__SW__` substitution or a font path is wrong. If `no third-party requests` fails, a stray absolute URL survived from the prototype's title block.

- [ ] **Step 6: Serve and eyeball it**

```bash
python3 -m http.server 8118 &
open http://localhost:8118/
```

Confirm by eye: the cover title block renders, all six sheets draw once as you scroll, the four components on A-001 respond to click and arrow keys, and the ten `Open detail` buttons expand. Then stop the server.

- [ ] **Step 7: Commit**

```bash
git add index.html assets/css/blueprint.css assets/js/blueprint.js
git commit -m "Rebuild the portfolio as an engineering drawing set

Six sheets with a title block, exploded assembly, stack section and project
figures. Split from the prototype into cacheable css/js rather than one inlined
document. Replaces the previous single-page design."
```

---

### Task 4: Prove the media slot accepts video

The spec commits the media slot to drawn SVG, image **and** video. Five of the six project figures are drawn SVGs and the 05.4 SplitWise figure is already an `<img>` — two of the three forms are proven, video is not — and `assets/videos/splitwise-demo.mp4` already exists in the repo. This task makes the video form real so the contract is not aspirational. The swap is **image → video**: the 05.4 figure is `<img src="assets/images/splitwise-dashboard.jpg" …>` today, not a drawn SVG.

**Files:**
- Modify: `index.html` (the `05.4` SplitWise figure inside `<div class="pb">`, above `<div id="p4" class="detail">`)
- Modify: `test/contracts.test.mjs` (retire the now-vacuous img-only test, add three media-slot tests covering whichever form is present)

**Interfaces:**
- Consumes: `readSite()` from Task 2; the `.figbox` markup produced by Task 3.
- Produces: a `<video>` inside a `.figbox` that satisfies the same media-slot conditions as the SVG and image forms.

- [ ] **Step 1: Write the failing tests**

The existing test `every img declares intrinsic size and a substantive alt` becomes vacuous once this change lands — it would have zero `<img>` elements to check and no guard against an empty set. Replace it in `test/contracts.test.mjs` with:

```javascript
test('every figure slot holds exactly one medium', () => {
  const figs = html.split('<div class="figbox"').slice(1);
  assert.ok(figs.length > 0, 'expected figure slots');
  for (const f of figs) {
    const body = f.slice(0, f.indexOf('class="figcap"'));
    const n = (body.match(/<svg class="dwg"|<img\b|<video\b/g) || []).length;
    assert.equal(n, 1, `a media slot holds exactly one medium, found ${n}`);
  }
});

test('every media element declares intrinsic size and a text alternative', () => {
  const media = html.match(/<(?:img|video)\b[^>]*>/g) || [];
  assert.ok(media.length > 0, 'expected at least one img or video');
  for (const m of media) {
    assert.match(m, /\bwidth="\d+"/, `no width: ${m}`);
    assert.match(m, /\bheight="\d+"/, `no height: ${m}`);
    const alt = /(?:alt|aria-label)="([^"]*)"/.exec(m);
    assert.ok(alt && alt[1].length > 20, `text alternative too thin: ${m}`);
  }
});

test('every video satisfies the media slot contract', () => {
  const videos = html.match(/<video[^>]*>/g) || [];
  assert.ok(videos.length > 0, 'expected at least one video, to prove the slot');
  for (const v of videos) {
    assert.match(v, /\bposter="[^"]+"/, `no poster frame: ${v}`);
    assert.ok(v.includes('muted'), `must be muted: ${v}`);
    assert.ok(v.includes('controls'), `must expose controls: ${v}`);
    assert.ok(v.includes('preload="none"'), `must not preload: ${v}`);
    assert.ok(!v.includes('autoplay'), `autoplay is forbidden: ${v}`);
  }
});
```

These three cover the media-slot contract for whichever forms are present (SVG, image, video) and cannot pass on an empty document, unlike the test they replace.

- [ ] **Step 2: Run to verify it fails**

```bash
node --test test/contracts.test.mjs
```

Expected: FAIL — `every video satisfies the media slot contract` fails with `expected at least one video, to prove the slot`. The other two pass against the current img/SVG figures, which is correct — they are not new assertions about video, just a stronger replacement for the retired img-only test.

- [ ] **Step 3: Replace the 05.4 figure with the video form**

No `ffmpeg` step and no generated poster: the spec requires the poster be legible on its own, and the existing `assets/images/splitwise-dashboard.jpg` dashboard screenshot is more legible than frame zero of a screen recording (usually a blank app shell). Reusing it also keeps that asset referenced rather than orphaning it. `2916x1656` is the file's real intrinsic size (via `ffprobe`); the file has no audio track, is 9 MB, and runs 100 seconds.

In `index.html`, replace the existing `<div class="figbox" …>` block for 05.4 (an `<img>`, not an SVG) with:

```html
<div class="figbox" tabindex="0" role="group" aria-label="Figure 4, scrollable">
  <video class="fig" width="2916" height="1656"
    poster="assets/images/splitwise-dashboard.jpg"
    src="assets/videos/splitwise-demo.mp4"
    preload="none" muted controls playsinline
    aria-label="Screen recording of SplitWise Swim: a race is loaded, split times are entered, and the velocity and stroke-rate charts redraw to compare each split against the target pace."></video>
  <div class="figcap"><span>Fig. 05.4 &mdash; Performance dashboard, recorded</span><span>Live application</span></div>
</div>
```

Note the caption class is `figcap`, matching the other figures — not `cap`.

- [ ] **Step 4: Give the video the same scale floor as the other media forms**

Append to `assets/css/blueprint.css`. This applies the scale floor to all three media forms, not just video, because the contract is the same for each:

```css
/* Media slot: every form is held at the same scale floor inside the scroll
   region, so a narrow viewport pans the figure rather than shrinking it
   illegibly. No reduced-motion rule is needed: preload="none" with no autoplay
   means nothing moves until the visitor presses play. */
.figbox img,.figbox video{min-width:1000px;max-width:none;height:auto;display:block}
.figbox video{background:var(--paper)}
```

- [ ] **Step 5: Run the tests**

```bash
node --test
```

Expected: PASS, including all three replacement tests. `every local asset referenced actually exists` now also covers the mp4; no new poster file is created since the poster reuses `assets/images/splitwise-dashboard.jpg`.

- [ ] **Step 6: Check it in the browser**

```bash
python3 -m http.server 8118 &
open "http://localhost:8118/?cb=1#a005"
```

Confirm: the 05.4 figure shows the poster frame, does not play on its own, plays with controls, and the figure region still scrolls on a narrow window. Check the network panel to confirm the 9 MB mp4 is not fetched on page load. Stop the server.

Two measurement traps to watch for: the automation tab reports `visibilityState: "hidden"` during scripted browser calls, which throttles media loading and observers — a real user tab does not have this problem. And Chrome may serve a cached copy on a plain reload, so use a fresh query string.

- [ ] **Step 7: Commit**

```bash
git add index.html assets/css/blueprint.css test/contracts.test.mjs
git commit -m "Prove the media slot accepts video

The 05.4 figure is now a screen recording rather than a static screenshot, using
the same scroll region, scale floor and text alternative as the SVG and image
forms. Muted, no autoplay, poster reuses the existing dashboard screenshot,
nothing preloaded."
```

---

### Task 5: Browser measurement gate

The contract tests cover structure. Contrast, touch-target size, overflow and animation behaviour need a real layout engine. This is a single script run in a browser — no headless dependency, keeping the repo package-free.

**Files:**
- Create: `test/measure-in-browser.js`
- Create: `test/README.md`

**Interfaces:**
- Consumes: a served copy of `index.html`.
- Produces: a JSON report; the numbers go into `test/README.md` as the recorded baseline.

- [ ] **Step 1: Write the measurement script**

Create `test/measure-in-browser.js`:

```javascript
// Paste into DevTools on a served copy of the site, or run via a browser tool.
// Returns a JSON report. Every check here corresponds to a real defect from the
// dual-agent audit, and to a Global Constraint in the plan.
//
// Cache warning: load the page with a fresh query string (?cb=1). A plain
// navigation to an already-visited URL can serve a stale copy and make a fixed
// defect look unfixed.
(async () => {
  const R = {};

  // Contrast. Transitions are killed first: sampling mid-transition reports
  // colours that never actually render.
  const kill = document.createElement('style');
  kill.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}' +
    '.js .an,.js .dwg .fd{opacity:1!important}.detail{display:block!important}';
  document.body.appendChild(kill);

  const lum = c => {
    const p = c.match(/[\d.]+/g).slice(0, 3).map(Number)
      .map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
  };
  const ratio = (a, b) => { const s = [lum(a), lum(b)].sort((x, y) => y - x); return (s[0] + 0.05) / (s[1] + 0.05); };
  const bgOf = e => {
    for (let n = e; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c;
    }
    return 'rgb(255,255,255)';
  };
  const scan = () => {
    const fails = [], seen = new Set();
    let combos = 0;
    for (const e of document.querySelectorAll('*')) {
      const txt = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).length;
      if (!txt) continue;
      const s = getComputedStyle(e);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) continue;
      if (e.closest('[aria-hidden="true"]')) continue;   // decorative marks are exempt
      const fs = parseFloat(s.fontSize);
      const need = (fs >= 24 || (fs >= 18.66 && +s.fontWeight >= 700)) ? 3 : 4.5;
      const fg = s.color, bg = bgOf(e), r = ratio(fg, bg);
      const k = e.tagName + e.className + fg + bg + fs;
      if (seen.has(k)) continue;
      seen.add(k); combos++;
      if (r < need) fails.push({ el: e.tagName + '.' + String(e.className).slice(0, 16), fg, bg, r: r.toFixed(2), need });
    }
    // SVG text uses fill, not color.
    for (const t of document.querySelectorAll('.dwg text')) {
      if (t.closest('[aria-hidden="true"]')) continue;
      const r = ratio(getComputedStyle(t).fill, bgOf(t.parentElement));
      if (r < 4.5) fails.push({ el: 'svg text.' + t.getAttribute('class'), r: r.toFixed(2), need: 4.5 });
    }
    return { combos, fails };
  };
  document.documentElement.setAttribute('data-theme', 'light'); R.light = scan();
  document.documentElement.setAttribute('data-theme', 'dark');  R.dark  = scan();
  document.documentElement.removeAttribute('data-theme');
  kill.remove();

  // Reveal must not gate content.
  document.documentElement.classList.remove('js');
  R.withoutJS = {
    hidden: [...document.querySelectorAll('.an,.dwg .fd')].filter(e => getComputedStyle(e).opacity === '0').length,
    undrawn: [...document.querySelectorAll('.dwg .ln')].filter(e => {
      const d = getComputedStyle(e).strokeDashoffset; return d !== '0px' && d !== 'none';
    }).length,
  };
  document.documentElement.classList.add('js');

  // Headings must not change when the page is used.
  const outline = () => [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => h.tagName).join();
  const before = outline();
  document.querySelectorAll('[role=tab]').forEach(t => t.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  R.headingsStable = outline() === before;

  // Keyboard: roving tabindex, arrows, Home/End.
  const tabs = [...document.querySelectorAll('[role=tab]')];
  const key = (el, k) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  tabs[0].focus(); key(tabs[0], 'ArrowDown');
  R.keyboard = {
    rovingTabindex: tabs.filter(t => t.tabIndex === 0).length,        // must be 1
    arrowMovesFocus: document.activeElement === tabs[1],
    panelFollows: document.querySelector('[role=tabpanel]').getAttribute('aria-labelledby') === tabs[1].id,
  };
  key(document.activeElement, 'End');
  R.keyboard.endGoesLast = document.activeElement === tabs[tabs.length - 1];

  // Animation budget.
  window.scrollTo(0, document.body.scrollHeight); window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 2500));
  const anims = document.getAnimations();
  R.anims = {
    total: anims.length,
    infinite: anims.filter(a => { try { return a.effect.getTiming().iterations === Infinity; } catch { return false; } }).length,
    layoutProps: [...new Set(anims.flatMap(a => { try { return a.effect.getKeyframes().flatMap(Object.keys); } catch { return []; } }))]
      .filter(p => /^(width|height|top|left|right|bottom|margin|padding)/.test(p)),
  };

  // Overflow and touch targets, measured in real iframes so media queries fire.
  const at = px => new Promise(res => {
    const f = document.createElement('iframe');
    f.style.cssText = `position:fixed;left:-99999px;width:${px}px;height:900px;border:0`;
    f.src = location.pathname + '?cb=' + px;
    f.onload = () => setTimeout(() => {
      const d = f.contentDocument;
      const tg = [...d.querySelectorAll('a[href],button,[role=tab]')]
        .filter(e => e.getBoundingClientRect().height > 0);
      const small = tg.filter(e => { const r = e.getBoundingClientRect(); return r.width < 44 || r.height < 44; });
      const sz = t => { const s = t.ownerSVGElement; return parseFloat(f.contentWindow.getComputedStyle(t).fontSize) * (s.getBoundingClientRect().width / s.viewBox.baseVal.width); };
      const text = [...d.querySelectorAll('.dwg text')].map(sz).sort((a, b) => a - b);
      res({
        px,
        overflow: d.documentElement.scrollWidth > px + 1,
        targets: tg.length,
        under44: small.map(e => e.textContent.trim().slice(0, 14)),
        minDrawnText: +text[0].toFixed(1),
      });
      f.remove();
    }, 1800);
    document.body.appendChild(f);
  });
  R.responsive = [];
  for (const px of [320, 390, 768, 1024, 1440]) R.responsive.push(await at(px));

  return JSON.stringify(R, null, 1);
})();
```

- [ ] **Step 2: Run it**

```bash
python3 -m http.server 8118 &
```

Open `http://localhost:8118/?cb=1`, paste the script into the DevTools console, and copy the JSON it returns.

- [ ] **Step 3: Check the result against the constraints**

Every one of these must hold, or go back and fix before continuing:

| Field | Required |
|---|---|
| `light.fails`, `dark.fails` | `[]` |
| `withoutJS.hidden`, `withoutJS.undrawn` | `0`, `0` |
| `headingsStable` | `true` |
| `keyboard.rovingTabindex` | `1` |
| `keyboard.arrowMovesFocus`, `panelFollows`, `endGoesLast` | all `true` |
| `anims.infinite` | `0` |
| `anims.layoutProps` | `[]` |
| every `responsive[].overflow` | `false` |
| every `responsive[].under44` | `[]` |
| every `responsive[].minDrawnText` | `>= 10` |

- [ ] **Step 4: Record the baseline**

Create `test/README.md`:

```markdown
# Tests

## Contract tests — automatic

    node --test

Structural rules parsed from `index.html`, `assets/css/blueprint.css` and
`assets/js/blueprint.js`. No dependencies; Node's built-in runner.

## Measurement — manual

Contrast, touch-target size, overflow and animation behaviour need a real
layout engine, and a headless browser would be the repo's only dependency.
So this one is run by hand:

    python3 -m http.server 8118

Open `http://localhost:8118/?cb=1`, paste `test/measure-in-browser.js` into the
DevTools console, and compare the JSON against the baseline below.

**Always load with a fresh query string.** A plain reload can serve a cached
copy and make a fixed defect look unfixed.

### Baseline — <DATE>

Paste the recorded JSON here.

Required: zero contrast failures in both themes; nothing hidden with JS off;
heading outline stable under interaction; one tab stop for the component group
with working arrows and Home/End; zero infinite animations; zero layout
properties animated; no horizontal overflow and no target under 44x44 at 320,
390, 768, 1024 and 1440; smallest drawn label at least 10px at every width.
```

Replace `<DATE>` with today's date and paste the real JSON under it.

- [ ] **Step 5: Commit**

```bash
git add test/measure-in-browser.js test/README.md
git commit -m "Add browser measurement gate and record the baseline

Contrast, touch targets, overflow and animation budget measured in a real
layout engine. Run by hand so the repo stays dependency-free."
```

---

### Task 6: SEO surface and the unreferenced-asset report

**Files:**
- Modify: `sitemap.xml`
- Modify: `README.md`
- Create: `docs/unreferenced-assets.md`

**Interfaces:**
- Consumes: the finished `index.html` from Tasks 3 and 4.

- [ ] **Step 1: Update the sitemap**

Replace `sitemap.xml` with:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ashleytzelesum.com/</loc>
    <lastmod>2026-08-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

- [ ] **Step 2: Report unreferenced assets rather than deleting them**

```bash
{
echo "# Unreferenced assets"
echo
echo "Files under \`assets/\` that nothing in \`index.html\` or \`assets/css/blueprint.css\` links to,"
echo "as of $(date +%Y-%m-%d). Listed, not deleted — these are Ashley's files and removing them is her call."
echo
for f in $(find assets -type f ! -name '.DS_Store' | sort); do
  grep -q "$(basename "$f")" index.html assets/css/blueprint.css || echo "- \`$f\` ($(du -h "$f" | cut -f1))"
done
} > docs/unreferenced-assets.md
cat docs/unreferenced-assets.md
```

Expect this to list the previous design's images (`hero-image.jpg`, `about-image.jpg`, `nba-game-screenshot.png`, `splitwise-screenshot.png`), the PNG social logos superseded by the inline sprite, and `assets/videos/nba-demo.mp4`. **Do not delete any of them.** Report the list and let Ashley decide.

- [ ] **Step 3: Rewrite the README**

Replace `README.md` with:

```markdown
# ashleytzelesum.com

Personal portfolio for Ashley Sum, presented as an engineering drawing set:
a title block and six numbered sheets covering identity, education, experience,
system modules, projects and contact.

Static site on GitHub Pages. No build step, no dependencies, no framework.

## Layout

    index.html                        markup, plus the inline icon sprite
    assets/css/blueprint.css          the whole stylesheet
    assets/js/blueprint.js            scroll reveal, component tabs, disclosures
    assets/fonts/                     Public Sans and Spline Sans Mono (OFL 1.1)
    assets/images/                    figure media
    assets/documents/                 résumé
    docs/superpowers/specs/           design spec
    docs/superpowers/plans/           implementation plan
    test/                             contract tests and the measurement gate

## Running it

    python3 -m http.server 8118

Then open <http://localhost:8118/>.

## Tests

    node --test

Plus a manual browser measurement pass — see `test/README.md`.

## Changing content

Every fact on the page lives in a named slot with a fixed shape. The shapes are
specified in `docs/superpowers/specs/2026-08-06-blueprint-portfolio-design.md`;
the contract tests enforce them. A figure can be a drawn SVG, an image or a
video, and swapping one for another is a change inside the slot alone.

Sheet numbers `A-001`–`A-006` are load-bearing: the index, the anchors and the
cross-references inside the drawings all depend on them.

## Credits

Fonts: Public Sans and Spline Sans Mono, SIL OFL 1.1 — see `assets/fonts/OFL.txt`.
Icons: Simple Icons, CC0 1.0, inlined as an SVG sprite.
```

- [ ] **Step 4: Run the full suite once more**

```bash
node --test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add sitemap.xml README.md docs/unreferenced-assets.md
git commit -m "Update sitemap and README for the drawing-set portfolio

Also records which of the previous design's assets are now unreferenced,
without deleting them."
```

---

### Task 7: Deploy and verify live

**Files:** none — this task pushes and checks.

- [ ] **Step 1: Confirm the git identity is Ashley's, not an employer account**

```bash
git config user.name; git config user.email; gh auth status 2>&1 | grep -i 'logged in'
```

Expected: `Ashley Sum`, and `gh` logged in as **ashleytzele**. If it shows `ospit-intern` or any other account, stop and switch before pushing.

- [ ] **Step 2: Review the whole diff**

```bash
git log --oneline main..HEAD
git diff --stat main@{u}..HEAD
```

- [ ] **Step 3: Push**

```bash
git push origin main
```

- [ ] **Step 4: Wait for Pages, then verify the live site**

```bash
sleep 90
curl -sI https://ashleytzelesum.com/ | head -3
for p in assets/css/blueprint.css assets/js/blueprint.js \
         assets/fonts/public-sans.woff2 assets/fonts/spline-sans-mono.woff2 \
         assets/images/splitwise-dashboard.jpg assets/videos/splitwise-demo.mp4 \
         assets/documents/Ashley-Sum-Resume.pdf; do
  printf '%-46s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' "https://ashleytzelesum.com/$p")"
done
```

Expected: `200` for every path. A `404` on a font or the stylesheet means a path is wrong relative to the deployed root.

- [ ] **Step 5: Verify the résumé PDF actually opens**

```bash
curl -s https://ashleytzelesum.com/assets/documents/Ashley-Sum-Resume.pdf -o /tmp/live-resume.pdf
python3 -c "
d=open('/tmp/live-resume.pdf','rb').read()
print('bytes', len(d))
print('starts with %PDF:', d[:4] == b'%PDF')
print('has a page tree:', b'/Kids' in d)"
```

Expected: all three true. The previously published PDF had no `/Kids` and would not open in Chrome — this check exists because that shipped once already.

- [ ] **Step 6: Run the measurement gate against the live site**

Open `https://ashleytzelesum.com/?cb=1`, paste `test/measure-in-browser.js`, and confirm the numbers match the baseline in `test/README.md`. Differences here but not locally mean a caching or path problem, not a design problem.

- [ ] **Step 7: Re-run the anti-pattern detector on the deployed markup**

```bash
curl -s https://ashleytzelesum.com/ -o /tmp/live-index.html
node /Users/leleditit/.claude/plugins/cache/impeccable/impeccable/3.9.1/skills/impeccable/scripts/detect.mjs --json /tmp/live-index.html
```

Expected: `[]`, or the single known-advisory `numbered-section-markers`, which is a verified false positive — the `01 02 03 04` are balloon callouts on the assembly drawing. Any other finding is real and must be fixed.

---

## Self-Review

**Spec coverage.** Walked each spec section against the tasks:

| Spec section | Covered by |
|---|---|
| Document Structure | Task 3 (sheets ship intact); contract test on `role="tab"` count |
| Sheet / Record / Project slots | Task 3; heading, placeholder and `aria-controls` tests |
| Media slot | Task 4 (all three forms covered by a shared one-medium and size/alt test, video also checked against its five extra conditions: poster, muted, controls, preload, no autoplay) |
| Component slot | Task 3; the tablist/tabpanel and `aria-pressed` tests |
| Field slot | Task 3 — no separate test; it is markup shape, caught by eye in Task 3 Step 6 |
| Icon slot | Task 2 dead-symbol and `aria-hidden` tests |
| Palette / Typography | Task 1 (fonts); Task 2 hex-outside-theme test |
| Drawing vocabulary / Layout | Task 3; the bare-`1fr` test guards the one layout rule that broke |
| Motion System | Task 2 js-guard test; Task 5 animation budget |
| Accessibility Contract | Task 2 structure; Task 5 contrast, keyboard, targets |
| Performance Contract | Task 1 Step 1 (corrected); Task 2 third-party and dead-asset tests |
| Deliberate Departures | Task 2 forbidden-effects and emoji tests |

Two spec items have no automated test and are checked by eye instead, which I am flagging rather than pretending otherwise: **print output** (Task 3 Step 6 — worth an explicit print-preview) and **"the set reads as one document"**, which is a judgement, not an assertion.

**Placeholder scan.** `WIDTH`/`HEIGHT` in Task 4 Step 4 and `<DATE>` in Task 5 Step 4 are the only substitutions, and each is produced by the immediately preceding step rather than left to the implementer's judgement.

**Type consistency.** `readSite()` is defined in Task 2 Step 1 and consumed by Tasks 2 and 4 under the same name, returning `{html, css, js}` in both. Asset paths written in Task 1 match the ones substituted in Task 3 Step 1 and Step 3, and the ones asserted by `every local asset referenced actually exists`. The ids listed in Task 3's Produces block are the ones Task 4 and Task 5 address.

**One known gap.** None remaining for Task 4 — it reuses the existing `assets/images/splitwise-dashboard.jpg` as the poster rather than generating one with `ffmpeg`, so it has no external tool dependency. Tasks 5–7 do not depend on Task 4 and can proceed independently either way.
