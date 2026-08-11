# A-004 Engineering Design Specification

**Status:** Approved for implementation

**Drawing:** A-004

**Sheet position:** 4 of 6

**Section anchor:** `#a004`

**Approved thesis:** Engineering approach map — claims, not inventory

**Approved prototype:** `prototype-a004-final.html` (rev 3, post-critique, no figure)

**Prior critique:** `.impeccable/critique/2026-08-10T14-18-20Z__index-html-a004.md` — 19/32

**Prototype critique:** `.impeccable/critique/2026-08-11T01-16-50Z__prototype-a004-final-html.md` — 22/32

---

## 1. Purpose

A-004 states what Ashley's engineering work has in common, and points at where each pattern is on the record.

The sheet exists because no other sheet can do this. A-003 owns career progression and responsibility. A-005 owns project depth, organised by artefact. Six project entries organised by artefact never add up to a conclusion about the engineer — a reader has to synthesise them, and a recruiter scanning for ninety seconds will not. A-004 is the only place that conclusion can live.

The sheet it replaces did the opposite: it inventoried 26 technologies, which claims proficiency in 26 things and concludes nothing. That framing is retired.

## 2. Design Thesis

Four authored claims about how she engineers. Each carries:

1. a plain-language heading in the first person;
2. a body paragraph of concrete instances, drawn from work already documented in A-005;
3. optionally one shorter note on mechanism or consequence;
4. two or three evidence references linking to the exact project drawings.

A stack listing closes the sheet, with each row citing the drawings that evidence it. There is no figure — see §7.

The sheet is deliberately short. It is a claim; A-005 is the evidence.

**No JavaScript.** The sheet is entirely static. This is the chosen resolution of the prior critique's fail-open finding: remove the failure mode rather than handle it. Nothing on A-004 may depend on script.

## 3. Prerequisite — production CSS change

**A-004 must not ship without this.** It is the one blocking defect found in the prototype critique.

A-005's project detail panels are `display:none` (`assets/css/blueprint.css:411`), overridden only by `.detail[data-open="true"]` (`:412`). None of `#p1`–`#p6` carry that attribute in `index.html`. There is no `:target` rule anywhere in the stylesheet.

Consequence: with JavaScript enabled and working — the majority case — every A-004 evidence link scrolls to an element with no layout box. Nothing appears to happen, and the failure is silent. The `<noscript>` block at `index.html:32` covers the JavaScript-disabled case only.

**Required change**, one declaration, added adjacent to `:412`:

```css
.detail:target{display:block}
```

`:target` resolves before layout, so the panel opens and the browser scrolls to it with or without JavaScript, and also when JavaScript is enabled but fails.

**Optional companion**, not required for correctness: on `hashchange`, sync the matching `.more` button's `aria-expanded` and label so the control does not contradict the visible state. If omitted, the link still works and the button label is merely stale until clicked.

## 4. Exact Visible Introduction

The sheet retains:

- `Drawing A-004`;
- visible name `Engineering`;
- `Sheet 4 of 6`;
- anchor `#a004`;
- the established revision/status metadata conventions.

The heading is:

> Engineering

The orienting sentence is:

> Four things I do consistently, and the drawings where each one is on the record. This sheet is the claim; the next one is the evidence.

## 5. Claim Content

Copy is verbatim. Reference numbers are `04.1`–`04.4` and are load-bearing: the claim ids, the headings and any future backlink from A-005 all depend on them.

### 04.1 — `id="c1"`

**Heading:** I work inside constraints I do not control

**Body:**

> Each of these started with something fixed that I could not negotiate with. A kiosk with no network connection at runtime. A cloud point-of-sale that could not be modified. 391 devices whose codes were printed on cabinet labels and buried in saved procedures, so renaming them was rejected outright.

**Note:**

> Ruling out a tile server forced the whole map, routing included, to ship as one self-contained file. Being unable to touch the point-of-sale is what turned a driver problem into a protocol one. The constraint is usually where the interesting decision is.

**Evidence:** `05.1 cad-to-map` · `05.2 Asset Management System` · `05.3 ePOS Simulator`

### 04.2 — `id="c2"`

**Heading:** I put the guarantee in the structure, not in the caller

**Body:**

> Asking a language model to be careful about accuracy did not hold, so it now only ever sees what a tool returned and cannot cite a number nobody gave it. Access rules live in the database rather than in the application that calls it. A work order from an unrecognised source stops rather than dispatching, and nothing is ever dispatched unattended.

**Note:**

> Row-level security was harder to get right than the features it protects: a policy that queried the table it guarded recursed forever, and the fix was moving the lookup into a definer-rights function.

**Evidence:** `05.4 ScoutMini` · `05.5 MeeTeam` · `05.2 Asset Management System`

Evidence order matches the order the body introduces each system. This is a requirement, not a preference — mismatched order forces the reader to re-map.

### 04.3 — `id="c3"`

**Heading:** I verify what I will not be there to watch

**Body:**

> 80 Python tests and 21 routing checks guard a converter running unattended at six sites. 73 more run with no network at all, every external call fixtured. A throw-injection test raises deliberately at 12 points inside one function, because that is how a graph corruption was found: the snap step wrote a node into the shared graph before registering it for cleanup, and left it welded in at 10 of those 12 points.

**Note:** none. This claim carries the densest technical material on the sheet and sits third, past the point a scanning reader is still reading paragraphs. It does not also get a closing line.

**Evidence:** `05.1 cad-to-map` · `05.3 ePOS Simulator` · `05.4 ScoutMini`

### 04.4 — `id="c4"`

**Heading:** I work out what the thing actually is before I build the screen

**Body:**

> I swim competitively, so I already knew which numbers mattered — and deciding what a race is actually made of took far longer than building the charts. Equipment identity split the same way: position and role are known at procurement, before a device physically exists, while its address and credentials only exist once it is commissioned, so no single system could own the whole record.

**Note:**

> Getting the model of the thing right is most of the design work. The interface is what is left over once you know what you are describing.

**Evidence:** `05.6 SplitWise Swimming Analytics` · `05.2 Asset Management System`

**Two references, not three.** MeeTeam was linked here in an earlier revision to make a figure symmetrical, and is never mentioned in this claim's body. Asymmetry is correct; padding is not. A future third reference is permitted only if the body earns it.

### Copy rules binding all four

- Numerals, never words. `391 devices`, not `three hundred and ninety-one`. This is a drawing set.
- Project names match A-005 exactly, including `Asset Management System` and `SplitWise Swimming Analytics` in full.
- At most two of the four claims carry a closing note. Four notes each ending on a maxim reads as a manifesto and violates the "understated" register in `PRODUCT.md`.
- Every factual instance must be traceable to A-005's own text. Where A-005 does not yet say it, either A-005 gains it in phase two or A-004 drops the claim.

## 6. Evidence Reference Model

Each reference is a link carrying both the drawing number and the project name, so it is unambiguous in a screen-reader links list and requires no recall.

- Target `#p1`–`#p6`, matching 05.1–05.6 in order. These ids already exist in `index.html`.
- Minimum target size 44×44, including `min-width`, so a shortened label can never fall under the floor.
- Adjacent targets separated by at least 12px.
- The resting-state border must clear 3:1 against `--paper` in both themes. `--line` is 1.41:1 and **must not** be used: with no underline and no other affordance, that border is the only signal these are controls, which WCAG 1.4.11 covers with no text-alternative exemption. `--ref` is 4.54:1 light and 5.93:1 dark and is the correct token.
- No section-level fallback. A reference that cannot point at exact evidence is not written.

## 7. No Figure — and why

**A-004 carries no figure.** This is a deliberate reversal, recorded here so it is not re-litigated as an oversight.

Two earlier revisions carried a key plan: a bus diagram mapping claims to drawings, with junction dots marking connections and a rule that no crossing may pass within 6 user units of a dot. It was informationally redundant — it restated the evidence links under each claim, and again in its own text alternative — and its geometry was hand-computed.

The maintenance arithmetic decided it. Adding a seventh project would mean recomputing four trunk spans, adding entry lanes, and re-verifying roughly thirteen crossing clearances by hand. That is thirty to sixty careful minutes per addition, on a sheet whose entire premise is that content will keep changing. The failure mode is silent and subtle: a dot sitting 1.6 units from a line it does not touch reads as a connection that is not there, and that exact defect shipped in an earlier revision.

Without it, adding a project is adding one link.

**What is lost, honestly:** the at-a-glance pattern, and reverse lookup — *which claims does 05.2 carry?* Neither is worth a permanent maintenance tax on a personal site that will be edited by one person, occasionally, months apart.

**If a figure is ever reinstated**, it must be a schedule — a real `<table>` with claims as rows and drawings as columns — not a node-link diagram. A table grows by adding a cell. Nothing about it can be geometrically wrong.

Consequently A-004 contains **no `<svg>` at all**. The drawing-set language on this sheet is carried by the reference notation, the rules, and the title block.

## 8. Stack Listing

Closes the sheet. Label: `Built with`. A `<dl>` in two columns: category, technologies.

| Category | Technologies |
|---|---|
| Languages | Python · JavaScript · Java · Kotlin · SQL · HTML · CSS |
| Frameworks | Flask · SQLAlchemy · Android · Bootstrap · Chart.js · ezdxf · Shapely · MapLibre GL |
| Systems | REST · MQTT · ESC/POS · ePOS-Print · TLS · GeoJSON |
| Data | PostgreSQL · SQLite · Supabase |

Four rows, down from seven. The per-row drawing codes an earlier revision carried are gone: they made the strip longer than its importance justified. The trade is recorded in §19.

**Rules.**

- **No logos.** Only 9 of the 25 technologies have a symbol available, and they are the least distinctive 9 — Python, HTML, CSS, Bootstrap. A logo row would give visual weight to the commodity half while MQTT, ESC/POS and PostgreSQL sat as plain text, inverting the emphasis. It is also the least maintainable option: every new technology would need an SVG sourced and its path data embedded by hand, against a sheet that must stay editable in minutes.
- **No editors, IDEs or version control.** Naming an editor claims nothing, and version control is assumed.
- **No AI coding tools in this list.** They are not what the systems were built with in the sense the other rows mean, and a badge invites an interviewer to re-open provenance rather than engineering. The practice line below states it directly instead.
- No proficiency ratings, bars, percentages or star levels, ever.
- `HTML`/`CSS` sit under Languages; `row-level security` is a technique and is named in 04.2's note rather than listed as a product.
- Real `<dl>` markup with `dt`/`dd` as direct children. An earlier revision used `<br>` for structure and `<em>` for styling — `<em>` announced emphasis on words carrying none, and the categories dissolved when lines wrapped at 286px.

### The practice line

Immediately below the list, one sentence:

> **Practice** — I work with coding agents daily, and design around what they get wrong — see 04.2.

`04.2` links to `#c2`.

This exists because the honest version of the AI question belongs on this sheet, but not as a tool badge. 04.2 already carries the strongest available evidence of AI judgement — *"asking a language model to be careful about accuracy did not hold, so it now only ever sees what a tool returned"* — which demonstrates understanding of how models fail. The line makes that discoverable to a recruiter screening for AI fluency, states practice rather than proficiency, and points at evidence rather than asserting a skill.

It is one sentence. It must not grow into a section.

## 9. Semantic Structure

- Sheet is `<section class="sheet" id="a004">`.
- `<h2>Engineering</h2>`; each claim is `<h3>`. No skipped levels.
- **The reference number lives inside the heading**: `<h3><span class="n">04.1</span> I work inside…</h3>`. A headings-list navigation must return four numbered headings, not four unnumbered ones.
- Each claim carries a stable `id` (`c1`–`c4`), so a backlink from A-005 becomes possible in phase two and `:target` works.
- **No `<svg>` on this sheet**, per §7. No icons, no figure.
- The stack uses `<dl>`/`<dt>`/`<dd>` with no wrapper elements: a wrapper would become the grid item instead of the terms.
- No ARIA where native semantics suffice. No live regions — nothing updates.

## 10. Progressive Enhancement and Failure States

| Condition | Required behaviour |
|---|---|
| JavaScript disabled | Sheet fully readable and fully navigable. Nothing is gated. |
| JavaScript enabled and working | Identical. Nothing on A-004 is enhanced by script. |
| JavaScript enabled but failing | Identical. There is no script to fail. |
| Stylesheet fails to load | Content readable in document order. Nothing on the sheet depends on CSS to convey meaning. |
| Reduced motion | No motion beyond the shared line-draw, which the existing `@media(prefers-reduced-motion:reduce)` block already neutralises. |

The line-draw animation is opt-in via `.runtime-ready`, so strokes paint fully on first render without script. This is existing, correct behaviour and must not be changed.

## 11. Layout and Responsive Behavior

### All widths

One column. With no figure competing for width, the claims are capped at a single comfortable measure rather than stretching across the pane. There is no breakpoint at 920px and no sticky element.

### 760px and below

The stack collapses to one column per row group.

### 640px and below

Claim headings stack the number above the text. Claim bodies lose their indent.

### Universal

- Every grid track that must shrink is `minmax(0, 1fr)` or a fixed track narrower than the smallest content box. Bare `1fr` is a defect and is tested for.
- No horizontal overflow at any width. No panning. No scroll containers.
- Verify at 390px, 768px and 1440px in both themes.

## 12. Visual Language

- All colour from existing tokens. No hex outside a theme block — enforced by test.
- No gradients, shadows, glows, blurs, rounded card grids or emoji.
- Hairlines are 1px `--line` for structure; `--ref` where a border is the sole affordance of a control.
- Type: Public Sans for prose, Spline Sans Mono for reference notation. No new families, weights or sizes.
- `text-wrap: balance` on headings, `pretty` on prose.
- No uppercase tracked label above every block. The sheet carries exactly one — the stack label. A per-claim label is scaffolding and is not permitted.

## 13. Motion

Inherits the sheet reveal from the existing system. With no figure there is no line-draw on this sheet. No sheet-specific motion, no staggered entrance per claim.

## 14. Print

- The sheet must print without loss on A3 landscape, the existing page setup.
- Claims and the stack need `break-inside: avoid` so a claim's evidence row is never orphaned from its heading. The current print block has no such rule for these blocks.
- With no figure, the print theme's lightened `--line` no longer affects anything load-bearing on this sheet.

## 15. Sheet Handoff

Closing line:

> Every drawing on the next sheet carries at least one of these.

Followed by a single reference to `A-005 Projects`.

Inbound: A-003 already hands off to A-005 directly. Whether it should route through A-004 instead is out of scope here.

## 16. What Gets Deleted

The current A-004 is replaced entirely, not amended. Removal is part of this task.

**From `index.html`** — the current `#a004` section in full: the fixed 1000px five-layer SVG, the `.dwgbox` scroll container, the 26 `.mod` buttons across five `.lgcol` groups, the `#modout` status region, and the ten `.tag` elements.

**From `assets/js/blueprint.js`** — the A-004 module-to-drawing lookup, currently the block beginning at the `/* A-004 module-to-drawing lookup. */` comment. No other sheet uses it.

**From `assets/css/blueprint.css`** — `.legend`, `.lgcol`, `.mod`, `.modout`, `.tags`, `.tag`, and the `#a004 .dwgbox` panning affordance at `:325` and `:328`. Verify each against other sheets before deleting; `.legend`/`.lgcol` must be checked for use outside A-004.

**From the icon sprite — this one will fail a test if missed.** 14 of the 16 `<symbol>` definitions are referenced only by A-004's module buttons: `i-android`, `i-androidstudio`, `i-bootstrap`, `i-chartdotjs`, `i-claude`, `i-css`, `i-flask`, `i-git`, `i-html5`, `i-javascript`, `i-openjdk`, `i-python`, `i-visualstudiocode`, `i-zedindustries`. Only `i-github` and `i-linkedin` are used elsewhere. The `sprite has no dead symbols and no dangling references` test fails unless all 14 symbols are deleted alongside the buttons.

## 17. Scope Boundaries

### In scope

- Replacing `#a004` in `index.html`
- A-004-specific CSS
- Deleting the superseded A-004 markup, CSS, JavaScript and sprite symbols
- The `.detail:target` declaration in §3, as a prerequisite
- New contract tests per §18

### Out of scope

- A-001, A-002, A-003 — unchanged, per standing instruction
- A-005 content, including the 05.4–05.6 field-set inconsistency and any backlink to A-004 — phase two, separately specified
- The cover — frozen
- The `--ref` token at 4.54:1. It passes AA by 0.04 across eight uses at 8–12px and is site-wide; changing it touches every sheet and is a separate decision
- Deployment

## 18. Acceptance and Verification

### Existing tests must stay green

`node --test` from the repo root — currently 76/76. Note `node --test test/` does not work.

Particular attention: `sprite has no dead symbols and no dangling references` (§16), `no hex colour outside a theme block`, `grid tracks that must shrink are declared minmax(0,1fr)`, `no icon-only control`, `every aria-controls target exists`, `no emoji anywhere`, `no client-identifying term appears in any tracked file`, and `the cover Updated date matches the last change to the site` — the last will require the cover's `Updated` field to move, which is a permitted mechanical edit and not a design change to the frozen cover.

### New tests required

1. **A-004 contains no script dependency.** No `<script>`, no `data-` hook consumed by `blueprint.js`, no class the runtime toggles within `#a004`.
2. **Every A-004 evidence link targets an id that exists** and resolves to one of `#p1`–`#p6`.
3. **`.detail:target` exists in the stylesheet.** Without it every evidence link is silently dead; this is the blocking defect and deserves a regression guard.
4. **Claim count moves as one unit** — the number of `.claim` blocks and the number of claim ids agree. Modelled on the existing A-001 component-count test.
5. **Every claim heading contains its reference number.**
6. **No proficiency-rating markup** — no element whose class or content implies a level, bar or percentage.
7. **A-004 contains no `<svg>`**, per §7. This is the guard that stops a figure creeping back in without the schedule decision being revisited.

### Manual browser gate

`tools/measure-in-browser.js` at 390px, 768px and 1440px, both themes. Confirm:

- no horizontal overflow at any width;
- every interactive element at least 44×44, including width;
- the `.ev` border clears 3:1 against `--paper` in both themes;
- the claims hold a single measure and do not stretch across the pane.

Note the standing measurement traps: the automation tab reports `visibilityState: "hidden"` and throttles animation, so check `classList` and `getAnimations().playState` rather than screenshots; a cache-buster on the HTML does not refresh the linked CSS — force it with `fetch('assets/css/blueprint.css',{cache:'reload'})`.

### Design gate

Re-run `/impeccable critique` against the implemented sheet. The prototype scored 22/32 against the previous 19/32. The blocking `.detail:target` fix and the §16 deletions should raise error prevention and aesthetic/minimalist scores; a result below 24/32 means something regressed during implementation.

## 19. Known Residual Issues

Carried forward deliberately, recorded so they are not rediscovered as new:

- **`--ref` on `--paper` is 4.54:1**, passing AA by 0.04, across eight uses at 8–12px. Site-wide token; out of scope here.
- **The mapping is asserted from one side.** A-005 does not know A-004 exists. Phase two should add `Evidences 04.x` to each project entry, or the mapping remains unverifiable from the evidence side.
- **The stack is the only unattached content on the sheet.** Dropping the per-row drawing codes reintroduces a finding from the prototype critique: on a sheet whose thesis is attachment, this strip points at nothing. Accepted because it is a closing reference, not an argument, and because the shorter strip was the explicit intent.
- **No at-a-glance pattern, and no reverse lookup.** Dropping the figure means a reader cannot see which claims a given drawing carries without reading all four. Accepted in exchange for the sheet being editable in minutes rather than an hour. See §7.
- **05.6 carries one claim, 05.2 carries three.** Honest, not balanced. Do not add references to even it out.
- **MeeTeam is in progress.** The legend says so. If it ships or stalls, the legend changes; the claims do not.
