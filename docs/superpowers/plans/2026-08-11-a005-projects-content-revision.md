# A-005 Projects Content Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild what every A-005 project entry says, without touching the layout, per `docs/superpowers/specs/2026-08-11-a005-projects-content-revision.md`.

**Architecture:** Five independent changes to an existing sheet: photographic figures stop being hard-coded to 1000px; detail panels are rebuilt on a shared field spine whose opening label depends on how the project began; 05.5 is rewritten from MeeTeam to Quorum; panels ship open so a failed runtime leaves them readable; and the two ranking labels are deleted. No CSS restructuring, no reordering, no renumbering.

**Tech Stack:** Hand-written HTML and CSS. Node's built-in test runner. No dependencies, no build step.

## Global Constraints

- No framework, bundler, build step, dependency, CDN or third-party request. Enforced by test.
- `node --test` from the repo root. **`node --test test/` does not work** — Node resolves the directory as a module.
- The suite must be green at the end of every task. It is currently 84/84.
- **The entry layout does not change.** `.proj`, `.ph`, `.pb`, the side label, the tagline and the figure position stay exactly as they are. Four layout directions were prototyped and rejected; spec §12 records the decision as closed.
- No reordering or renumbering. A-004 cites `05.1`–`05.6` by number and links to `#proj-1`–`#proj-6`.
- No hex colour outside a theme block. No gradients, shadows, glows, blurs or emoji.
- Every interactive element at least 44×44 including width.
- No client-identifying term in any tracked file. Enforced by test.
- **No project manufactures a failure to fill a field.** Where nothing notable went wrong, `What went wrong` is absent.
- **ScoutMini accuracy rule:** Formula 1 is what is built. Other sports are design intent. The copy may say the architecture generalises; it must never state or imply the tool currently answers about another sport.
- **No database is named for 05.6** until the three-way contradiction in spec §5 is resolved.

---

## Spec gap found while planning — resolve before Task 3

Spec §3 lists the permitted field set as: context (`Problem`/`Inspiration`), then `Approach` · `Result` · `What I learned`, plus optional `Constraints` · `Architecture` · `What went wrong`.

**`Technology` is not in that set, but 05.4, 05.5 and 05.6 each have one today.** Dropping it would remove the per-project stack from the only place it appears — A-004's stack listing groups technologies site-wide, not per project, so a reader looking at SplitWise would have no way to learn it is Flask.

**This plan keeps `Technology` as a permitted optional field**, placed last. 05.1–05.3 do not have one and do not gain one; their stack is woven through their `Approach` and `Architecture` prose. Spec §3 needs a one-line amendment to match, and Task 3's permitted-set test encodes the resolution.

If Ashley prefers `Technology` dropped entirely, that is a smaller change, not a larger one: delete the field from the three entries and remove it from the permitted set in the test.

---

## Field order

The canonical order, which the existing 05.1–05.3 panels already follow exactly:

`context` → `Constraints`? → `Approach` → `Architecture`? → `What went wrong`? → `Result` → `What I learned` → `Technology`?

Fields marked `?` appear only where the material is real. **05.1, 05.2 and 05.3 therefore need no field changes at all** — they already open on `Problem` and carry the rest in this order.

---

## File Structure

| File | Responsibility for this change |
|---|---|
| `index.html` | The `#a005` section: three rebuilt detail panels, two deleted labels, two revised summary lines, `data-open="true"` and `aria-expanded="true"` on every project disclosure. |
| `assets/css/blueprint.css` | The `.figbox img/video` width rule; the `.detail` default; the `.dgrid` minimum column. |
| `assets/js/blueprint.js` | Collapse the project panels once the runtime initialises. |
| `test/contracts.test.mjs` | Six new tests. |

**Bounds as of writing — re-derive before editing, do not trust these blindly:**

- `#a005` spans `index.html` lines 390–641; `#a006` begins at 642.
- `Featured engineering work` label at `index.html:398`; `Other builds` at `:506`.
- `.figbox img,.figbox video{width:1000px…}` at `blueprint.css:489`.
- `.detail{display:none…}` at `blueprint.css:378`.
- `.dgrid{…minmax(230px,1fr)…}` at `blueprint.css:396`.
- The `.more` click handler and `setDetailOpen` at `blueprint.js:42–60`.

---

### Task 1: Photographic figures fit their column

Independent of everything else, and ships value alone: it is what removes sideways panning on a phone and brings SplitWise's play button on screen.

**Files:**
- Modify: `assets/css/blueprint.css:489`
- Test: `test/contracts.test.mjs`

**Interfaces:**
- Produces: `.figbox img,.figbox video` sized in percentages. Nothing later depends on it.

- [ ] **Step 1: Write the failing test**

Append to `test/contracts.test.mjs`:

```javascript
test('a photographic figure fits its column', () => {
  // The 1000px floor is right for drawn SVGs, whose 8px labels go illegible when
  // scaled, and wrong for rasters and video, which have no such labels. Applied to
  // both, it forced sideways panning at every viewport under about 1100px and put
  // SplitWise's play button roughly 700px off-screen at 390px.
  const rule = /\.figbox img,\.figbox video\{([^}]*)\}/.exec(css);
  assert.ok(rule, 'expected a .figbox img,.figbox video rule');
  assert.doesNotMatch(rule[1], /width\s*:\s*\d+px/,
    'a photographic figure must not be given a fixed pixel width');
  assert.match(rule[1], /max-width\s*:\s*100%/, 'it must be allowed to shrink to its column');
  // the drawn floor stays: this is the rule that must NOT change
  assert.match(css, /\.figbox svg\{[^}]*min-width\s*:\s*1000px/,
    'drawn figures keep their floor; their labels need it');
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `node --test`
Expected: 1 failing — `a photographic figure must not be given a fixed pixel width`.

- [ ] **Step 3: Change the rule**

In `assets/css/blueprint.css`, replace line 489's declaration block. The existing comment above it explains the 1000px floor; extend it rather than deleting it:

```css
.figbox img,.figbox video{width:100%;max-width:100%;height:auto;display:block;
  border:1px solid var(--hair)}
```

- [ ] **Step 4: Run the tests**

Run: `node --test`
Expected: 85 pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add assets/css/blueprint.css test/contracts.test.mjs
git commit -m "Let a photographic figure fit its column

The 1000px floor protects the 8px labels on a drawn SVG, which is real, and was
then applied to rasters and video, which have no such labels. The content box is
286px at a 390px viewport against a 1000px figure, so every photograph forced a
sideways scroll and SplitWise's play button sat roughly 700px off-screen.

Drawn figures keep the floor."
```

---

### Task 2: Panels ship open

**Files:**
- Modify: `index.html` — add `data-open="true"` to six `.detail` divs and set `aria-expanded="true"` on six `.more` buttons
- Modify: `assets/css/blueprint.css:378`
- Modify: `assets/js/blueprint.js` — collapse on successful init
- Test: `test/contracts.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `.detail` elements that are visible in static markup. Task 3–5 rebuild the contents of three of them and must preserve `data-open="true"`.

- [ ] **Step 1: Write the failing test**

```javascript
test('project panels are readable when the runtime fails', () => {
  // <noscript> covers script being disabled. It does not cover script being
  // enabled and then failing, which left six buttons that do nothing and content
  // reachable only by typing a fragment. A-003 already ships its details open and
  // lets a successful runtime collapse them; this brings A-005 into line.
  const a005 = /<section class="sheet" id="a005"[\s\S]*?\n<\/section>/.exec(html)?.[0] ?? '';
  assert.notEqual(a005, '', 'expected an #a005 section');
  const panels = [...a005.matchAll(/<div class="detail" id="(p\d)"([^>]*)>/g)];
  assert.equal(panels.length, 6, `expected six panels, found ${panels.length}`);
  for (const [, id, attrs] of panels) {
    assert.match(attrs, /data-open="true"/, `#${id} must ship open`);
  }
  const buttons = [...a005.matchAll(/<button class="more"[^>]*aria-expanded="([^"]+)"/g)];
  assert.equal(buttons.length, 6, 'expected six disclosure buttons');
  for (const [, state] of buttons) {
    assert.equal(state, 'true', 'a button must not announce collapsed over open content');
  }
  assert.match(js, /collapseProjectDetails|setDetailOpen\(b,\s*d,\s*false\)/,
    'the runtime must collapse the panels once it has initialised');
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `node --test`
Expected: 1 failing — `#p1 must ship open`.

- [ ] **Step 3: Open the panels in the markup**

For each of the six projects in `#a005`, change:

```html
<button class="more" type="button" data-more="p1" aria-controls="p1" data-label="05.1" aria-expanded="false">Open detail &mdash; 05.1</button>
<div class="detail" id="p1">
```

to:

```html
<button class="more" type="button" data-more="p1" aria-controls="p1" data-label="05.1" aria-expanded="true">Close detail &mdash; 05.1</button>
<div class="detail" id="p1" data-open="true">
```

Repeat for `p2`/`05.2`, `p3`/`05.3`, `p4`/`05.4`, `p5`/`05.5`, `p6`/`05.6`. The visible button text must match the state, exactly as A-003's buttons do.

- [ ] **Step 4: Collapse them from the runtime**

In `assets/js/blueprint.js`, immediately after the `moreButtons.forEach(...)` click-handler block that ends at line 60, add:

```javascript
    /* The panels ship open so a runtime that loads and then fails leaves them
       readable. Reaching here means initialisation succeeded, so collapse them —
       except one already opened by a cross-sheet evidence link, which
       syncTargetedDetail below re-opens anyway. */
    moreButtons.forEach(function(b){
      var d=document.getElementById(b.dataset.more);
      if(d)setDetailOpen(b,d,false);
    });
```

`syncTargetedDetail()` already runs after this and re-opens whichever panel the hash names, so an A-004 evidence link still lands on an open panel.

- [ ] **Step 5: Keep the print and noscript overrides working**

No change needed — verify only. `@media print` and the `<noscript>` block both use `display:block!important`, which outranks everything. Confirm with:

```bash
grep -c 'display:block!important' index.html assets/css/blueprint.css
```

Expected: `1` in each.

- [ ] **Step 6: Run the tests**

Run: `node --test`
Expected: 86 pass, 0 fail. The A-004 cascade tests must be among the passes — `.detail:target`, `.detail[data-open="false"]` and the `.proj:target` pair are load-bearing for A-004's evidence links.

- [ ] **Step 7: Commit**

```bash
git add index.html assets/css/blueprint.css assets/js/blueprint.js test/contracts.test.mjs
git commit -m "Ship the project panels open, and collapse them from the runtime

They were hidden until script opened them. <noscript> covers script being
disabled; it does not cover script being enabled and then failing, which left six
buttons that did nothing and content reachable only by typing a fragment.

Inverting it means a broken runtime leaves every panel readable, which is the
pattern A-003 already uses. A panel opened by an A-004 evidence link is still
re-opened by syncTargetedDetail after the collapse."
```

---

### Task 3: The field spine, and 05.4 ScoutMini

**Files:**
- Modify: `index.html` — delete two labels, rebuild 05.4's panel, revise 05.4's summary line
- Test: `test/contracts.test.mjs`

**Interfaces:**
- Consumes: `data-open="true"` from Task 2 — preserve it.
- Produces: the permitted field set, encoded in a test that Tasks 4 and 5 must also satisfy.

- [ ] **Step 1: Write the failing tests**

```javascript
const PERMITTED = ['Problem', 'Inspiration', 'Constraints', 'Approach',
  'Architecture', 'What went wrong', 'Result', 'What I learned', 'Technology'];

test('every project panel opens on a context field and shares one spine', () => {
  const a005 = /<section class="sheet" id="a005"[\s\S]*?\n<\/section>/.exec(html)?.[0] ?? '';
  const panels = [...a005.matchAll(/<div class="detail" id="p(\d)"[\s\S]*?<div class="refs">/g)];
  assert.equal(panels.length, 6, `expected six panels, found ${panels.length}`);
  for (const p of panels) {
    const ref = `05.${p[1]}`;
    const fields = [...p[0].matchAll(/<div class="fld"><span class="k">([^<]+)<\/span>/g)].map(m => m[1]);
    assert.ok(fields.length >= 4, `${ref} has ${fields.length} fields; the spine is four`);
    // opens on exactly one context field
    assert.ok(['Problem', 'Inspiration'].includes(fields[0]),
      `${ref} opens on "${fields[0]}"; it must open on Problem or Inspiration`);
    assert.equal(fields.filter(f => f === 'Problem' || f === 'Inspiration').length, 1,
      `${ref} has more than one context field`);
    // the three common fields are present and in order
    const spine = fields.filter(f => ['Approach', 'Result', 'What I learned'].includes(f));
    assert.deepEqual(spine, ['Approach', 'Result', 'What I learned'],
      `${ref} is missing a spine field or has them out of order`);
    // nothing outside the permitted set
    for (const f of fields) {
      assert.ok(PERMITTED.includes(f), `${ref} has an unpermitted field "${f}"`);
    }
  }
});

test('A-005 asserts no ranking between its projects', () => {
  const a005 = /<section class="sheet" id="a005"[\s\S]*?\n<\/section>/.exec(html)?.[0] ?? '';
  for (const gone of ['Featured engineering work', 'Other builds']) {
    assert.ok(!a005.includes(gone),
      `"${gone}" marks the three most verifiable projects as the lesser three`);
  }
});
```

- [ ] **Step 2: Run and confirm they fail**

Run: `node --test`
Expected: 2 failing — `05.4 opens on "Features"` and `"Featured engineering work" marks…`.

- [ ] **Step 3: Delete the two ranking labels**

Remove these two lines from `index.html` entirely:

```html
<div class="lab" style="margin-top:calc(var(--u)*4)">Featured engineering work</div>
<div class="lab" style="margin-top:calc(var(--u)*5)">Other builds</div>
```

The first `.proj` after each deletion keeps its own `border-top`, so no spacing rule needs adjusting.

- [ ] **Step 4: Revise 05.4's summary line**

Replace 05.4's `<p class="pdesc">` content. The current one makes Formula 1 the subject; the project is for someone new to a sport.

```html
          <p class="pdesc">An assistant for someone new to a sport, who wants to know who a
            player is or why a result mattered and has no way to tell a real answer from an
            invented one. It answers only from real data and prints its sources. Built against
            Formula 1 timing data.</p>
```

- [ ] **Step 5: Rebuild 05.4's detail panel**

Replace the four `.fld` divs inside `<div class="detail" id="p4" data-open="true">` with:

```html
              <div class="fld"><span class="k">Inspiration</span><p>Getting into a sport means asking questions with obvious answers to everyone but you: who drives for which team, who is number 11, why that lap mattered. Ask a chatbot and you get a fluent answer that may be entirely invented, which is worse than no answer when you have no way to check it. The idea was an assistant a newcomer could trust, because it answers only from real data and shows where each number came from.</p></div>
              <div class="fld"><span class="k">Approach</span><p>Fetch the numbers first, then let the model write only from what a tool returned. It never answers from memory, and every report prints its source. An agent mode lets it choose which data tools to call across several steps. It is built against Formula 1 timing data, and the shape is deliberately sport-agnostic: the model never touches the data source directly, so another sport is another set of tools rather than a rewrite.</p></div>
              <div class="fld"><span class="k">Result</span><p>73 tests, all offline, with every external call fixtured, so the suite runs anywhere without a network or an API key.</p></div>
              <div class="fld"><span class="k">What I learned</span><p>I built it so the model never answers from memory: it only ever sees what a tool returned, and every report prints its sources. Prompting it to be careful did not hold; only the structure did.</p></div>
              <div class="fld"><span class="k">Technology</span><p>Python &middot; OpenAI function calling &middot; Typer &middot; FastF1 &middot; pytest</p></div>
```

The `Features` and `Delivered` fields are gone; `Technology` moves to last; `What I learned` is kept verbatim from the existing entry.

- [ ] **Step 6: Run the tests**

Run: `node --test`
Expected: 88 pass, 0 fail. `05.5` and `05.6` still fail the spine test — no. Verify: they will fail, because they still open on `Features`. **Expected at this point: 1 failing**, naming 05.5. Tasks 4 and 5 clear it.

To keep the suite green at every task boundary, run Tasks 3, 4 and 5 as one commit sequence, or temporarily scope the spine test to the panels already rebuilt. This plan takes the first option: **Task 3 does not commit until Task 4 and Task 5 are done.** See Task 5, Step 5.

- [ ] **Step 7: Do not commit yet**

Continue to Task 4. The spine test cannot pass until all six panels conform.

---

### Task 4: 05.5 Quorum

The entry is rewritten whole. MeeTeam no longer exists: `ashleytzele/MeeTeam` returns 404 and the repository was renamed to `ashleytzele/Quorum` on 2026-08-11. Everything below is verified from that repository.

**Files:**
- Modify: `index.html` — 05.5's name, tagline, summary, figure caption, panel and source link

**Interfaces:**
- Consumes: the permitted field set from Task 3.
- Produces: nothing later depends on it.

- [ ] **Step 1: Rename the project**

In 05.5's `.ph` block, change the heading and tagline:

```html
      <div class="ph"><div class="r">05.5</div><h3>Quorum</h3>
        <div class="tagline">Meeting Software</div></div>
```

- [ ] **Step 2: Replace the summary line**

```html
          <p class="pdesc">Meeting software where preparation, minutes and archive are one flow.
            Teams submit before the meeting, an admin reviews and records it, minutes are generated
            against a template, and everything is exported and kept searchable afterwards.</p>
```

- [ ] **Step 3: Rebuild the panel**

Replace the three `.fld` divs inside `<div class="detail" id="p5" data-open="true">` with:

```html
              <div class="fld"><span class="k">Problem</span><p>A company running recurring team meetings has its preparation scattered before and its notes scattered after. Each team keeps its own notes somewhere, the minutes are written from memory by whoever remembers to, and a month later nobody can find what was agreed.</p></div>
              <div class="fld"><span class="k">Approach</span><p>One flow across three cooperating pieces: a web app where teams submit ahead and an admin reviews, records and presents; a local engine that turns the recording and the submitted notes into minutes against a chosen template; and an optional desktop recorder. Meeting status is derived from what has actually happened, never set by hand: collecting, recorded, draft, published.</p></div>
              <div class="fld"><span class="k">Architecture</span><p>The AI generation is opt-in and runs locally. The web app health-checks a bridge on the local machine; if it is not running, generation is disabled with a message that says so, and the entire structured flow still works. The model is an enhancement to the product, not a dependency of it.</p></div>
              <div class="fld"><span class="k">What went wrong</span><p>Two row-level security failures, both fixed with definer-rights functions. The admin check queries the profiles table, and the policy guarding profiles calls the admin check, so without definer rights it recursed forever. Separately the signup trigger needed its search path pinned, or creating an account failed outright with a database error that said nothing useful about why.</p></div>
              <div class="fld"><span class="k">Result</span><p>Seven pages and no framework, with the pure helpers split out and unit tested.</p></div>
              <div class="fld"><span class="k">What I learned</span><p>Getting row-level security right was harder than building the features it protects. A policy that queried the same table it guarded recursed forever, and the fix was to move the lookup into a definer-rights function.</p></div>
              <div class="fld"><span class="k">Technology</span><p>JavaScript &middot; Supabase &middot; PostgreSQL &middot; row-level security &middot; Python</p></div>
```

- [ ] **Step 4: Update the figure caption**

The interim drawing stays until it is redrawn or replaced. Update only its caption text and its `aria-label`, replacing every occurrence of the old name:

```bash
grep -n 'MeeTeam' index.html
```

Expected after editing: no matches anywhere in the file.

- [ ] **Step 5: Fix the source link**

The current link points at `https://github.com/ashleytzele/MeeTeam`, which returns 404. Change it to:

```html
            <div class="refs"><a href="https://github.com/ashleytzele/Quorum"><svg class="ico" aria-hidden="true"><use href="#i-github"/></svg> Source</a></div>
```

**This link is only correct once the repository is public.** Verify before committing:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://github.com/ashleytzele/Quorum
```

Expected: `200`. **If it returns 404, stop and escalate** — a source link to a 404 reads worse than no link, and shipping one would repeat the defect this task exists to fix.

- [ ] **Step 6: Continue to Task 5**

Do not commit yet.

---

### Task 5: 05.6 SplitWise — BLOCKED ON COPY

**Two of this task's three fields cannot be written by an implementer.** Spec §5 marks `Approach` and `Result` as Ashley's to supply. Do not invent them.

**Files:**
- Modify: `index.html` — 05.6's summary line and panel

- [ ] **Step 1: Replace the summary line**

The current one lists features rather than saying why the project exists.

```html
          <p class="pdesc">Swim analysis without a subscription or a sensor rig. It works from the
            numbers any swimmer can record at the pool, and turns them into the few that show
            whether a race went well.</p>
```

- [ ] **Step 2: Write the two fields that are unblocked**

Replace the three `.fld` divs inside `<div class="detail" id="p6" data-open="true">` with the four below. `Approach` and `Result` carry Ashley's copy; if it has not arrived, **stop here and escalate rather than drafting them.**

```html
              <div class="fld"><span class="k">Inspiration</span><p>Swim analysis tools want a subscription and a level of detail most swimmers cannot easily produce: sensors, stroke telemetry, somebody entering all of it. I swim, so I knew which numbers actually matter and which ones anyone can get with a stopwatch and a lane. The question was how much useful insight you can reach from only the easily measurable ones.</p></div>
              <div class="fld"><span class="k">Approach</span><p>[ASHLEY: which metrics you settled on as the easily-measurable set, and what they are derived into. The existing lessons text says deciding what a race is actually made of took longer than building the charts — that decomposition is the substance of this field.]</p></div>
              <div class="fld"><span class="k">Result</span><p>[ASHLEY: it is deployed with a recorded demo. Whether anyone else uses it, and any figure worth stating.]</p></div>
              <div class="fld"><span class="k">What I learned</span><p>I swim the sport, so I already knew which numbers mattered, and that turned out to be most of the design work. Deciding what a race is actually made of took far longer than building the charts.</p></div>
              <div class="fld"><span class="k">Technology</span><p>Flask &middot; SQLAlchemy &middot; Bootstrap &middot; Chart.js &middot; Python</p></div>
```

**The `Technology` line names no database.** Three sources disagree — the site once said MongoDB, the code uses Flask-SQLAlchemy, and the `Procfile` launches a CSV/JSON/SQLite path. Naming one before that is settled would put a false claim on the sheet.

- [ ] **Step 3: Write the database guard**

The one factual claim on this sheet that three sources contradict deserves a test, not a good intention. Append to `test/contracts.test.mjs`:

```javascript
test('05.6 names no database until the contradiction is settled', () => {
  // The site once said MongoDB, the code uses Flask-SQLAlchemy, and the Procfile
  // launches a CSV/JSON/SQLite path. Until someone reads the deployment and
  // decides, naming any of them puts a false claim on the sheet.
  const a005 = /<section class="sheet" id="a005"[\s\S]*?\n<\/section>/.exec(html)?.[0] ?? '';
  const entry = /<article class="proj an" id="proj-6">[\s\S]*?<\/article>/.exec(a005)?.[0] ?? '';
  assert.notEqual(entry, '', 'expected the 05.6 entry');
  for (const db of ['MongoDB', 'Mongo', 'SQLite', 'PostgreSQL', 'Postgres', 'MySQL']) {
    assert.ok(!new RegExp(`\\b${db}\\b`, 'i').test(entry),
      `05.6 names ${db}; three sources disagree about which is true`);
  }
});
```

- [ ] **Step 4: Run it and confirm it passes**

Run: `node --test`
Expected: it passes immediately — the copy in Step 2 names no database. That is correct for a guard: it is here to fail the day someone adds one.

- [ ] **Step 5: Verify no bracketed placeholder ships**

```bash
grep -c 'ASHLEY:' index.html
```

Expected: `0`. If it is not zero, the task is incomplete and must not be committed.

- [ ] **Step 6: Run the full suite**

Run: `node --test`
Expected: 89 pass, 0 fail. All six panels now conform to the spine.

- [ ] **Step 7: Commit Tasks 3, 4 and 5 together**

```bash
git add index.html test/contracts.test.mjs
git commit -m "Rebuild the A-005 panels on one field spine

Every panel now opens on a context field whose label depends on how the work
began: Problem where it was handed to her, Inspiration where it started from her
own interest. Approach, Result and What I learned follow in every entry, and
Constraints, Architecture and What went wrong appear only where they are real. No
project manufactures a failure to fill a slot.

05.4 was framed as an anti-hallucination exercise about Formula 1. It is an
assistant for someone new to a sport who cannot tell a real answer from an
invented one; the fact-grounding is how it earns trust, not what it is about.
Formula 1 is named as what it is built against, not as what it is for.

05.5 is rewritten whole. MeeTeam no longer exists — the repository was renamed to
Quorum, and the old source link had been returning 404 to every visitor.

Drops Featured engineering work and Other builds. They marked the three projects a
stranger can actually clone and run as the lesser three."
```

---

### Task 6: Verification

**Files:**
- Modify: `index.html` — the cover `Updated` value only
- Modify: `assets/css/blueprint.css:396` — the `.dgrid` minimum column

- [ ] **Step 1: Fix the field-grid overflow**

`.dgrid` uses a 230px minimum column inside a content box that is 216px at a 334px viewport, so it overflows. Change line 396:

```css
.dgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr));gap:calc(var(--u)*3) calc(var(--u)*4)}
```

`min(230px,100%)` keeps the 230px preference on any viewport wide enough for it, and collapses to a single full-width column below that.

- [ ] **Step 2: Confirm the structure survived the rewrite (spec §9)**

Three panels were rebuilt and two labels deleted. Verify nothing else moved:

```bash
# heading order: one h2 for the sheet, one h3 per project, no h4 introduced
python3 - <<'PY'
import re
h=open('index.html').read(); a=h[h.index('id="a005"'):h.index('id="a006"')]
print('  h2:', len(re.findall(r'<h2', a)), ' h3:', len(re.findall(r'<h3', a)),
      ' h4:', len(re.findall(r'<h4', a)))
print('  client-work markers:', a.count('Client work &mdash; not published'))
print('  aria-controls:', len(re.findall(r'aria-controls="p\d"', a)))
print('  proj ids:', re.findall(r'id="(proj-\d)"', a))
PY
```

Expected: `h2: 1  h3: 6  h4: 0`, **two** client-work markers (05.2 and 05.3 — deleting one would silently republish client work), six `aria-controls`, and `proj-1` through `proj-6` intact so A-004's evidence links still resolve.

- [ ] **Step 3: Sweep the repo for confidentiality**

```bash
node --test 2>&1 | grep -A3 'client-identifying'
```

Expected: a passing line. The test scans every tracked file that contains no NUL byte, so it covers documentation as well as markup.

- [ ] **Step 4: Update the cover `Updated` value**

```bash
git log -1 --format=%ad --date=short -- index.html assets/css/blueprint.css assets/js/blueprint.js
```

Set the cover's `Updated` field to that date. This is the only permitted cover edit.

- [ ] **Step 5: Run the full suite**

Run: `node --test`
Expected: 88 pass, 0 fail.

- [ ] **Step 6: Measure in a browser**

Serve with `python3 -m http.server 8118` and follow `test/README.md` for `tools/measure-in-browser.js`. At 390, 768 and 1440 in both themes, confirm:

- no horizontal overflow on any photographic figure;
- SplitWise's video controls reachable without panning;
- the three drawn figures still pan, which is expected and deferred;
- every panel visible before the runtime initialises.

**This gate was never run during the A-004 work, and three of that sheet's defects were visible only in a rendered page.** Run it here.

**Measurement traps, all previously hit in this repo:**
- The automation tab reports `visibilityState: "hidden"` and throttles observers and animations. Check `classList` and `getAnimations().playState`, never a screenshot.
- A cache-buster on the HTML does **not** refresh the linked CSS. Force it: `fetch('assets/css/blueprint.css',{cache:'reload'})`.
- A child's computed `display` does not reflect a hidden parent. Use `offsetParent` or `getBoundingClientRect`.
- Exit code 0 does not mean an artefact exists.

- [ ] **Step 7: Commit**

```bash
git add index.html assets/css/blueprint.css
git commit -m "Stop the panel field grid overflowing a narrow phone, and move the cover date

.dgrid asked for a 230px minimum column inside a 216px content box below a 334px
viewport. min(230px,100%) keeps the preference where it fits and collapses to one
column where it does not."
```

---

## Out of Scope

- The entry layout, in any form. Spec §12 records the decision as closed.
- Reordering or renumbering the six projects.
- Backlinks from A-005 to A-004's claims.
- A-001, A-002, A-003, A-004 and the cover, beyond the `Updated` value.
- The uniform 16:9 crop and the three figure redraws — spec §11, deferred.
- The 40MB `CAD-MAP video.mov`, now gitignored, awaiting a re-encode.
- Deployment. Nothing has been pushed.

## Known Blockers

1. **Quorum must be public** before Task 4 can commit. Task 4 Step 5 verifies and escalates.
2. **Two SplitWise fields** need Ashley's copy. Task 5 Step 2 escalates rather than drafting.
3. **The SplitWise database** is unresolved across three sources. No database is named until it is.
4. **`Technology` is not in the spec's permitted set** but exists on three entries. This plan keeps it; spec §3 needs a one-line amendment to match.
