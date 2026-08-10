import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
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

test('A-001 assembly exposes one semantic component control set', () => {
  const a001 = html.slice(html.indexOf('id="a001"'), html.indexOf('id="a002"'));
  assert.equal((a001.match(/role="tablist"/g) || []).length, 1);
  assert.equal((a001.match(/role="tab"/g) || []).length, 4);
  assert.equal((a001.match(/role="tabpanel"/g) || []).length, 1);
  assert.ok(a001.includes('class="assembly"'));
  assert.ok(!/role="img"[\s\S]{0,4000}role="tab"/.test(a001));
});

test('component group uses tab semantics, not aria-pressed', () => {
  // Scoped to the A-001 assembly, not the whole document: the theme toggle
  // elsewhere on the page legitimately uses aria-pressed (it is a two-state
  // toggle button, not a single-select group), so a document-wide ban would
  // be checking the wrong thing.
  const a001 = html.slice(html.indexOf('id="a001"'), html.indexOf('id="a002"'));
  assert.ok(!a001.includes('aria-pressed'), 'single-select group must not use aria-pressed');
  assert.equal((a001.match(/role="tablist"/g) || []).length, 1);
  assert.ok((a001.match(/role="tab"/g) || []).length >= 1);
  assert.equal((a001.match(/role="tabpanel"/g) || []).length, 1);
});

test('A-001 component controls, SPEC records, default state and dimension agree', () => {
  const a001 = html.slice(html.indexOf('id="a001"'), html.indexOf('id="a002"'));
  const tabs = [...a001.matchAll(/<button[^>]*role="tab"[^>]*data-part="([a-z]+)"[^>]*>/g)];
  const dataParts = tabs.map(m => m[1]);
  assert.deepEqual(dataParts, ['background', 'now', 'engineering', 'athletics']);

  const selected = tabs.filter(m => m[0].includes('aria-selected="true"'));
  assert.equal(selected.length, 1);
  assert.equal(selected[0][1], 'now');
  assert.ok(selected[0][0].includes('tabindex="0"'));

  const specBlock = /var SPEC=\{([\s\S]*?)\n  \};/.exec(js);
  assert.ok(specBlock, 'expected a SPEC object in blueprint.js');
  const specKeys = [...specBlock[1].matchAll(/^\s*([a-zA-Z]+):\{/gm)].map(m => m[1]);
  assert.deepEqual(specKeys, dataParts);

  const label = /(\d+)\s+COMPONENTS</.exec(a001);
  assert.ok(label);
  assert.equal(Number(label[1]), dataParts.length);
  assert.match(a001, /id="specpanel"[\s\S]*aria-labelledby="tab-now"/);
});

test('A-001 states background, present activity, direction and availability without interaction', () => {
  const a001 = html.slice(html.indexOf('id="a001"'), html.indexOf('id="a002"'));
  assert.match(a001, /class="ident[^>]*>[\s\S]*Overview/);
  assert.match(a001, /From Malaysia to San Francisco/);
  assert.match(a001, /Student Lead in Aquatics/);
  assert.match(a001, /systems, interfaces and physical operations/);
  assert.match(a001, /<dt>Availability<\/dt><dd>Summer 2027<\/dd>/);
  assert.doesNotMatch(a001, /<dt>Status<\/dt>/);
  assert.doesNotMatch(a001, /Software Engineering Intern\s*&middot;\s*available/);
});

test('A-001 assembly does not inherit the panning drawing contract', () => {
  const a001 = html.slice(html.indexOf('id="a001"'), html.indexOf('id="a002"'));
  assert.ok(!a001.includes('class="dwgbox"'));
  assert.doesNotMatch(css, /#a001\s+\.dwgbox\s+svg/);
});

test('theme toggle is a real button with an accessible name that says what it does', () => {
  const tag = /<button[^>]*id="themeToggle"[^>]*>/.exec(html);
  assert.ok(tag, 'expected a <button id="themeToggle">, not a div/checkbox');
  assert.match(tag[0], /aria-pressed="(?:true|false)"/, 'must report its state to assistive tech');
  const name = /aria-label="([^"]+)"/.exec(tag[0]);
  assert.ok(name, 'expected an aria-label on the theme toggle');
  assert.doesNotMatch(name[1], /^(toggle|button|click)$/i, `accessible name too thin: "${name[1]}"`);
  assert.match(name[1], /theme|dark|light/i, `accessible name does not say what the control does: "${name[1]}"`);
});

test('the stored theme is applied by the inline script, not the external one', () => {
  const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  assert.ok(inlineScripts.length > 0, 'expected an inline <script> in <body>');
  const inline = inlineScripts.join('\n');
  assert.match(inline, /localStorage/, 'inline script must read the stored theme before paint');
  assert.match(inline, /setAttribute\(\s*['"]data-theme['"]/,
    'inline script must apply data-theme itself — applying it from the external script would flash the wrong theme first');
  assert.ok(!/getItem\(\s*['"]theme['"]\s*\)/.test(js),
    'assets/js/blueprint.js must not read the stored theme itself: it is a separate request and loads after paint');
});

test('localStorage access around the theme toggle is guarded with try/catch', () => {
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
  assert.match(inline, /try\s*\{[\s\S]*?localStorage[\s\S]*?\}\s*catch/,
    'inline localStorage read must be wrapped in try/catch (Safari private browsing throws)');
  assert.match(js, /try\s*\{[\s\S]*?localStorage[\s\S]*?\}\s*catch/,
    'blueprint.js localStorage write must be wrapped in try/catch (Safari private browsing throws)');
});

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

test('no .figbox media rule (img/video) uses a min-width floor', () => {
  // min-width plus max-width:none is a safe 1:1 floor only for SVG, whose
  // intrinsic width is always its viewBox (1000). A raster or a video carries
  // its true pixel size, so the same idiom uncaps it — this rendered a
  // 2916px-wide video at 2916px on every viewport (FIX 1).
  const rules = css.match(/\.figbox[^{]*\{[^}]*\}/g) || [];
  const mediaRules = rules.filter(r => /\b(img|video)\b/.test(r.split('{')[0]));
  assert.ok(mediaRules.length > 0, 'expected .figbox img/video rules to exist');
  for (const r of mediaRules) {
    assert.ok(!r.includes('min-width'), `min-width floor on raster/video rule: ${r}`);
  }
});

test('every video declares an aspect-ratio, to prevent layout shift on metadata load', () => {
  const videos = html.match(/<video\b[^>]*>/g) || [];
  assert.ok(videos.length > 0, 'expected at least one video, to prove the check');
  for (const v of videos) {
    assert.match(v, /aspect-ratio\s*:\s*[\d.]+\s*\/\s*[\d.]+/, `no aspect-ratio: ${v}`);
  }
});

test('A-001 keeps project inventory claims on the projects sheet', () => {
  const a001 = html.slice(html.indexOf('id="a001"'), html.indexOf('id="a002"'));
  const engineering = /engineering:\{([^}]*)\}/.exec(js);
  assert.ok(engineering, 'expected an engineering record in SPEC');
  assert.doesNotMatch(a001, /<dt>(?:Projects|Public)<\/dt>/);
  assert.doesNotMatch(a001, /\d+\s+public/i);
  assert.doesNotMatch(engineering[1], /\['(?:Projects|Public)'/);
});

test('test/ contains no browser-only scripts', () => {
  // Node's runner sweeps every .js/.mjs under a directory named test/, whatever
  // it is called. A browser-only script placed here throws on `document` and
  // makes the suite permanently red, which trains everyone to ignore red runs.
  // Browser scripts live in tools/.
  const stray = readdirSync('test')
    .filter(f => /\.(js|cjs|mjs)$/.test(f))
    .filter(f => /\bdocument\.|\bwindow\.|getComputedStyle\(/.test(readFileSync(`test/${f}`, 'utf8')));
  assert.deepEqual(stray, [], 'browser-only scripts belong in tools/, not test/');
});

test('no client-identifying term appears in any tracked file', () => {
  // The terms live in .confidential-terms, which is gitignored. They are NOT
  // listed here on purpose: writing them into a tracked file is precisely the
  // leak this test exists to catch, and a previous version of test/README.md
  // did exactly that while documenting the check.
  //
  // Scans every tracked text file, not just index.html — the leak that
  // prompted this test was in a README and two planning documents.
  if (!existsSync('.confidential-terms')) {
    // Skip loudly rather than pass silently: a missing list is not a clean repo.
    console.log('  SKIPPED: .confidential-terms not present, cannot check');
    return;
  }
  const terms = readFileSync('.confidential-terms', 'utf8')
    .split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
  assert.ok(terms.length > 0, 'term list is empty');

  const tracked = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);
  const hits = [];
  for (const file of tracked) {
    if (/\.(png|jpe?g|gif|mp4|woff2?|pdf|ico)$/i.test(file)) continue; // binaries: byte runs give false positives
    let text;
    try { text = readFileSync(file, 'utf8'); } catch { continue; }
    const lower = text.toLowerCase();
    for (const term of terms) {
      if (lower.includes(term.toLowerCase())) hits.push(`${file} contains a listed term`);
    }
  }
  assert.deepEqual(hits, [], 'client-identifying terms found in tracked files');
});

test('the cover Updated date matches the last change to the site', () => {
  // A revision date that drifts is worse than none: it states a fact about the
  // document that stops being true the next time anything ships. This ties it to
  // the last commit touching the three files a visitor actually receives, so the
  // suite says "update the cover" rather than letting it quietly rot.
  const shown = /<span class="k">Updated<\/span><span class="v">([\d-]+)<\/span>/.exec(html);
  assert.ok(shown, 'expected an Updated field in the cover title block');
  let last;
  try {
    last = execSync(
      'git log -1 --format=%ad --date=short -- index.html assets/css/blueprint.css assets/js/blueprint.js',
      { encoding: 'utf8' }
    ).trim();
  } catch {
    console.log('  SKIPPED: no git history available');
    return;
  }
  if (!last) { console.log('  SKIPPED: no commits touching site files yet'); return; }
  assert.equal(shown[1], last,
    `cover says Updated ${shown[1]}, but the site last changed on ${last}`);
});
