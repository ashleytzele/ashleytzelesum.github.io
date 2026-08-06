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
