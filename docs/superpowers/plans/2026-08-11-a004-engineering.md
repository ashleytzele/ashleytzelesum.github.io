# A-004 Engineering Implementation Plan

**Status: executed and merged.** Branch `a004-engineering`, 11 commits, fast-forwarded into `blueprint-redesign` at `58e28b9`. Suite went 76 → 83.

This document is kept as the record of what was *planned*. It has deliberately **not** been rewritten to match the outcome — the gap between the two is the useful part, and it is recorded in "As executed" at the end. Read that section before trusting any line count, test count or code block below.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the A-004 Engineering sheet with a static claim-and-evidence sheet, per `docs/superpowers/specs/2026-08-11-a004-engineering-design.md`.

**Architecture:** Four authored claims, each linking to exact project drawings in A-005, plus an evidenced stack listing. No figure — spec §7 records why. Entirely static — no JavaScript participates in A-004 beyond the site-wide reveal. The superseded module index, its runtime, its CSS and 14 now-orphaned sprite symbols are deleted in the same commit that removes the markup referencing them.

**Tech Stack:** Hand-written HTML, CSS and SVG. Node's built-in test runner. No dependencies, no build step.

## Global Constraints

- No framework, bundler, build step, dependency, CDN or third-party request. Enforced by test.
- `node --test` from the repo root. **`node --test test/` does not work** — Node resolves the directory as a module.
- The suite must be green at the end of every task. It is currently 76/76.
- No hex colour outside a theme block in `assets/css/blueprint.css`. Enforced by test.
- No gradients, shadows, glows, blurs, rounded card grids or emoji.
- Every interactive element at least 44×44 including width; adjacent targets ≥12px apart.
- A border that is a control's only resting-state affordance must clear 3:1 against `--paper` in both themes. `--line` is 1.41:1 and must not be used for this; `--ref` is 4.54:1 / 5.93:1.
- Every grid track that must shrink is `minmax(0,1fr)`. Bare `1fr` is a defect and is tested for.
- No client-identifying term in any tracked file. Enforced by test against gitignored `.confidential-terms`.
- A-001, A-002, A-003 and the cover composition are unchanged. The cover's `Updated` value is the sole permitted cover edit, and only in Task 5.
- Copy is verbatim from the spec. Numerals, never words. Project names match A-005 exactly.

---

## File Structure

| File | Responsibility for this change |
|---|---|
| `index.html` | The `#a004` section, replaced whole. The 14 orphaned sprite symbols, deleted. The cover `Updated` value, in Task 5. |
| `assets/css/blueprint.css` | `.detail:target`. New A-004 rules. Deletion of `.legend`, `.lgcol`, `.mod`, `.modout`, `.tags`, `.tag`, `#a004 .dwgbox`. |
| `assets/js/blueprint.js` | Deletion of the A-004 module-to-drawing lookup. |
| `test/contracts.test.mjs` | Six new tests. |

**Bounds as of writing** — re-derive before editing, do not trust these line numbers blindly:

- `#a004` section: `index.html` lines 289–394, followed by `<!-- A-005 PROJECTS -->` at 396.
- Sprite: one line, `index.html:30`. Contains all 16 `<symbol>` elements.
- Cover `Updated`: `index.html:80`.
- CSS to delete: `blueprint.css` 29–37 (`.legend`, `.lgcol`), 304–305 (`.tags`, `.tag`), 328 (`#a004 .dwgbox svg`), 500–513 (`.mod`, `.modout`).
- CSS to amend, **not delete**: `blueprint.css:325` — `@media(max-width:1040px){.figbox::after,#a004 .dwgbox::after{...}}`. `.figbox::after` is shared with A-005 figures. Remove only the `#a004 .dwgbox::after` selector from the list.
- JS to delete: the block introduced by `/* A-004 module-to-drawing lookup. */`, `blueprint.js:135` to the end of its IIFE at 164.
- `.detail` rules: `blueprint.css:411–412`.

---

### Task 1: The `.detail:target` prerequisite

Blocking. Without it every A-004 evidence link scrolls to an element with no layout box, silently. This also fixes a latent defect in A-005 today: a shared `#p3` link from anywhere lands nowhere.

**Files:**
- Modify: `assets/css/blueprint.css:411-412`
- Test: `test/contracts.test.mjs`

**Interfaces:**
- Produces: `.detail:target{display:block}` — Task 2's evidence links depend on it.

- [ ] **Step 1: Write the failing test**

Append to `test/contracts.test.mjs`:

```javascript
test('a linked project detail opens without script', () => {
  // A-005's panels are display:none until data-open is set by the runtime, and
  // none of them ship that attribute. Without a :target rule every cross-sheet
  // evidence link scrolls to an element with no layout box, and fails silently.
  assert.match(css, /\.detail:target\s*\{[^}]*display\s*:\s*block/,
    'expected .detail:target{display:block} so #p1-#p6 are reachable by link');
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `node --test`
Expected: 1 failing — `expected .detail:target{display:block}`.

If `css` is not already a bound fixture in this file, read the top of `test/contracts.test.mjs` and reuse whatever variable holds `assets/css/blueprint.css`; do not add a second reader.

- [ ] **Step 3: Add the rule**

In `assets/css/blueprint.css`, immediately after line 412:

```css
/* A fragment link into a project detail opens it. :target resolves before layout,
   so an evidence link from A-004 works with script, without script, and when
   script is enabled but fails. */
.detail:target{display:block}
```

- [ ] **Step 4: Run the tests**

Run: `node --test`
Expected: 77 pass, 0 fail.

- [ ] **Step 5: Verify by hand**

Serve with `python3 -m http.server 8118`, open `http://localhost:8118/#p3`, and confirm the ePOS Simulator detail panel is expanded and scrolled to. Repeat with JavaScript disabled.

- [ ] **Step 6: Commit**

```bash
git add assets/css/blueprint.css test/contracts.test.mjs
git commit -m "Open a project detail when it is the link target

A-005's detail panels are display:none until the runtime sets data-open, and
none of them ship it. Any link to #p1-#p6 therefore scrolled to an element with
no layout box and appeared to do nothing. :target resolves before layout, so the
panel now opens with script, without it, and when script fails."
```

---

### Task 2: Replace the A-004 sheet

The whole swap in one commit: new markup, old markup gone, orphaned sprite symbols gone, dead CSS and JS gone. Splitting it would leave the suite red between tasks, because the `sprite has no dead symbols` test fires the moment the module buttons disappear.

**Files:**
- Modify: `index.html` — replace lines 289–394; delete 14 `<symbol>` elements from line 30
- Modify: `assets/css/blueprint.css` — delete 29–37, 304–305, 328, 500–513; amend 325; add new A-004 rules
- Modify: `assets/js/blueprint.js` — delete lines 135–164 (the A-004 lookup, inside its IIFE)
- Test: `test/contracts.test.mjs`

**Interfaces:**
- Consumes: `.detail:target` from Task 1.
- Produces: `#a004` containing `.claim` blocks with ids `c1`–`c4`, `.ev` evidence links targeting `#p1`–`#p6`, and `.stk`.

- [ ] **Step 1: Write the failing tests**

Append to `test/contracts.test.mjs`:

```javascript
const a004 = /<section class="sheet" id="a004"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';

test('A-004 has four claims and each carries its reference number in the heading', () => {
  assert.notEqual(a004, '', 'expected an #a004 section');
  const ids = [...a004.matchAll(/<div class="claim" id="(c\d)"/g)].map(m => m[1]);
  assert.deepEqual(ids, ['c1', 'c2', 'c3', 'c4']);
  // The figure's text alternative calls these "Claim 04.1"; a headings-list
  // navigation has to return the same thing.
  const headings = [...a004.matchAll(/<h3><span class="n">(04\.\d)<\/span>/g)].map(m => m[1]);
  assert.deepEqual(headings, ['04.1', '04.2', '04.3', '04.4']);
});

test('every A-004 evidence link targets a project detail that exists', () => {
  const targets = [...a004.matchAll(/class="ev" href="#(p\d)"/g)].map(m => m[1]);
  assert.ok(targets.length >= 10, `expected the evidence links, found ${targets.length}`);
  for (const t of new Set(targets)) {
    assert.ok(html.includes(`<div class="detail" id="${t}">`), `evidence link points at #${t}, which does not exist`);
  }
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

test('A-004 carries no figure', () => {
  // Spec 7: the key plan was cut because its hand-computed geometry made every
  // future project a redraw. If a figure ever returns it must be a table, so this
  // guard forces that decision to be made deliberately rather than by drift.
  assert.ok(!/<svg/.test(a004), 'A-004 must contain no svg; see spec section 7');
});

test('A-004 claims no proficiency level', () => {
  // A rating is unfalsifiable and was the failure of the sheet this replaces.
  assert.ok(!/(proficien|skill-level|\blevel-\d|\d{1,3}\s*%|★|expert|advanced|intermediate)/i.test(a004),
    'A-004 must not imply a proficiency rating');
});
```

Reuse the existing `html` and `js` fixtures at the top of the file. If `js` is not bound, add a reader for `assets/js/blueprint.js` alongside the existing ones.

- [ ] **Step 2: Run and confirm they fail**

Run: `node --test`
Expected: 5 failing. The first fails on claim ids, the third on `blueprint.js still references #a004`.

- [ ] **Step 3: Replace the `#a004` section**

Replace `index.html` lines 289–394 entirely with:

```html
<section class="sheet" id="a004" data-draw>
  <div class="pane">
    <div class="hdr"><div class="d"><b>Drawing A-004</b> &nbsp;<span>Engineering</span></div>
      <div class="m">Sheet 4 of 6 &nbsp;&middot;&nbsp; Rev 3.0 &nbsp;&middot;&nbsp; Active</div></div>
    <div style="margin-top:calc(var(--u)*5)"><h2>Engineering</h2></div>
    <p class="a4-lead">Four things I do consistently, and the drawings where each one is on the
      record. This sheet is the claim; the next one is the evidence.</p>

    <div class="claims">

      <div class="claim" id="c1">
        <h3><span class="n">04.1</span> I work inside constraints I do not control</h3>
        <div class="claim-b">
          <p>Each of these started with something fixed that I could not negotiate with. A kiosk
            with no network connection at runtime. A cloud point-of-sale that could not be
            modified. 391 devices whose codes were printed on cabinet labels and buried in saved
            procedures, so renaming them was rejected outright.</p>
          <p class="how">Ruling out a tile server forced the whole map, routing included, to ship
            as one self-contained file. Being unable to touch the point-of-sale is what turned a
            driver problem into a protocol one. The constraint is usually where the interesting
            decision is.</p>
          <div class="evrow">
            <a class="ev" href="#p1">05.1 <span class="nm">cad-to-map</span></a>
            <a class="ev" href="#p2">05.2 <span class="nm">Asset Management System</span></a>
            <a class="ev" href="#p3">05.3 <span class="nm">ePOS Simulator</span></a>
          </div>
        </div>
      </div>

      <div class="claim" id="c2">
        <h3><span class="n">04.2</span> I put the guarantee in the structure, not in the caller</h3>
        <div class="claim-b">
          <p>Asking a language model to be careful about accuracy did not hold, so it now only
            ever sees what a tool returned and cannot cite a number nobody gave it. Access rules
            live in the database rather than in the application that calls it. A work order from
            an unrecognised source stops rather than dispatching, and nothing is ever dispatched
            unattended.</p>
          <p class="how">Row-level security was harder to get right than the features it protects:
            a policy that queried the table it guarded recursed forever, and the fix was moving
            the lookup into a definer-rights function.</p>
          <div class="evrow">
            <a class="ev" href="#p4">05.4 <span class="nm">ScoutMini</span></a>
            <a class="ev" href="#p5">05.5 <span class="nm">MeeTeam</span></a>
            <a class="ev" href="#p2">05.2 <span class="nm">Asset Management System</span></a>
          </div>
        </div>
      </div>

      <div class="claim" id="c3">
        <h3><span class="n">04.3</span> I verify what I will not be there to watch</h3>
        <div class="claim-b">
          <p>80 Python tests and 21 routing checks guard a converter running unattended at six
            sites. 73 more run with no network at all, every external call fixtured. A
            throw-injection test raises deliberately at 12 points inside one function, because
            that is how a graph corruption was found: the snap step wrote a node into the shared
            graph before registering it for cleanup, and left it welded in at 10 of those 12
            points.</p>
          <div class="evrow">
            <a class="ev" href="#p1">05.1 <span class="nm">cad-to-map</span></a>
            <a class="ev" href="#p3">05.3 <span class="nm">ePOS Simulator</span></a>
            <a class="ev" href="#p4">05.4 <span class="nm">ScoutMini</span></a>
          </div>
        </div>
      </div>

      <div class="claim" id="c4">
        <h3><span class="n">04.4</span> I work out what the thing actually is before I build the screen</h3>
        <div class="claim-b">
          <p>I swim competitively, so I already knew which numbers mattered &mdash; and deciding
            what a race is actually made of took far longer than building the charts. Equipment
            identity split the same way: position and role are known at procurement, before a
            device physically exists, while its address and credentials only exist once it is
            commissioned, so no single system could own the whole record.</p>
          <p class="how">Getting the model of the thing right is most of the design work. The
            interface is what is left over once you know what you are describing.</p>
          <div class="evrow">
            <a class="ev" href="#p6">05.6 <span class="nm">SplitWise Swimming Analytics</span></a>
            <a class="ev" href="#p2">05.2 <span class="nm">Asset Management System</span></a>
          </div>
        </div>
      </div>

    </div>

    <div class="stk">
      <span class="k">Built with</span>
      <dl>
        <dt>Languages</dt><dd>Python &middot; JavaScript &middot; Java &middot; Kotlin &middot; SQL &middot; HTML &middot; CSS</dd>
        <dt>Frameworks</dt><dd>Flask &middot; SQLAlchemy &middot; Android &middot; Bootstrap &middot; Chart.js &middot; ezdxf &middot; Shapely &middot; MapLibre GL</dd>
        <dt>Systems</dt><dd>REST &middot; MQTT &middot; ESC/POS &middot; ePOS-Print &middot; TLS &middot; GeoJSON</dd>
        <dt>Data</dt><dd>PostgreSQL &middot; SQLite &middot; Supabase</dd>
      </dl>
      <p class="practice"><span class="k">Practice</span> I work with coding agents daily, and design
        around what they get wrong &mdash; see <a href="#c2">04.2</a>.</p>
    </div>

    <div class="handoff">
      <p>Every drawing on the next sheet carries at least one of these.</p>
      <a class="ev" href="#a005">A-005 Projects &rarr;</a>
    </div>

  </div>
</section>
```

`data-draw` is retained deliberately: the site-wide reveal is fail-open and applies to every sheet. It is not an A-004-specific behaviour, which is what spec §9 forbids.

- [ ] **Step 4: Delete the 14 orphaned sprite symbols**

In `index.html:30`, delete the `<symbol>…</symbol>` element for each of: `i-android`, `i-androidstudio`, `i-bootstrap`, `i-chartdotjs`, `i-claude`, `i-css`, `i-flask`, `i-git`, `i-html5`, `i-javascript`, `i-openjdk`, `i-python`, `i-visualstudiocode`, `i-zedindustries`.

Keep `i-github` and `i-linkedin`, which A-006 uses.

Verify before committing:

```bash
diff <(grep -oE '<symbol id="i-[a-z0-9]+"' index.html | sed 's/.*id="//;s/"//' | sort) \
     <(grep -oE '<use href="#i-[a-z0-9]+"' index.html | sed 's/.*#//;s/"//' | sort -u)
```

Expected: no output. Any output is a dead symbol or a dangling reference.

- [ ] **Step 5: Delete the A-004 runtime**

In `assets/js/blueprint.js`, delete from the `/* A-004 module-to-drawing lookup. */` comment through the end of that block, leaving the enclosing IIFE's closing `})();` intact. Confirm:

```bash
grep -n 'a004\|modout\|\.mod' assets/js/blueprint.js || echo "clean"
node -e "new Function(require('fs').readFileSync('assets/js/blueprint.js','utf8'))" && echo "parses"
```

- [ ] **Step 6: Delete the dead CSS and amend the shared rule**

Delete from `assets/css/blueprint.css`: lines 29–37 (`.legend`, `.lgcol` and descendants), 304–305 (`.tags`, `.tag`), 328 (`#a004 .dwgbox svg`), 500–513 (`.legend .mod`, `.modout` and descendants).

At line 325, remove only the `#a004 .dwgbox::after` selector, leaving `.figbox::after` — A-005's figures still use it:

```css
@media(max-width:1040px){.figbox::after{content:"\2190 scroll to pan \2192";display:block;
```

- [ ] **Step 7: Add the A-004 CSS**

Append to `assets/css/blueprint.css`:

```css
/* A-004 Engineering. A claim sheet: four authored claims, each linking to the
   drawings that evidence it. No script participates beyond the site-wide reveal. */
.a4-lead{font-size:clamp(.95rem,1.7vw,1.1rem);color:var(--sec);max-width:54ch;
  margin-top:calc(var(--u)*2);text-wrap:pretty}
/* One measure. With no figure competing for width, the claims hold a comfortable
   line length instead of stretching across the pane. */
.claims{margin-top:calc(var(--u)*5);max-width:760px}
.claim{padding:calc(var(--u)*4) 0;border-top:1px solid var(--line)}
.claim:first-child{border-top:1px solid var(--ink);padding-top:calc(var(--u)*3)}
/* The reference number sits INSIDE the heading so a headings-list navigation
   returns "04.1 I work inside constraints...", matching what the figure calls it. */
.claim h3{font-size:clamp(1.05rem,2.1vw,1.26rem);font-weight:600;letter-spacing:-.022em;
  display:flex;gap:calc(var(--u)*2);align-items:baseline;text-wrap:balance}
.claim h3 .n{font-family:'MN',monospace;font-size:.76rem;font-weight:400;color:var(--ref);flex:none}
.claim-b{margin-left:calc(3.4rem + var(--u)*2)}
.claim-b p{font-size:.94rem;margin-top:calc(var(--u)*1.5);max-width:60ch;text-wrap:pretty}
.claim-b .how{color:var(--sec);font-size:.9rem}
/* Evidence references. The border is --ref, not --line: at 1px it is the only
   resting-state signal that these are controls, so it must clear 3:1 per WCAG
   1.4.11. --line is 1.41:1. min-width holds the target if a label is shortened. */
.evrow{display:flex;flex-wrap:wrap;gap:12px;margin-top:calc(var(--u)*2.5)}
.ev{display:inline-flex;align-items:center;gap:7px;min-height:44px;min-width:44px;padding:0 13px;
  font-family:'MN',monospace;font-size:.76rem;letter-spacing:.04em;color:var(--ink);
  text-decoration:none;border:1px solid var(--ref)}
.ev:hover{border-color:var(--ink);background:var(--hair)}
.ev .nm{font-family:'PS',sans-serif;font-size:.8rem;color:var(--sec);letter-spacing:0}
.ev:hover .nm{color:var(--ink)}
/* Stack as a description list, not <br> + <em>: the categories survive wrapping
   at 286px, and <em> was carrying styling rather than emphasis. */
.stk{border-top:1px solid var(--ink);margin-top:calc(var(--u)*6);padding-top:calc(var(--u)*2.5)}
.stk>.k{font-family:'MN',monospace;font-size:8px;letter-spacing:.2em;text-transform:uppercase;
  color:var(--ref);display:block;margin-bottom:calc(var(--u)*2)}
.stk dl{display:grid;grid-template-columns:6.5rem minmax(0,1fr);
  gap:calc(var(--u)*1.5) calc(var(--u)*2.5);margin:0;align-items:baseline;max-width:760px}
.stk dt{font-family:'MN',monospace;font-size:8px;letter-spacing:.2em;text-transform:uppercase;
  color:var(--ref)}
.stk dd{margin:0;font-size:.85rem;color:var(--sec);line-height:1.9}
/* Practice, not proficiency: a statement about how the work is done, pointing at
   the claim that evidences it, rather than a badge asserting a skill. */
.stk .practice{font-size:.85rem;color:var(--sec);margin-top:calc(var(--u)*3);max-width:62ch}
.stk .practice .k{display:inline;margin:0 8px 0 0}
.stk .practice a{color:var(--ink);text-decoration:none;border-bottom:1px solid var(--ref)}
.stk .practice a:hover{border-bottom-color:var(--ink)}
.handoff{margin-top:calc(var(--u)*5);padding-top:calc(var(--u)*2.5);border-top:1px solid var(--hair);
  display:flex;align-items:center;gap:calc(var(--u)*2);flex-wrap:wrap}
.handoff p{font-size:.9rem;max-width:46ch}
```

- [ ] **Step 8: Run the tests**

Run: `node --test`
Expected: 82 pass, 0 fail. `sprite has no dead symbols and no dangling references` must be among the passes.

- [ ] **Step 9: Commit**

```bash
git add index.html assets/css/blueprint.css assets/js/blueprint.js test/contracts.test.mjs
git commit -m "Rebuild A-004 as a claim sheet instead of a technology inventory

The sheet inventoried 26 technologies, which claims proficiency in 26 things and
concludes nothing. It now states four things Ashley does consistently and links
each to the exact drawings that evidence it, which is the one job neither A-003
nor A-005 can do.

Removes the module index, its runtime, its CSS, the panning affordance and the
ten resume tags. 14 of the 16 sprite symbols were referenced only by those
buttons and are deleted with them; i-github and i-linkedin survive for A-006.

No script participates in this sheet beyond the site-wide reveal, so there is no
failure mode to handle."
```

---

### Task 3: Responsive and print

**Files:**
- Modify: `assets/css/blueprint.css`

- [ ] **Step 1: Add the responsive rules**

Append to `assets/css/blueprint.css`:

```css
@media(max-width:640px){
  .stk dl{grid-template-columns:minmax(0,1fr);gap:2px}
  .stk dt{margin-top:calc(var(--u)*2)}
  .claim h3{display:block}
  .claim h3 .n{display:block;margin-bottom:4px}
  .claim-b{margin-left:0}
}
```

- [ ] **Step 2: Add the print rules**

Inside the existing `@media print` block in `assets/css/blueprint.css`:

```css
  /* A claim must not be separated from the evidence that supports it. */
  .claim,.stk{break-inside:avoid}
```

- [ ] **Step 3: Run the tests**

Run: `node --test`
Expected: 82 pass, 0 fail.

- [ ] **Step 4: Measure in a browser**

Serve with `python3 -m http.server 8118`. Follow `test/README.md` for `tools/measure-in-browser.js`. At 390px, 768px and 1440px, in both themes, confirm:

- no horizontal overflow at any width;
- every `.ev` at least 44×44, width included;
- the claims hold one measure and do not stretch across the pane;
- `.ev` border contrast against `--paper` at least 3:1 in both themes.

**Measurement traps, all previously hit in this repo:**
- The automation tab reports `visibilityState: "hidden"` and throttles observers and animations. Check `classList` and `getAnimations().playState`, never a screenshot.
- A cache-buster on the HTML does **not** refresh the linked CSS. Force it: `fetch('assets/css/blueprint.css',{cache:'reload'})`.
- A child's computed `display` does not reflect a hidden parent. Use `offsetParent` or `getBoundingClientRect`.
- Exit code 0 does not mean an artefact exists.

- [ ] **Step 5: Commit**

```bash
git add assets/css/blueprint.css
git commit -m "Make A-004 readable at every width and printable without orphans

One column at every size, with the claims held to a single measure instead of
stretching across the pane. In print, claims and the stack avoid breaking inside,
so an evidence row is never orphaned from the claim it supports."
```

---

### Task 4: Verification and the cover date

**Files:**
- Modify: `index.html:80` — the cover `Updated` value only

- [ ] **Step 1: Confirm the whole suite**

Run: `node --test`
Expected: 82 pass, 0 fail.

- [ ] **Step 2: Sweep the repo for confidentiality**

```bash
while IFS= read -r t; do
  [ -z "$t" ] && continue; case "$t" in \#*) continue;; esac
  git ls-files -z | xargs -0 grep -liF "$t" 2>/dev/null && echo "LEAK len=${#t}"
done < .confidential-terms
```

Expected: no `LEAK` lines. Sweep every tracked file, not only `index.html` — three past leaks were in docs, not markup.

- [ ] **Step 3: Update the cover `Updated` value**

The `the cover Updated date matches the last change to the site` test binds this field to the last git change touching `index.html`, `blueprint.css` or `blueprint.js`. Set `index.html:80` to that date:

```bash
git log -1 --format=%ad --date=short -- index.html assets/css/blueprint.css assets/js/blueprint.js
```

This is the only permitted cover edit. Title, subtitle, spacing, negative space, DOCUMENT BEGINS and the desktop composition are frozen.

- [ ] **Step 4: Run the tests once more**

Run: `node --test`
Expected: 82 pass, 0 fail.

- [ ] **Step 5: Re-run the design gate**

```
/impeccable critique index.html#a004
```

The prototype scored 22/32 against the previous sheet's 19/32. Below 24/32 means something regressed in implementation — the blocking `:target` fix and the Task 2 deletions should both raise the score.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Move the cover Updated field to the A-004 rebuild date"
```

---

## Out of Scope

Do not touch, in this plan:

- A-001, A-002, A-003 — unchanged per standing instruction
- A-005 content: the 05.4–05.6 field-set inconsistency, and any `Evidences 04.x` backlink. Phase two, separately specified
- The cover, beyond the `Updated` value in Task 5
- The `--ref` token at 4.54:1. It passes AA by 0.04 across eight uses at 8–12px, and is site-wide
- Deployment. Nothing has been pushed; the branch is `blueprint-redesign`, 32 commits ahead of `origin/main`

## Known Residual Issues

Carried forward deliberately, so they are not rediscovered as new findings:

- The mapping is asserted only from A-004's side until A-005 gains backlinks.
- No at-a-glance pattern and no reverse lookup, since there is no figure. Accepted so the sheet stays editable in minutes. Spec §7 records the reasoning and the condition for reinstating one.
- 05.6 carries one claim, 05.2 carries three. Honest, not balanced. Do not add references to even it out.
- MeeTeam is in progress; the legend says so. If that changes, the legend changes and the claims do not.

---

## As executed

What actually happened, against what this plan predicted. Written after the merge so the deviations are on the record rather than smoothed away.

### The plan was broadly right

Four tasks, in order, each leaving the suite green. The one structural call that held up under pressure was Task 2's insistence on doing the whole swap in a single commit — markup, runtime, CSS and sprite together — because the dead-symbol test fires the moment the module buttons disappear. Splitting it would have left the suite red between commits.

### What the plan missed

**A red baseline.** The first commit of any new day makes the cover's `Updated` field stale, so the suite was already failing on arrival in the worktree. Repaired in its own commit before Task 1. The plan treats the cover date as a single step at the end; it is really a per-day tax.

**A test broke that no task touched.** `runtime failure never earns the reveal gate` injected its forced failure through `querySelectorAll('.mod')` — a selector Task 2 deletes. The fix mattered more than it looks: that test's assertions only mean anything if A-001 has *already* been enhanced when the failure fires, so moving the injection to an early selector would have made it pass while proving nothing. It moved to `#themeToggle`, which the runtime queries after A-001's enhancement, and the assertion was tightened to match that exact point.

**`.dwgbox` had no other user.** The plan said to amend the shared `.figbox::after` rule and delete `#a004 .dwgbox svg`. In fact the whole `.dwgbox` selector family was A-004-only and went with it.

**Five failing tests were predicted; four failed.** The proficiency-rating test already passed, because the old sheet had no rating markup. It is a regression guard, not a driver.

### What the plan did not anticipate at all

Three defects surfaced only from looking at the rendered page. None was caught by 83 tests, two independent review agents, or static analysis:

1. **The Practice label was unstyled.** `.stk>.k` is a direct-child selector and the label sits one level deeper, so it inherited body type and read as the first two words of its own sentence.
2. **Every claim heading sat ~23px left of its own paragraph.** `.claim-b` was indented `3.4rem + 16px`; the reference number had no width, so it was content-sized at ~31px.
3. **Evidence links landed inside the disclosure.** `#pN` is the detail panel, below the title, figure and description — the reader arrived mid-panel with no idea which project they were in. Fixed by giving each project article an `id` and targeting that.

Both reviewers verified the links *resolved*. Neither checked where a reader ends up.

### Two rounds of fixes after the design gate

The gate scored 24/32 and found a **P0 that Task 1 introduced**: `.detail:target` had no counterpart for an explicit close, so a panel opened from an evidence link could never be closed and its button announced the opposite of what was on screen. The spec had filed the runtime sync as "optional, not required for correctness". That judgement was wrong and the spec now says so.

The second round removed something worse. Per-row drawing codes were added to the stack to answer a review finding about unattached content, then checked against A-005 and found substantially false — eleven of the technologies named appear nowhere in A-005, and the rows that did resolve cited the wrong drawings. They were removed. Spec §8 now forbids re-adding them without A-005 gaining the text first.

### Scope

A-005 was edited during the score-chasing round — six visible `Evidences 04.x` backlink rows — and then reverted on instruction. A-005 retains only six `id="proj-N"` attributes, which are invisible and are what make an evidence link land at the project. The bidirectional mapping test went with the backlinks; in its place, every claim must cite at least two distinct drawings.

### Final state

- 11 commits, merged fast-forward to `58e28b9`
- 83 tests passing, up from 76
- 8 new A-004 tests, 1 replaced, 1 pre-existing test repaired
- Deployment still unstarted; nothing pushed

### Not done

The manual browser measurement gate at 390 / 768 / 1440 was **never run** — the Chrome extension was disconnected for the whole implementation. Static analysis of grid tracks, fixed widths and content-box arithmetic was substituted, which proves no overflow is possible but cannot catch anything that merely looks wrong. Given that three of this plan's defects were visual-only, that gate is worth running before deploy.
