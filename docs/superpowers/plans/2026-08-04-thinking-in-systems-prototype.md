# Thinking in Systems Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one self-contained, responsive HTML prototype that presents Ashley Sum's existing portfolio content through an Archify Signal Flow-inspired storytelling system without changing the production `index.html`.

**Architecture:** Create a single standalone `prototypes/thinking-in-systems.html` containing semantic HTML, inline CSS, inline SVG connector rails, and dependency-free progressive JavaScript. The document remains fully readable without JavaScript; IntersectionObserver only activates one-time node and connector states. Verification uses browser rendering at desktop and mobile widths plus a small Node-based static contract test.

**Tech Stack:** HTML5, CSS custom properties, inline SVG, vanilla JavaScript, Node.js static checks, browser screenshots

## Global Constraints

- Use only facts and material already present in the current portfolio.
- Exclude the Ospit internship, client highway work, CAD-to-map repository, and unsupported outcomes.
- Preserve `/Users/leleditit/Desktop/Github/ashleytzelesum.github.io/index.html` unchanged.
- Keep conventional sticky anchor navigation and top-to-bottom scrolling.
- Do not add pan, zoom, search, route probing, legends, export controls, diagram chrome, dense topology, or crossing connectors.
- Use Deep Graphite `#0B0F14`, Raised Graphite `#141B23`, Signal Cyan `#38BDF8`, Process Blue `#2563EB`, Warm Signal `#F59E5B`, Cool Line `#34404D`, Soft White `#EDF4F7`, and Muted Steel `#94A3AD`.
- Use Space Grotesk for display, Source Sans 3 for body, and IBM Plex Mono for utility labels, with system fallbacks.
- Use one finite Signal Flow trace per section and no looping ambient motion.
- Provide a single vertical connector rail on mobile.
- Preserve readable content and navigation when JavaScript is disabled.
- Honor `prefers-reduced-motion`, visible keyboard focus, semantic landmarks, a skip link, and 44-pixel touch targets.

---

### Task 1: Static Contract Test and Semantic Page Structure

**Files:**
- Create: `tests/thinking-in-systems.test.mjs`
- Create: `prototypes/thinking-in-systems.html`

**Interfaces:**
- Consumes: Existing local images, videos, CV, GitHub URLs, and copy from `index.html`
- Produces: Stable section IDs `home`, `about`, `projects`, `experience`, `skills`, and `contact`; reusable classes `.flow-section`, `.flow-node`, `.flow-rail`, `.project-system`; root class `.js`

- [ ] **Step 1: Write the failing static contract test**

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const path = new URL('../prototypes/thinking-in-systems.html', import.meta.url);
const html = readFileSync(path, 'utf8');

for (const id of ['home', 'about', 'projects', 'experience', 'skills', 'contact']) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
}

for (const required of [
  'Skip to content',
  'SplitWise',
  'NBA Player Guessing Game',
  'San Francisco State University',
  'prefers-reduced-motion',
  'aria-label="Primary navigation"',
]) {
  assert.ok(html.includes(required), `missing ${required}`);
}

assert.ok(!html.includes('Ospit'), 'unapproved Ospit content leaked into prototype');
assert.ok(!html.includes('cad-to-map'), 'unapproved CAD project leaked into prototype');
assert.ok(!html.includes('<script src='), 'prototype must not depend on external scripts');

console.log('thinking-in-systems static contract: PASS');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/thinking-in-systems.test.mjs`

Expected: failure with `ENOENT` for `prototypes/thinking-in-systems.html`.

- [ ] **Step 3: Create the semantic document skeleton**

Create a complete HTML document with this exact landmark and section order:

```html
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="#home">Ashley Sum</a>
    <nav aria-label="Primary navigation">
      <a href="#projects">Work</a>
      <a href="#experience">Experience</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main id="main">
    <section id="home" class="flow-section hero"></section>
    <section id="about" class="flow-section"></section>
    <section id="projects" class="flow-section"></section>
    <section id="experience" class="flow-section"></section>
    <section id="skills" class="flow-section"></section>
    <section id="contact" class="flow-section"></section>
  </main>
  <footer></footer>
</body>
```

Populate every section with the current portfolio's real copy, links, local images, education, three existing roles, demonstrated skills, and contact details. Use large project screenshots and keep all Demo, Source, CV, email, LinkedIn, and GitHub actions functional.

- [ ] **Step 4: Add the inline design tokens and baseline responsive layout**

Define the approved palette and typography in `:root`, add a 1180px content boundary, sticky header, accessible focus ring, semantic node surfaces, and these layout rules:

```css
:root {
  --canvas: #0B0F14;
  --surface: #141B23;
  --signal: #38BDF8;
  --process: #2563EB;
  --warm: #F59E5B;
  --line: #34404D;
  --text: #EDF4F7;
  --muted: #94A3AD;
}
.flow-section { position: relative; padding: clamp(5rem, 10vw, 9rem) 0; }
.flow-node { border: 1px solid var(--line); background: var(--surface); }
:focus-visible { outline: 3px solid var(--signal); outline-offset: 4px; }
@media (max-width: 720px) {
  .site-header nav { position: fixed; inset: auto 0 0; min-height: 64px; }
  .flow-section { padding: 5rem 0; }
}
```

- [ ] **Step 5: Run the contract test**

Run: `node tests/thinking-in-systems.test.mjs`

Expected: `thinking-in-systems static contract: PASS`.

- [ ] **Step 6: Commit the semantic prototype foundation**

```bash
git add tests/thinking-in-systems.test.mjs prototypes/thinking-in-systems.html
git commit -m "Build semantic Thinking in Systems prototype"
```

### Task 2: Signal Flow Project Storytelling and Progressive Interaction

**Files:**
- Modify: `prototypes/thinking-in-systems.html`
- Modify: `tests/thinking-in-systems.test.mjs`

**Interfaces:**
- Consumes: `.flow-section`, `.flow-node`, `.flow-rail`, `.project-system` from Task 1
- Produces: `data-flow-step` markers, `.is-visible` one-time states, `.is-traced` connector state, no-JavaScript fallback, reduced-motion fallback

- [ ] **Step 1: Extend the static contract for flow behavior**

Append these assertions:

```js
for (const required of [
  'data-flow-step="problem"',
  'data-flow-step="input"',
  'data-flow-step="logic"',
  'data-flow-step="interface"',
  'data-flow-step="result"',
  'IntersectionObserver',
  'classList.add(\'is-traced\')',
]) {
  assert.ok(html.includes(required), `missing flow behavior: ${required}`);
}
assert.ok(!html.includes('setInterval('), 'looping animation is forbidden');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/thinking-in-systems.test.mjs`

Expected: failure reporting missing `data-flow-step="problem"`.

- [ ] **Step 3: Build both project systems**

For SplitWise, add five readable nodes in this exact semantic order and wording:

```html
<ol class="project-flow" aria-label="How this project works">
  <li class="flow-node" data-flow-step="problem"><span>Problem</span><p>A stopwatch gives swimmers a finish time, but not the story inside the sprint.</p></li>
  <li class="flow-node" data-flow-step="input"><span>Input</span><p>Swim sessions, splits, stroke counts, stroke rates, and underwater data.</p></li>
  <li class="flow-node" data-flow-step="logic"><span>Logic</span><p>Flask and MongoDB organize sessions, comparisons, personal bests, and performance relationships.</p></li>
  <li class="flow-node" data-flow-step="interface"><span>Interface</span><p>Interactive charts expose velocity, trends, correlations, and side-by-side swims.</p></li>
  <li class="flow-node" data-flow-step="result"><span>Result</span><p>Swimmers and coaches can understand 50m sprint performance beyond the final time.</p></li>
</ol>
```

For NBA Player Guessing Game, use the same five step attributes with this exact wording:

- Problem: `Basketball trivia needs more tension than a static question-and-answer screen.`
- Input: `A player's guess, autocomplete selection, and up to five attempts.`
- Logic: `Flask and MongoDB manage players, sessions, hints, authentication, and scores.`
- Interface: `The player image becomes progressively clearer while new hints appear after incorrect guesses.`
- Result: `A responsive SFHacks 2025 game that combines visual recognition, hints, and score tracking.`

Place the screenshot before the process on mobile and beside it on desktop.

- [ ] **Step 4: Add inline SVG rails and CSS trace states**

Use decorative SVG with `aria-hidden="true"`, `vector-effect="non-scaling-stroke"`, and `pathLength="1"`. The inactive rail remains visible without JavaScript; `.js` hides only the active overlay until traced.

```css
.flow-rail__active { stroke: var(--signal); stroke-dasharray: 1; stroke-dashoffset: 1; }
.js .flow-section.is-traced .flow-rail__active {
  animation: trace-flow 900ms cubic-bezier(.22,.8,.25,1) forwards;
}
@keyframes trace-flow { to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) {
  .flow-rail__active { stroke-dashoffset: 0; }
  *, *::before, *::after { animation-duration: .01ms !important; scroll-behavior: auto !important; }
}
```

- [ ] **Step 5: Add one-time progressive enhancement**

Add `.js` to the root immediately, then observe each `.flow-section`. Unobserve after the first intersection so animations never loop:

```js
document.documentElement.classList.add('js');
const observer = new IntersectionObserver((entries, currentObserver) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('is-visible');
    entry.target.classList.add('is-traced');
    currentObserver.unobserve(entry.target);
  }
}, { threshold: 0.18 });
document.querySelectorAll('.flow-section').forEach(section => observer.observe(section));
```

- [ ] **Step 6: Run the static contract test**

Run: `node tests/thinking-in-systems.test.mjs`

Expected: `thinking-in-systems static contract: PASS`.

- [ ] **Step 7: Commit the Signal Flow interaction**

```bash
git add tests/thinking-in-systems.test.mjs prototypes/thinking-in-systems.html
git commit -m "Add Signal Flow project storytelling"
```

### Task 3: Browser Verification, Responsive Repair, and Screenshots

**Files:**
- Modify if diagnostics require: `prototypes/thinking-in-systems.html`
- Create: `artifacts/thinking-in-systems-desktop.png`
- Create: `artifacts/thinking-in-systems-mobile.png`

**Interfaces:**
- Consumes: Completed standalone prototype from Tasks 1–2
- Produces: Verified desktop and mobile renders plus final comparison evidence

- [ ] **Step 1: Run deterministic checks before visual review**

Run:

```bash
node tests/thinking-in-systems.test.mjs
git diff --check -- prototypes/thinking-in-systems.html tests/thinking-in-systems.test.mjs
```

Expected: contract prints `PASS`; `git diff --check` produces no output.

- [ ] **Step 2: Serve the repository locally**

Run: `python3 -m http.server 4173 --bind 127.0.0.1`

Open: `http://127.0.0.1:4173/prototypes/thinking-in-systems.html`

Expected: page loads with local images, no missing assets, and no console errors.

- [ ] **Step 3: Verify desktop behavior at 1440 × 1000**

Check each item explicitly:

- sticky navigation reaches every target without obscuring its heading
- Ashley's identity, Summer 2027 status, View work, and Download CV appear in the first viewport
- SplitWise is the first and most prominent project
- project screenshots are larger than their process nodes
- all connectors terminate at nodes and do not cross text or images
- each section traces once and remains static afterward
- Tab navigation exposes a visible focus ring in a logical order
- Demo, Source, CV, email, LinkedIn, and GitHub destinations are correct

- [ ] **Step 4: Verify mobile behavior at 390 × 844**

Check each item explicitly:

- there is no horizontal overflow
- the bottom navigation does not cover content or contact actions
- the flow is one vertical rail with no crossing connectors
- project screenshots appear before their five-step explanations
- every navigation and action target is at least 44 pixels tall
- headings remain readable without awkward single-letter wrapping

- [ ] **Step 5: Verify accessibility fallbacks**

In browser developer tools:

- emulate `prefers-reduced-motion: reduce` and confirm all active rails display without visible tracing
- disable JavaScript and confirm all content, inactive rails, anchor navigation, and links remain usable
- inspect heading order and confirm one `h1` followed by section `h2` headings and project `h3` headings

- [ ] **Step 6: Repair only observed visual or interaction defects**

For each failure, modify the smallest relevant CSS rule, SVG path, or HTML attribute. Rerun Steps 1, 3, 4, and 5 after the final repair.

- [ ] **Step 7: Capture full-page evidence**

Save full-page screenshots at:

- `artifacts/thinking-in-systems-desktop.png` from 1440 × 1000
- `artifacts/thinking-in-systems-mobile.png` from 390 × 844

- [ ] **Step 8: Commit the verified prototype and screenshots**

```bash
git add prototypes/thinking-in-systems.html tests/thinking-in-systems.test.mjs artifacts/thinking-in-systems-desktop.png artifacts/thinking-in-systems-mobile.png
git commit -m "Verify responsive Thinking in Systems prototype"
```

### Task 4: Final Critique and Handoff

**Files:**
- No file changes expected

**Interfaces:**
- Consumes: Verified prototype and desktop/mobile screenshots
- Produces: User-facing assessment and recommendation about whether to adapt the prototype into production `index.html`

- [ ] **Step 1: Review the screenshots against the approved design**

Assess memorability, 30-second recruiter scanning, project evidence prominence, mobile clarity, accessibility, and whether the result looks like a copied Archify artifact or generic AI design.

- [ ] **Step 2: Report strengths and weaknesses concretely**

Name at least one genuine strength, one genuine weakness, and any production changes required before replacing `index.html`. Do not claim production readiness if visual or accessibility checks remain unresolved.

- [ ] **Step 3: Provide clickable artifacts**

Link the standalone prototype, desktop screenshot, mobile screenshot, and approved design specification using absolute workspace paths.
