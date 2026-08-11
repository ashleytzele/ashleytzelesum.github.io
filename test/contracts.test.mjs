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

test('reveal is gated only after successful runtime initialization', () => {
  // The early `js` marker is only safe for optional controls. Reveal gating is
  // earned later, after the fetched runtime has initialized successfully.
  assert.match(css, /\.runtime-ready\s+\.an\s*\{[^}]*opacity:\s*0/);
  assert.doesNotMatch(css, /\.js\s+\.an\s*\{[^}]*opacity:\s*0/);
  assert.match(html, /<noscript>/);
  assert.match(html, /document\.documentElement\.className\s*\+=\s*" js"/);
});

test('A-001 reveal keeps controls visible and draws only construction details', () => {
  assert.doesNotMatch(css, /(?:\.js|\.runtime-ready)\s+#a001\s+\.part\s*\{[^}]*opacity:\s*0/);
  assert.match(css, /\.runtime-ready\s+#a001\s+\.part-body::after\s*\{[^}]*clip-path:/);
  assert.match(css, /#a001\.drawn\s+\.part-body::after\s*\{[^}]*animation:/);
  assert.match(css, /#a001\.drawn\s+\.part-body::before\s*\{[^}]*animation:/);
  assert.match(css, /#a001\.drawn\s+\.assembly-axis\{/);
  assert.match(css, /#a001\s+\.part:focus-visible\s+\.part-desc[^}]*opacity:\s*1/);
  assert.doesNotMatch(css, /\.drawn\s+#a001/);
});

test('scrollable regions are keyboard reachable and labelled', () => {
  const boxes = html.match(/<div class="(figbox|dwgbox)"[^>]*>/g) || [];
  assert.ok(boxes.length > 0, 'expected scrollable figure regions');
  for (const box of boxes) {
    assert.ok(box.includes('tabindex="0"'), `not focusable: ${box}`);
    assert.ok(box.includes('aria-label='), `not labelled: ${box}`);
  }
});

test('A-001 ships one static component set for progressive enhancement', () => {
  const a001 = html.slice(html.indexOf('id="a001"'), html.indexOf('id="a002"'));
  assert.equal((a001.match(/class="assembly-tabs"/g) || []).length, 1);
  assert.equal((a001.match(/class="part(?:\s|\")/g) || []).length, 4);
  assert.ok(a001.includes('class="assembly"'));
  assert.doesNotMatch(a001, /role="(?:tablist|tab|tabpanel)"/,
    'no-JS markup must not advertise a tab widget with no controller');
  assert.doesNotMatch(a001, /\btabindex="-?\d+"/,
    'tab stops are added atomically by the runtime');
});

test('A-001 component controls, SPEC records, default state and dimension agree', () => {
  const a001 = html.slice(html.indexOf('id="a001"'), html.indexOf('id="a002"'));
  const tabs = [...a001.matchAll(/<div[^>]*class="part(?:\s[^\"]*)?"[^>]*data-part="([a-z]+)"[^>]*>/g)];
  const dataParts = tabs.map(m => m[1]);
  assert.deepEqual(dataParts, ['background', 'now', 'engineering', 'athletics']);

  const selected = tabs.filter(m => m[0].includes('data-selected="true"'));
  assert.equal(selected.length, 1);
  assert.equal(selected[0][1], 'now');

  const specBlock = /var SPEC=\{([\s\S]*?)\n\s*\};/.exec(js);
  assert.ok(specBlock, 'expected a SPEC object in blueprint.js');
  const specKeys = [...specBlock[1].matchAll(/^\s*([a-zA-Z]+):\{/gm)].map(m => m[1]);
  assert.deepEqual(specKeys, dataParts);

  const label = /(\d+)\s+COMPONENTS</.exec(a001);
  assert.ok(label);
  assert.equal(Number(label[1]), dataParts.length);
  assert.match(a001, /id="specpanel"/);
});

test('every A-001 SPEC record matches the approved title, paragraph and fields', () => {
  const block = /var SPEC=(\{[\s\S]*?\n\s*\});/.exec(js);
  assert.ok(block, 'expected a SPEC object in blueprint.js');
  const actual = new Function(`return ${block[1]}`)();
  assert.deepEqual(actual, {
    background: {
      t: 'Background',
      p: 'From Malaysia, through INTI International College, to San Francisco State, where I am pursuing a B.S. in Computer Science.',
      d: [['Ref drawing', 'A-002'], ['From', 'Malaysia'], ['Previous', 'INTI International College']],
    },
    now: {
      t: 'Now',
      p: 'I am studying Computer Science at San Francisco State and working as a Student Lead in Aquatics, with software engineering experience across systems, interfaces and physical operations.',
      d: [['Studying', 'B.S. Computer Science'], ['Current', 'Student Lead, Aquatics'], ['Seeking', 'Summer 2027 software engineering internship']],
    },
    engineering: {
      t: 'Engineering',
      p: 'I am interested in software that connects systems, interfaces and physical operations, with a focus on making complicated tools usable by the people who depend on them.',
      d: [['Ref drawings', 'A-004 · A-005'], ['Experience', 'Backend · full stack · mobile'], ['Focus', 'Systems · operability']],
    },
    athletics: {
      t: 'Athletics',
      p: 'Competitive swimming provides the domain knowledge behind SplitWise, while lifeguarding and aquatics work bring a different kind of operational responsibility outside software.',
      d: [['Ref drawings', 'A-003 · 05.6'], ['Discipline', 'Swimming'], ['Applied in', 'SplitWise · 05.6']],
    },
  });
});

const section = (start, end) => html.slice(html.indexOf(start), html.indexOf(end));

test('A-002 is consistently named Education while preserving its drawing identity', () => {
  const a002 = section('id="a002"', 'id="a003"');
  const readme = readFileSync('README.md', 'utf8');
  assert.match(html, /identity, education, experience, engineering, projects and contact/i);
  assert.match(html, /<a href="#a002">[\s\S]*<span class="t">Education<\/span>/);
  assert.match(a002, /<b>Drawing A-002<\/b>[\s\S]*<span>Education<\/span>/);
  assert.match(a002, /<h2>Education<\/h2>/);
  assert.doesNotMatch(a002, />Journey/);
  assert.match(readme, /A-002 Education/);
  assert.doesNotMatch(readme, /A-002 Journey/);
  assert.match(a002, /id="a002"/);
});

test('A-002 contains exactly the approved ordered education route', () => {
  const a002 = section('id="a002"', 'id="a003"');
  assert.equal((a002.match(/<article[^>]*class="education-node/g) || []).length, 2);
  const edu01 = a002.indexOf('data-education="edu-01"');
  const edu02 = a002.indexOf('data-education="edu-02"');
  assert.notEqual(edu01, -1, 'EDU-01 record is required');
  assert.notEqual(edu02, -1, 'EDU-02 record is required');
  assert.ok(edu01 < edu02, 'EDU-01 must precede EDU-02');
  assert.match(a002, /<article[^>]*data-education="edu-01"[^>]*>[\s\S]*?<span>EDU-01 &middot; Previous<\/span>/);
  assert.match(a002, /<article[^>]*data-education="edu-02"[^>]*>[\s\S]*?<span>EDU-02 &middot; Current<\/span>/);
  for (const value of [
    'INTI International College Subang',
    'Subang Jaya, Malaysia',
    'Aug 2023&ndash;Dec 2024',
    'American Degree Transfer Program, Applied Science',
    'Programme completed before transfer to San Francisco State University.',
    'Transferred',
    'Dec 2024',
    'Jan 2025',
    'San Francisco State University',
    'San Francisco, California',
    'Jan 2025&ndash;Present',
    'Bachelor of Science, Computer Science',
    'Fig. A-002.1 &mdash; Academic transition',
    'Professional experience',
    'A-003',
  ]) assert.ok(a002.includes(value), `missing approved A-002 copy: ${value}`);
  assert.match(a002, /<div class="education-transfer">\s*<strong>Transferred<\/strong><span>Dec 2024 <span aria-hidden="true">&rarr;<\/span> Jan 2025<\/span>\s*<\/div>/);
});

test('A-002 route accessible description covers both records and the transfer interval', () => {
  const a002 = section('id="a002"', 'id="a003"');
  const route = /<div class="education-route" role="group" aria-label="([^"]+)">/.exec(a002);
  assert.ok(route, 'education route needs an accessible group name');
  assert.equal(route[1], 'Academic route: INTI International College Subang, Aug 2023&ndash;Dec 2024, American Degree Transfer Program, Applied Science; transferred Dec 2024&ndash;Jan 2025; San Francisco State University, Jan 2025&ndash;Present, Bachelor of Science, Computer Science.');
  for (const value of [
    'INTI International College Subang',
    'Aug 2023&ndash;Dec 2024',
    'American Degree Transfer Program, Applied Science',
    'Dec 2024&ndash;Jan 2025',
    'San Francisco State University',
    'Jan 2025&ndash;Present',
    'Bachelor of Science, Computer Science',
  ]) assert.ok(route[1].includes(value), `accessible description missing: ${value}`);
});

test('A-002 stays education-only and ships one noninteractive semantic record set', () => {
  const a002 = section('id="a002"', 'id="a003"');
  assert.equal((a002.match(/data-education=/g) || []).length, 2);
  assert.equal((a002.match(/class="education-route/g) || []).length, 1);
  assert.match(a002, /<article[^>]*class="education-node/);
  assert.doesNotMatch(a002, /role="(?:tab|tabpanel|button)"|<button|tabindex=/);
  assert.doesNotMatch(a002, /Dean|GPA|graduat|coursework|Data Structures|Lifeguard|Student Lead|Zengo|OSPIT|swimming/i);
});

test('A-002 essential records are not hidden by the runtime gate', () => {
  assert.doesNotMatch(css, /\.runtime-ready\s+#a002\s+\.education-node\s*\{[^}]*opacity:\s*0/);
  assert.doesNotMatch(css, /\.runtime-ready\s+#a002\s+\.education-transfer\s*\{[^}]*opacity:\s*0/);
});

test('A-002 uses one responsive route with attached drawing nodes', () => {
  assert.match(css, /#a002\s+\.education-route\s*\{[^}]*display:\s*grid/);
  assert.match(css, /#a002\s+\.education-route::before\s*\{[^}]*border-top:/);
  assert.match(css, /#a002\s+\.education-node-current\s*\{[^}]*border-width:\s*2px/);
  assert.match(css, /@media\(max-width:720px\)[\s\S]*#a002\s+\.education-route\s*\{[^}]*grid-template-columns:\s*minmax\(0,1fr\)/);
  assert.match(css, /@media\(max-width:720px\)[\s\S]*#a002\s+\.education-route::before\s*\{[^}]*border-left:/);
  assert.doesNotMatch(css, /#a002[^}]*overflow-x:\s*auto/);
});

test('A-002 phone transfer annotation shares the datum geometry', () => {
  const phone = /@media\(max-width:720px\)\{([\s\S]*?)\n\}/.exec(css);
  assert.ok(phone, 'expected A-002 phone styles');
  const transfer = /#a002\s+\.education-transfer\s*\{([^}]*)\}/.exec(phone[1]);
  const tick = /#a002\s+\.education-transfer::before\s*\{([^}]*)\}/.exec(phone[1]);
  const arrow = /#a002\s+\.education-transfer::after\s*\{([^}]*)\}/.exec(phone[1]);
  assert.ok(transfer && tick && arrow, 'expected transfer annotation, tick and arrow rules');
  assert.match(transfer[1], /justify-self:\s*stretch/);
  assert.match(transfer[1], /margin-left:\s*0/);
  assert.match(transfer[1], /padding:\s*calc\(var\(--u\)\*2\)\s+10px/);
  assert.match(tick[1], /left:\s*-25px/);
  assert.match(tick[1], /width:\s*25px/);
  assert.match(tick[1], /border-top:\s*1px\s+solid\s+var\(--ink\)/);
  assert.match(arrow[1], /left:\s*-29px/);
  assert.match(arrow[1], /border-top:\s*8px\s+solid\s+var\(--ink\)/);
  assert.doesNotMatch(transfer[1], /margin-left:\s*-/);
});

test('A-002 factual labels use the readable mono floor and factual tokens', () => {
  for (const selector of ['education-node-meta', 'education-place', 'education-transfer', 'education-caption']) {
    const rule = new RegExp(`#a002\\s+\\.${selector}[^}]*\\{([^}]*)\\}`).exec(css);
    assert.ok(rule, `missing ${selector} rule`);
    const size = /font-size:\s*([\d.]+)px/.exec(rule[1]);
    assert.ok(size && Number(size[1]) >= 8.5, `${selector} below 8.5px`);
    assert.doesNotMatch(rule[1], /color:\s*var\(--(?:refdec|line)\)/,
      `${selector} must not use a decorative low-contrast token`);
  }
});

test('A-002 reveal animates decoration only and completes for reduced motion and print', () => {
  assert.doesNotMatch(css, /\.runtime-ready\s+#a002\s+\.education-node\s*\{[^}]*opacity:\s*0/);
  assert.match(css, /\.runtime-ready\s+#a002\s+\.education-route::before\s*\{[^}]*transform:/);
  assert.match(css, /#a002\.drawn\s+\.education-route::before\s*\{[^}]*animation:/);
  const completedDecoration = /\.runtime-ready\s+#a002\s+\.education-route::before,\s*\.runtime-ready\s+#a002\s+\.education-node::before,\s*\.runtime-ready\s+#a002\s+\.education-node::after\s*\{[^}]*transform:\s*none[^}]*animation:\s*none/;
  const reduced = /@media\(prefers-reduced-motion:reduce\)\{([\s\S]*?)\n\}/.exec(css);
  const print = /@media print\{([\s\S]*?)\n\}/.exec(css);
  assert.ok(reduced, 'expected reduced-motion styles');
  assert.ok(print, 'expected print styles');
  assert.match(reduced[1], completedDecoration,
    'reduced motion must complete the A-002 datum and both node ports');
  assert.match(print[1], completedDecoration,
    'print must complete the A-002 datum and both node ports');
});

test('A-003 contains the approved builder and operator tracks in reading order', () => {
  const a003 = section('id="a003"', 'id="a004"');
  assert.match(a003, /<h2>Experience<\/h2>/);
  assert.ok(a003.includes('Building technical systems and operating real environments&mdash;across software, facilities, safety, and team coordination.'));
  assert.equal((a003.match(/class="experience-track"/g) || []).length, 2);
  assert.equal((a003.match(/class="experience-track-list"/g) || []).length, 2);
  assert.equal((a003.match(/class="experience-role/g) || []).length, 4);
  const order = ['Software / Systems', 'exp-01', 'exp-02', 'Operations / Aquatics', 'exp-03', 'exp-04']
    .map(value => a003.indexOf(value));
  order.forEach((value, index) => assert.notEqual(value, -1, `missing A-003 item ${index}`));
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  assert.equal((a003.match(/<ol class="experience-track-list" role="list">/g) || []).length, 2);
  assert.equal((a003.match(/<h3 class="experience-track-title" id="(?:software|operations)-track-title">/g) || []).length, 2);
  assert.equal((a003.match(/<h4>/g) || []).length, 4);
});

test('A-003 tracks retain explicit list semantics and title-only accessible names', () => {
  const a003 = section('id="a003"', 'id="a004"');
  const lists = [...a003.matchAll(/<ol class="experience-track-list"([^>]*)>/g)];
  assert.equal(lists.length, 2);
  assert.deepEqual(lists.map(list => list[1].trim()), ['role="list"', 'role="list"']);

  for (const [id, title, label] of [
    ['software-track-title', 'Software / Systems', 'Builder track'],
    ['operations-track-title', 'Operations / Aquatics', 'Operator track'],
  ]) {
    assert.match(a003, new RegExp(`<section class="experience-track" aria-labelledby="${id}">\\s*<div class="experience-track-head"><h3 class="experience-track-title" id="${id}">${title}</h3><span>${label}</span>`));
    assert.doesNotMatch(a003, new RegExp(`<div class="experience-track-head" id="${id}">`));
  }
});

test('A-003 contains exactly the approved role facts and handoffs', () => {
  const a003 = section('id="a003"', 'id="a004"');
  for (const value of [
    'EXP-01 &middot; Previous', 'Jun&ndash;Sep 2024', 'IT Support', 'Zengo Corporation', 'Malaysia',
    'Supported internal users and enterprise systems, and built an inventory application that automated stock calculations.',
    'Inventory tracking &middot; Support + troubleshooting', 'Scope &amp; output',
    'EXP-02 &middot; Internship', 'Jun&ndash;Aug 2026', 'Software Engineering Intern', 'OSPIT Mobility',
    'Technical / R&amp;D', 'Solved five software and systems-integration problems spanning equipment identity, offline maps, printing, and mobile applications.',
    '5 workstreams &middot; Drawings 05.1&ndash;05.3', 'Project evidence &rarr; A-005', 'Scope &amp; results',
    'EXP-03 &middot; Previous', 'Aug 2025&ndash;Mar 2026', 'Lifeguard', 'Mashouf Wellness Center',
    'San Francisco, California', 'Protected patron safety through active surveillance, facility checks, and emergency readiness on the pool deck.',
    'Lifeguarding &middot; CPR &middot; AED &middot; First Aid', 'Operational responsibility',
    'EXP-04 &middot; Current', 'Apr 2026&ndash;Present', 'Student Lead, Aquatics', 'SFSU Campus Recreation',
    'Coordinates student staff and daily aquatics operations while supporting facility management and enforcing safety standards.',
    'Staff &middot; Safety &middot; Facility operations', 'Leadership &amp; operations',
    'Concurrent responsibility', 'Student Lead + OSPIT &middot; Jun&ndash;Aug 2026',
    'Fig. A-003.1 &mdash; Builder + operator tracks', 'Engineering &rarr; A-004', 'Projects &rarr; A-005',
  ]) assert.ok(a003.includes(value), `missing approved A-003 copy: ${value}`);
  assert.doesNotMatch(a003, /\bPromoted\b/i);
  assert.doesNotMatch(a003, /role="(?:tablist|tab|tabpanel)"/);
  assert.doesNotMatch(a003, /<svg|class="figbox"/);
});

test('every A-003 role owns exactly one native fail-open detail', () => {
  const a003 = section('id="a003"', 'id="a004"');
  assert.equal((a003.match(/class="experience-more"/g) || []).length, 4);
  assert.equal((a003.match(/class="experience-detail"/g) || []).length, 4);
  for (const id of ['exp-01', 'exp-02', 'exp-03', 'exp-04']) {
    const role = new RegExp(`<article[^>]*data-experience="${id}"[\\s\\S]*?<button[^>]*class="experience-more"[^>]*aria-controls="${id}-detail"[^>]*aria-expanded="true"[\\s\\S]*?<div[^>]*class="experience-detail"[^>]*id="${id}-detail"[^>]*data-open="true"`).exec(a003);
    assert.ok(role, `${id} must own its matching visible detail and control`);
  }
  assert.equal((a003.match(/aria-controls="exp-0[1-4]-detail"/g) || []).length, 4);
});

test('A-003 defaults complete and earns collapsed details only after runtime success', () => {
  assert.match(css, /#a003\s+\.experience-more\s*\{[^}]*display:\s*none/);
  assert.match(css, /#a003\s+\.experience-detail\s*\{[^}]*display:\s*block/);
  assert.match(css, /\.runtime-ready\s+#a003\s+\.experience-more\s*\{[^}]*display:\s*flex/);
  assert.match(css, /\.runtime-ready\s+#a003\s+\.experience-detail\s*\{[^}]*display:\s*none/);
  assert.match(css, /\.runtime-ready\s+#a003\s+\.experience-detail\[data-open="true"\]\s*\{[^}]*display:\s*block/);
  assert.match(js, /querySelectorAll\('#a003 \.experience-more'\)/);
  assert.match(js, /setAttribute\('aria-expanded',String\(open\)\)/);
  assert.match(js, /root\.classList\.add\('runtime-ready'\)/);
});

test('A-001 Athletics points to the sheets that now own aquatics and swimming evidence', () => {
  const a001 = section('id="a001"', 'id="a002"');
  const athletics = /<div[^>]*data-part="athletics"[\s\S]*?<\/div>/.exec(a001);
  assert.ok(athletics && athletics[0].includes('<span class="part-ref">A-003</span>'));
  const specBlock = /var SPEC=(\{[\s\S]*?\n\s*\});/.exec(js);
  const spec = new Function(`return ${specBlock[1]}`)();
  assert.deepEqual(spec.athletics.d, [
    ['Ref drawings', 'A-003 · 05.6'],
    ['Discipline', 'Swimming'],
    ['Applied in', 'SplitWise · 05.6'],
  ]);
});

test('A-001 descriptor hover meets light-theme text contrast', () => {
  const vars = Object.fromEntries([.../:root\s*\{([^}]*)\}/.exec(css)[1]
    .matchAll(/--([a-z]+):\s*(#[0-9A-Fa-f]{6})/g)].map(m => [m[1], m[2]]));
  const luminance = hex => {
    const channels = hex.slice(1).match(/../g).map(v => parseInt(v, 16) / 255)
      .map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
  };
  const values = [luminance(vars.ink), luminance(vars.hair)].sort((a, b) => b - a);
  assert.ok((values[0] + .05) / (values[1] + .05) >= 4.5);
  assert.match(css,
    /#a001\s+\.part:hover:not\(\[aria-selected="true"\]\):not\(\[data-selected="true"\]\)\s+\.part-desc[^}]*color:\s*var\(--ink\)/,
    'hovered descriptor must use the verified high-contrast ink colour');
  assert.match(css,
    /\.runtime-ready\s+#a001\s+\.part:hover:not\(\[aria-selected="true"\]\):not\(\[data-selected="true"\]\)\s+\.part-body/,
    'hover must not override either the enhanced or static selected state');
});

test('print forces A-001 reveal details into their completed state', () => {
  const print = /@media print\{([\s\S]*?)\n\}/.exec(css);
  assert.ok(print, 'expected print styles');
  assert.match(print[1], /#a001\s+\.part-desc[^}]*opacity:\s*1/);
  assert.match(print[1], /\.runtime-ready\s+#a001\s+\.part-body::before[^}]*transform:\s*scaleX\(1\)/);
  assert.match(print[1], /\.runtime-ready\s+#a001\s+\.part-body::after[^}]*clip-path:\s*none/);
  assert.match(print[1], /\.runtime-ready\s+#a001\s+\.assembly-axis[^}]*transform:\s*scaleY\(1\)/);
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

test('a failed script load clears only the earned runtime gate', () => {
  const tag = /<script[^>]*src="assets\/js\/blueprint\.js"[^>]*>/.exec(html);
  assert.ok(tag, 'behaviour script tag not found');
  assert.match(tag[0], /onerror="[^"]*classList\.remove\('runtime-ready'(?:,'js')?\)[^"]*"/);
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

test('A-003 draws two extensible vertical tracks and stacks them on narrow screens', () => {
  assert.match(css, /#a003\s+\.experience-tracks\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /#a003\s+\.experience-track-list::before\s*\{[^}]*border-left:/);
  assert.match(css, /#a003\s+\.experience-step\s*\{[^}]*position:\s*relative/);
  assert.doesNotMatch(css, /#a003[^}]*nth-child\(/);
  assert.doesNotMatch(css, /#a003[^}]*overflow-x:\s*auto/);
  assert.match(css, /@media\(max-width:860px\)[\s\S]*#a003\s+\.experience-tracks\s*\{[^}]*grid-template-columns:\s*minmax\(0,1fr\)/);
});

test('A-003 role widgets keep readable factual text and visible current state', () => {
  for (const selector of ['experience-meta', 'experience-org', 'experience-evidence', 'experience-detail-label', 'experience-concurrent', 'experience-caption']) {
    const rule = new RegExp(`#a003\\s+\\.${selector}\\s*\\{([^}]*)\\}`).exec(css);
    assert.ok(rule, `missing ${selector} rule`);
    const size = /font-size:\s*([\d.]+)px/.exec(rule[1]);
    assert.ok(size && Number(size[1]) >= 8.5, `${selector} below 8.5px`);
    assert.doesNotMatch(rule[1], /color:\s*var\(--(?:refdec|line)\)/);
  }
  assert.match(css, /#a003\s+\.experience-role-current\s*\{[^}]*border-width:\s*2px/);
  assert.match(html, /EXP-04 &middot; Current/);
});

test('A-003 evidence and caption links expose 44px targets without changing their labels', () => {
  assert.match(css, /#a003\s+\.experience-evidence a,#a003\s+\.experience-caption a\s*\{[^}]*display:\s*inline-flex[^}]*align-items:\s*center[^}]*min-height:\s*44px/);
  const a003 = section('id="a003"', 'id="a004"');
  assert.match(a003, /<a href="#a005">Project evidence &rarr; A-005<\/a>/);
  assert.match(a003, /<a href="#a004">Engineering &rarr; A-004<\/a>/);
  assert.match(a003, /<a href="#a005">Projects &rarr; A-005<\/a>/);
});

test('A-003 reveal is decorative only and completes for reduced motion and print', () => {
  assert.doesNotMatch(css, /\.runtime-ready\s+#a003\s+\.experience-(?:role|summary|detail|more)[^{]*\{[^}]*opacity:\s*0/);
  assert.match(css, /\.runtime-ready\s+#a003\s+\.experience-track-list::before\s*\{[^}]*transform:/);
  assert.match(css, /#a003\.drawn\s+\.experience-track-list::before\s*\{[^}]*animation:/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)[\s\S]*#a003\s+\.experience-track-list::before[^}]*transform:\s*none/);
  assert.match(css, /@media print[\s\S]*#a003\s+\.experience-track-list::before[^}]*transform:\s*none/);
  assert.match(css, /@media print[\s\S]*#a003\s+\.experience-detail[^}]*display:\s*block!important/);
  assert.match(css, /@media print[\s\S]*#a003\s+\.experience-more[^}]*display:\s*none!important/);
});

test('A-003 track grammar accepts a third role structurally', () => {
  assert.match(css, /#a003\s+\.experience-step\s*\{/);
  assert.doesNotMatch(css, /#a003\s+\.experience-step:nth-(?:child|of-type)/);
  assert.doesNotMatch(css, /#a003\s+\.experience-track-list\s*\{[^}]*grid-template-columns/);
  const a003 = section('id="a003"', 'id="a004"');
  const template = /<li class="experience-step">[\s\S]*?<\/li>/.exec(a003);
  assert.ok(template, 'role list needs one repeatable list-item template');
});

test('A-003 inter-role rail has no arrow decoration', () => {
  assert.doesNotMatch(css, /#a003\s+\.experience-step:not\(:last-child\)::after\s*\{/);
  assert.doesNotMatch(css, /#a003\s+\.experience-step:not\(:last-child\)::after[\s\S]*?(?:\\2193|border-top:\s*6px solid var\(--ink\))/);
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

test('responsive browser measurements reload blueprint CSS before measuring', () => {
  const measure = readFileSync('tools/measure-in-browser.js', 'utf8');
  assert.match(measure,
    /querySelector\('link\[rel="stylesheet"\]\[href\*="assets\/css\/blueprint\.css"\]'\)/,
    'measurement iframe must locate the local blueprint stylesheet');
  assert.match(measure,
    /await new Promise\(done => \{[\s\S]*?addEventListener\('load', done,[\s\S]*?addEventListener\('error', done,[\s\S]*?searchParams\.set\('cb', `\$\{Date\.now\(\)\}-\$\{px\}`\)[\s\S]*?\.href = [^;]+;[\s\S]*?\}\);[\s\S]*?await new Promise\(r => setTimeout\(r, 1800\)\);/,
    'measurement delay must begin only after a uniquely cache-busted stylesheet reload completes');
});

test('responsive browser measurements put A-001 in its drawn state before measuring', () => {
  const measure = readFileSync('tools/measure-in-browser.js', 'utf8');
  assert.match(measure,
    /stylesheet\.href = url\.href;[\s\S]*?\}\);[\s\S]*?d\.querySelector\('#a001'\)\.classList\.add\('drawn'\);[\s\S]*?await new Promise\(r => setTimeout\(r, 1800\)\);/,
    'hidden responsive iframes must not depend on IntersectionObserver to reveal A-001');
});

test('browser measurements cover static A-001, visible ancestors and reduced motion', () => {
  const measure = readFileSync('tools/measure-in-browser.js', 'utf8');
  assert.match(measure, /querySelectorAll\('#a001 \.part'\)/,
    'no-JS/static A-001 parts must be measured before role enhancement');
  assert.match(measure, /for \(let n = e; n; n = n\.parentElement\)/,
    'visibility must account for every ancestor');
  assert.match(measure, /r\.width\s*>\s*0[\s\S]*r\.height\s*>\s*0/,
    'visibleTogether must reject zero-sized controls');
  assert.match(measure, /prefers-reduced-motion:\s*reduce/,
    'the report must state and measure the real reduced-motion environment');
  assert.match(measure, /reducedMotion[\s\S]*completed/,
    'the reduced-motion result must report whether reveal is complete');
});

test('browser measurements cover the A-002 education route in every required mode', () => {
  const measure = readFileSync('tools/measure-in-browser.js', 'utf8');
  assert.match(measure, /#a002\s+\.education-node/);
  assert.match(measure, /education-transfer/);
  assert.match(measure, /a002Completed/);
  assert.match(measure, /routeDirection/);
  assert.match(measure, /routeOverflow/);
  assert.match(measure, /educationTextFloor/);
});

test('browser measurements cover A-003 tracks, owned details and failure states', () => {
  const measure = readFileSync('tools/measure-in-browser.js', 'utf8');
  for (const token of [
    '#a003 .experience-track', '#a003 .experience-role', 'experience-detail',
    'detailsOwned', 'twoOpen', 'trackLayout', 'trackOverflow',
    'experienceTextFloor', 'a003Completed', 'anims.a003',
  ]) assert.ok(measure.includes(token), `missing A-003 measurement: ${token}`);
});

test('browser measurement opens the first A-003 details idempotently', () => {
  const measure = readFileSync('tools/measure-in-browser.js', 'utf8');
  const start = measure.indexOf('function openCollapsedDetails');
  const end = measure.indexOf('// DISCLOSURE_OPEN_END');
  assert.ok(start >= 0 && end > start, 'expected extractable idempotent disclosure helper');
  const openCollapsedDetails = new Function(`${measure.slice(start, end)}\nreturn openCollapsedDetails;`)();
  const button = expanded => ({
    state: { expanded },
    clicks: 0,
    getAttribute(name) { return name === 'aria-expanded' ? this.state.expanded : null; },
    click() { this.clicks++; this.state.expanded = 'true'; },
  });
  const closed = button('false');
  const alreadyOpen = button('true');

  openCollapsedDetails([closed, alreadyOpen]);

  assert.equal(closed.clicks, 1, 'a collapsed detail is opened');
  assert.equal(alreadyOpen.clicks, 0, 'an open detail is never toggled closed');
  assert.equal(closed.getAttribute('aria-expanded'), 'true');
  assert.equal(alreadyOpen.getAttribute('aria-expanded'), 'true');
});

test('browser animation audit samples live reveal animations and reports their timing and properties', () => {
  const measure = readFileSync('tools/measure-in-browser.js', 'utf8');
  assert.match(measure,
    /querySelectorAll\('\[data-draw\]'\)[\s\S]*?classList\.remove\('drawn'\)[\s\S]*?offsetWidth[\s\S]*?classList\.add\('drawn'\)[\s\S]*?requestAnimationFrame/,
    'the harness must restart and sample finite reveal animations before they finish');
  assert.match(measure, /getAnimations\(\{\s*subtree:\s*true\s*\}\)/,
    'the harness must explicitly sample the A-002 animation subtree');
  assert.match(measure, /getTiming\(\)[\s\S]*?timing\.iterations/);
  assert.match(measure, /getKeyframes\(\)/);
  assert.match(measure, /details:\s*animationDetails/);
  assert.match(measure, /a002:\s*auditAnimations\(a002Animations\)/);
});

test('browser animation audit flags infinite and layout-property animations', () => {
  const measure = readFileSync('tools/measure-in-browser.js', 'utf8');
  const start = measure.indexOf('function auditAnimations');
  const end = measure.indexOf('// ANIMATION_AUDIT_END');
  assert.ok(start >= 0 && end > start, 'expected extractable animation audit helper');
  const auditAnimations = new Function(`${measure.slice(start, end)}\nreturn auditAnimations;`)();
  const animation = (name, iterations, keyframes) => ({
    animationName: name,
    effect: {
      getTiming: () => ({ iterations }),
      getKeyframes: () => keyframes,
    },
  });

  const result = auditAnimations([
    animation('education-line', 1, [{ transform: 'scaleX(0)' }, { transform: 'none' }]),
    animation('bad-loop', Infinity, [{ width: '0px' }, { width: '100px' }]),
  ]);

  assert.equal(result.total, 2);
  assert.equal(result.infinite, 1);
  assert.deepEqual(result.layoutProps, ['width']);
  assert.deepEqual(result.properties, ['transform', 'width']);
  assert.deepEqual(result.details.map(({ name, iterations }) => ({ name, iterations })), [
    { name: 'education-line', iterations: 1 },
    { name: 'bad-loop', iterations: 'infinite' },
  ]);
});

test('browser report compacts animation details without dropping audit summaries', () => {
  const measure = readFileSync('tools/measure-in-browser.js', 'utf8');
  const start = measure.indexOf('function animationSummary');
  const end = measure.indexOf('// ANIMATION_SUMMARY_END');
  assert.ok(start >= 0 && end > start, 'expected extractable animation summary helper');
  const animationSummary = new Function(`${measure.slice(start, end)}\nreturn animationSummary;`)();
  const audit = {
    total: 3,
    infinite: 0,
    layoutProps: [],
    properties: ['transform'],
    details: [{ name: 'experience-rail', iterations: 1, properties: ['transform'] }],
  };

  assert.deepEqual(animationSummary(audit), {
    total: 3,
    infinite: 0,
    layoutProps: [],
    properties: ['transform'],
  });
  assert.match(measure,
    /anims:\s*\{[\s\S]*?\.\.\.animationSummary\(R\.anims\)[\s\S]*?a002:\s*animationSummary\(R\.anims\.a002\)[\s\S]*?a003:\s*animationSummary\(R\.anims\.a003\)/,
    'printed reports must retain compact global, A-002 and A-003 animation summaries');
});

test('browser measurement prints one JSON report and still returns it', () => {
  const measure = readFileSync('tools/measure-in-browser.js', 'utf8');
  assert.match(measure,
    /const report = JSON\.stringify\(serializable, null, 1\);\s*console\.log\(report\);\s*return report;/,
    'Snippets need an explicit log while DevTools Console keeps the Promise result');
  assert.equal((measure.match(/console\.(?:log|info|warn|error)\s*\(/g) || []).length, 1,
    'the harness must print exactly one report with no console noise');
});

test('static A-002 measurement requires every essential record detail to be visually visible', () => {
  const measure = readFileSync('tools/measure-in-browser.js', 'utf8');
  assert.match(measure,
    /const visibleIn = \(e, view = window\) => \{[\s\S]*?for \(let n = e; n; n = n\.parentElement\)/,
    'static visibility must reject a hidden or transparent ancestor');
  assert.match(measure,
    /#a002 \.education-node,#a002 \.education-node-meta span,#a002 \.education-node h3,#a002 \.education-place,#a002 \.education-programme,#a002 \.education-programme p,#a002 \.education-transfer,#a002 \.education-transfer strong,#a002 \.education-transfer>span,#a002 \.education-caption span/,
    'static visibility must cover both records, transfer, and factual descendants');
  assert.match(measure, /essentialVisible:\s*staticA002Essentials\.every\(e => visibleIn\(e\)\)/,
    'the no-JavaScript report must expose the aggregate visibility result');
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

test('a linked project detail opens without script', () => {
  // A-005's panels are display:none until the runtime sets data-open, and none of
  // them ship that attribute. Without a :target rule, every cross-sheet evidence
  // link scrolls to an element with no layout box and fails silently — which is
  // the majority case, since <noscript> only covers script being disabled.
  assert.match(css, /\.detail:target\s*\{[^}]*display\s*:\s*block/,
    'expected .detail:target{display:block} so #p1-#p6 are reachable by link');
  // ...and an explicit close has to beat it, or a panel opened from an evidence
  // link can never be closed and its button contradicts what is on screen. Same
  // specificity, so order decides: the close rule must come after :target.
  const targetAt = css.indexOf('.detail:target');
  const closeAt = css.indexOf('.detail[data-open="false"]');
  assert.ok(closeAt !== -1, 'expected .detail[data-open="false"]{display:none}');
  assert.ok(closeAt > targetAt, '.detail[data-open="false"] must come after .detail:target to win the tie');
});

const a004 = /<section class="sheet" id="a004"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';

test('A-004 has four claims and each carries its reference number in the heading', () => {
  assert.notEqual(a004, '', 'expected an #a004 section');
  const ids = [...a004.matchAll(/<div class="claim" id="(c\d)"/g)].map(m => m[1]);
  assert.deepEqual(ids, ['c1', 'c2', 'c3', 'c4']);
  // A headings-list navigation must return four numbered headings, not four
  // unnumbered ones: the number is how every cross-reference names the claim.
  const headings = [...a004.matchAll(/<h3><span class="n">(04\.\d)<\/span>/g)].map(m => m[1]);
  assert.deepEqual(headings, ['04.1', '04.2', '04.3', '04.4']);
});

test('every A-004 evidence link targets a project that exists', () => {
  // The link targets the project article, not the detail panel inside it: linking
  // straight to #pN scrolls past the title, figure and description and lands the
  // reader mid-disclosure.
  const targets = [...a004.matchAll(/class="ev" href="#(proj-\d)"/g)].map(m => m[1]);
  assert.ok(targets.length >= 10, `expected the evidence links, found ${targets.length}`);
  for (const t of new Set(targets)) {
    assert.ok(html.includes(`<article class="proj an" id="${t}">`),
      `evidence link points at #${t}, which does not exist`);
    // and the article must still contain the panel that :target opens
    const n = t.split('-')[1];
    const article = html.slice(html.indexOf(`id="${t}"`));
    assert.ok(article.slice(0, article.indexOf('</article>')).includes(`<div class="detail" id="p${n}">`),
      `#${t} does not contain detail panel #p${n}`);
  }
  assert.ok(!/class="ev" href="#p\d"/.test(a004), 'an evidence link still points straight at a panel');
});

test('A-004 depends on no script of its own', () => {
  assert.ok(!/<script/.test(a004), 'A-004 must contain no script');
  for (const hook of ['aria-pressed', 'aria-live', 'role="status"', 'data-more', 'data-refs']) {
    assert.ok(!a004.includes(hook), `A-004 must not use ${hook}: the sheet is static`);
  }
  for (const gone of ['#a004', 'modout', '.mod']) {
    assert.ok(!js.includes(gone), `blueprint.js still references ${gone}`);
  }
});

test('print and reduced-motion overrides outrank the theme and reveal rules', () => {
  // Both blocks were written with too little specificity to win, and both failed
  // silently: print inherited the dark tokens for anyone who had used the theme
  // toggle, and the reduced-motion still states never applied at all.
  const printBlock = /@media print\{[\s\S]*?\n\}/.exec(css)?.[0] ?? css.slice(css.indexOf('@media print'));
  assert.match(printBlock, /:root,\s*:root\[data-theme\]\s*\{/,
    'print tokens must also match :root[data-theme], or a stored dark theme wins');
  const rm = /@media\(prefers-reduced-motion:reduce\)\{[\s\S]*?\n\}/.exec(css)?.[0] ?? '';
  assert.notEqual(rm, '', 'expected a prefers-reduced-motion block');
  for (const decl of ['stroke-dashoffset:0!important', 'opacity:1!important']) {
    assert.ok(rm.includes(decl),
      `reduced-motion still state "${decl}" must be !important to beat .runtime-ready`);
  }
});

test('A-004 carries no figure', () => {
  // Spec section 7: the key plan was cut because its hand-computed geometry made
  // every future project a redraw. If a figure ever returns it must be a table, so
  // this guard forces that decision to be made rather than drifted into.
  assert.ok(!/<svg/.test(a004), 'A-004 must contain no svg; see spec section 7');
});

test('every claim carries its own evidence, and no claim is left unevidenced', () => {
  // The mapping is one-way by scope: A-005 says nothing about A-004. This is the
  // half that can be checked from A-004 alone — every claim cites at least two
  // distinct drawings, so no claim rests on a single piece of evidence.
  const perClaim = [...a004.matchAll(/<div class="claim" id="(c\d)"[\s\S]*?(?=<div class="claim" id="|<div class="stk">)/g)];
  assert.equal(perClaim.length, 4, 'expected four claims');
  for (const m of perClaim) {
    const refs = new Set([...m[0].matchAll(/class="ev" href="#(proj-\d)"/g)].map(x => x[1]));
    assert.ok(refs.size >= 2, `claim ${m[1]} cites ${refs.size} drawing(s); a pattern needs at least two`);
  }
});

test('A-004 claims no proficiency level', () => {
  // A rating is unfalsifiable, and was the failure of the sheet this replaces.
  assert.ok(!/(proficien|skill-level|\blevel-\d|\d{1,3}\s*%|★|expert|advanced|intermediate)/i.test(a004),
    'A-004 must not imply a proficiency rating');
});
