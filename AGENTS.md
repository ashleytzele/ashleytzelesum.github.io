# AGENTS.md — working memory for this repo

Read this before touching anything. It is the accumulated state of the project:
what it is, what is frozen, what has already gone wrong, and what is still open.

---

## 1. What this is

`ashleytzelesum.com` — the personal portfolio of Ashley Sum, a Computer Science
student at San Francisco State University looking for a **Summer 2027 software
engineering internship**.

The concept is **"Blueprint of Ashley Sum"**: the entire site is presented as an
engineering drawing set. A cover with a title block, then six numbered sheets.
Blueprint is the *design language*, not a gimmick or a skin — every visual
decision should be answerable with "that is how a drawing set behaves".

**Static site on GitHub Pages. This is a hard constraint:**

- No framework, no bundler, no build step
- No runtime dependencies, no CDN, no third-party requests at all
- Three files carry the whole site: `index.html`, `assets/css/blueprint.css`,
  `assets/js/blueprint.js`
- `package.json` exists only so `node --test` has a home; it declares no deps

Do not introduce a build step, a framework, Tailwind, a package, or a web font
request. There is a test that fails on any third-party resource load.

---

## 2. Running and testing

```bash
python3 -m http.server 8118      # then open http://localhost:8118/
node --test                      # 37 contract tests, run from the repo root
```

**`node --test test/` does NOT work.** Node resolves the directory as a module
and errors. Always run bare `node --test` from the repo root.

Node also sweeps every `.js` file under `test/` as a test file. That is why
`tools/measure-in-browser.js` lives in `tools/`, not `test/`, and why there is a
test guarding that. Do not put a browser-only script back under `test/`.

There is also a manual browser measurement pass — `tools/measure-in-browser.js`,
documented in `test/README.md`. It is not part of `node --test`.

### The test suite is the specification

`test/contracts.test.mjs` and `test/assets.test.mjs` encode the rules this site
must not break. They are not decoration. A sample of what they enforce:

- exactly one `<h1>`; no skipped heading levels
- no placeholder copy, no emoji anywhere
- every `aria-controls` / `aria-labelledby` target exists
- the icon sprite has no dead symbols and no dangling references
- no icon-only control — every icon `<svg>` is `aria-hidden`
- grid tracks that must shrink are declared `minmax(0,1fr)`
- no hex colour outside a theme block
- reveal animation is JS-guarded with a `<noscript>` fallback
- interactive SVG is never inside a presentational role
- the A-001 component group uses tab semantics, **not** `aria-pressed`
- component count moves as one unit: tab count, `SPEC` records, and the
  dimension label must all agree
- every figure slot holds exactly one medium
- every media element declares intrinsic size and a text alternative
- every video declares an `aspect-ratio`
- every local asset referenced actually exists
- **no client-identifying term appears in any tracked file** (see §7)
- the cover `Updated` date matches the last git change to the site files

If a change makes a test fail, the default assumption is that the change is
wrong, not the test. Two tests have historically been defective — both were
fixed by correcting the test, but only after establishing the markup was right.

---

## 3. Repo map

```
index.html                     the whole site + inline SVG icon sprite (16 symbols)
assets/css/blueprint.css       the whole stylesheet
assets/js/blueprint.js         reveal, scroll-spy, disclosures, A-001 tabs, theme, A-004 index
assets/fonts/                  Public Sans + Spline Sans Mono, self-hosted (OFL 1.1)
assets/images/                 figure media
assets/videos/                 figure media
assets/documents/              résumé PDF
docs/superpowers/specs/2026-08-06-blueprint-portfolio-design.md    the system spec
docs/superpowers/plans/2026-08-06-blueprint-portfolio.md           the implementation plan
test/                          contract tests (node --test)
tools/measure-in-browser.js    manual browser measurement gate
.confidential-terms            GITIGNORED. Feeds the confidentiality test.
```

Fonts are self-hosted and were verified byte-identical to the Google Fonts
sources with `cmp`. `assets/fonts/OFL.txt` must ship alongside them — there is a
test for it. Use `font-display: swap`, never `block` (block hides text while the
font loads).

---

## 4. The document model

**Cover** + six sheets. The sheet numbers are load-bearing: the document index,
the anchors, and the cross-references drawn inside the figures all depend on
them. Renumbering is a whole-site change, not a local one.

| Sheet | Name | Contains |
|---|---|---|
| — | Cover | Title block. **Frozen — see §6.** |
| A-001 | Identity | Assembly drawing; four clickable components: Engineering, Athlete, Leadership, Background |
| A-002 | Journey | Education and route: SFSU (current), INTI International College |
| A-003 | Experience | Four roles + internship workstreams |
| A-004 | Engineering | System stack by layer, with modules that name the drawings they appear in |
| A-005 | Projects | Six projects, 05.1–05.6 |
| A-006 | Contact | Contact fields, document footer, end marker |

### A-005 project order (do not reshuffle without reason)

| Ref | Project | Figure |
|---|---|---|
| 05.1 | cad-to-map | Demo site viewer, captured |
| 05.2 | Asset Management System | Console layout, reconstructed with sample data |
| 05.3 | ePOS Simulator | Print path (drawn — real media pending) |
| 05.4 | ScoutMini | Real CLI output, verbatim |
| 05.5 | MeeTeam | Meeting flow (drawn — real media pending) |
| 05.6 | SplitWise Swimming Analytics | Performance dashboard, recorded |

### The slot contract

This is the point of the whole architecture, and the reason the spec exists.

Every fact on the page lives in a **named slot with a fixed shape**. Content will
change — a description gets rewritten, a drawn figure is replaced by a real
screen recording, a project is swapped out. Those are changes *inside a slot*.
They must never require touching layout, CSS, or the surrounding structure.

Specifically: **a figure slot accepts a drawn SVG, an image, or a video, and
swapping one for another is a change inside the slot alone.** There is a test
proving the slot accepts video. Two slots (05.3, 05.5) currently hold interim
drawn figures awaiting real media — those swaps must not need a redesign.

Read `docs/superpowers/specs/2026-08-06-blueprint-portfolio-design.md` before
changing any slot shape.

---

## 5. Design language and voice

### Visual

- Colour lives in CSS custom properties inside theme blocks. **No hex colour
  anywhere else** — enforced by test.
- Key tokens: `--paper`, `--line` (drawn linework), `--ref` (reference text),
  `--refdec` (decorative reference notation), `--pad`.
- Both light and dark themes exist. A theme toggle sits in the index footer,
  framed as a *sheet polarity* field, not as a widget.
- Banned by test: gradients, drop shadows, glows, blurs, emoji.
- Registration marks, crop marks and coordinate letters are **document
  notation, not interface**. They are `position:absolute` with
  `pointer-events:none`, so they take no layout space, cannot reduce usable
  width, cannot be clicked, and cannot cause overflow. They keep their drawn
  size at every viewport width — a registration mark on a real drawing is a
  fixed physical size, not a proportion of the sheet.
- Negative space is intentional. Filling it is a regression.

### Copy

- British-leaning, plain, technical. No marketing voice, no superlatives, no
  "passionate about", no "scroll to explore".
- Prose avoids em dashes (there was a deliberate pass to remove the last one).
- Describe systems by what they do, not by adjectives.

### Attribution honesty — this matters more than polish

Several entries were rewritten because they overclaimed. The standing rules,
set by Ashley directly:

- Describe **what the project delivered overall**, not a per-person split. Do not
  write "I built X" where the truthful claim is that a team shipped X.
- She is frequently the one who originates the concept, the base structure and
  the idea, and teammates enhance it. That framing is accurate and is the one
  to use.
- Never claim a feature she did not work on. An interviewer who asks about it
  will find out.
- Where the real contribution is genuinely unclear, it is marked
  `[NEEDS CLARIFICATION]` in the master profile. Do not invent an answer to
  close the gap.

---

## 6. Frozen: the cover

**The cover sheet is approved and content-complete. Do not modify it.**

Not the title, not the subtitle, not the metadata fields, not the spacing, not
the negative space, not the DOCUMENT BEGINS marker, not the desktop
composition. Changing it requires an explicit new instruction from Ashley.

Its title block reads: Revision 3.0 · Scale 1:1 · Type Portfolio · Author
Ashley Sum · Updated \<date\> · Sheets 6.

The drawing frame is responsive and finished (commit `cc40e74`). It thins out as
the sheet narrows rather than disappearing:

| Width | Corner crop marks | Column numbers 1 2 3 | Row letters A B |
|---|---|---|---|
| ≥ 960 | 8 | yes | yes |
| 760–959 | 8 | yes | no |
| ≤ 759 | 8 | no | no |

All of it is scoped to `.cover`. **`.rule` is also used on A-001**, which keeps
its own desktop-only behaviour — any change to `.rule` must be scoped or it
silently alters a second sheet.

Also do NOT add to the cover: profile photo, about paragraph, social icons,
résumé button, technology list, hero illustration, background graphics,
gradients, decorative animation, or a generic portfolio tagline.

---

## 7. Confidentiality — read this before writing any copy

Ashley's professional work was done at **OSPIT Mobility**, on an engagement for
a client. Naming OSPIT as her employer is normal and expected. **Naming their
client is not settled** and depends on her agreement with OSPIT. Until she
confirms otherwise, the client is genericised on the site.

Keep off every tracked file: the client's name and abbreviation, their domains,
their sub-brand names, their internal system names, and the individual site
place names.

Safe to name anywhere: Python, Kotlin, SwiftUI, Flask, Odoo, MQTT, MapLibre,
Supabase, ESC/POS, Raspberry Pi, and every other general-purpose technology.

One caveat, learned by tripping the test while writing this file: a technology
name can itself be forbidden when it identifies a specific internal system
rather than a general tool. `.confidential-terms` is the authority, not your
judgement about what sounds generic. Run `node --test` before committing prose.

Genericising costs nothing — "a tolled highway operator" carries the same weight
to a recruiter, and the technical substance is identical.

`.confidential-terms` holds the forbidden strings and is **gitignored on
purpose**. Committing that file *is* the leak. A test reads it and scans every
tracked file. Three leaks have already been caught this way, all outside
`index.html` — including a README that documented the check by listing every
forbidden term. **Sweep the whole repo, not just the page.**

---

## 8. Traps that have already cost hours

These are not hypothetical. Each one produced a wrong conclusion in this repo.

**Browser measurement (MCP / automated Chrome):**

1. The automation tab reports `visibilityState: "hidden"` during scripted calls,
   which throttles IntersectionObserver and animations. A screenshot will show
   un-revealed content that is fine for a real user. **Check `classList` and
   `getAnimations().playState`, never a screenshot.**
2. Chrome serves cached copies on a plain reload. Always use a fresh query
   string — **and note that a cache-buster on the HTML does not refresh the
   linked CSS.** Force it: `fetch('assets/css/blueprint.css',{cache:'reload'})`.
   A CSS fix was pronounced broken for twenty minutes over exactly this.
3. A child element's computed `display` does not reflect a hidden parent. Use
   `offsetParent` or `getBoundingClientRect`.
4. Measuring touch targets in an iframe without opening the disclosure panels
   recorded a **false pass** — the controls inside collapsed `.detail` were
   `display:none` and were filtered out by the measurement's own `height > 0`
   guard. It reported zero failures on a page with four.

**General:**

5. Exit code 0 does not mean an artefact exists. Verify the file.
6. Do not reason about one element's CSS from another's. `max-width:none` was
   applied to `.figbox img,video` by analogy with SVG behaviour; an SVG's
   intrinsic width comes from its viewBox, a video's is real pixels — the video
   rendered 2916px wide. Videos now pin `width` plus `aspect-ratio`.
7. A bare `1fr` grid track floors at min-content. Use `minmax(0,1fr)`.
8. `role="img"` collapses its subtree and hides interactive children from
   assistive technology.
9. Never run two agents editing `index.html` concurrently.
10. Scope your find-and-replace. An unscoped `Status → Type` replacement on the
    cover also rewrote A-006's document footer; caught in the diff and reverted
    in commit `1649ceb`.

---

## 9. Content sources (outside this repo, on purpose)

These live on the Desktop and are **not** in the repo, because they name the
client:

- `~/Desktop/ASHLEY-MASTER-PROFILE.md` — the source of truth. Comprehensive
  background on every project, role and claim, with `[NEEDS CLARIFICATION]`
  markers where attribution is genuinely unresolved. **This is not website
  copy** — it is the raw material website copy is drawn from.
- `~/Desktop/website-content.md` — every word currently on the site, extracted
  and editable. Edit here, then apply back.
- `~/Desktop/project-inventory-2026-08-07.md` — a survey of every project on the
  machine with commit-level attribution and a portfolio verdict for each.

Do not copy any of these into the repo.

---

## 10. Current state

Last commit: `cc40e74`. `node --test` → **37 pass, 0 fail**.

**Nothing has been pushed yet.** Deploy is the one unstarted task from the
original plan (Task 7: deploy and verify live).

### Open questions awaiting Ashley

1. Whether OSPIT permits naming the client (§7). The answer changes how three
   project entries are written.
2. `ams-hub` attribution: project docs name "Ashley" and "Ivan" as two people,
   but the Ivan commits carry her email, and a different real Ivan exists on the
   team. Unresolved.
3. **SplitWise's actual database.** Three sources disagree: the site once said
   MongoDB, the code uses Flask-SQLAlchemy, and the `Procfile` launches a
   CSV/JSON/SQLite path. The MongoDB claim was genuinely hers — but from the NBA
   game, attributed to the wrong project. Do not restate a database for
   SplitWise until this is settled.
4. Swimming specifics — level, events, certifications — for the Athlete
   component.

### Known drift

`README.md` still describes the pre-restructure sheet names ("education, system
modules"). The sheets are now Identity, Journey, Experience, Engineering,
Projects, Contact. Worth fixing next time README is touched.

### Pending media

05.3 (ePOS Simulator) and 05.5 (MeeTeam) hold interim drawn figures. Ashley is
supplying real captures. Because of the slot contract, those swaps are
figure-local and must not become a redesign.

---

## 11. How Ashley works

Her stated sequence, and it is worth following:

**brainstorm → prototype → spec → plan → tasks → result**

She reviews visually and will say when something "doesn't feel right" before she
can say why — treat that as real signal and go looking, rather than asking her
to specify. When she freezes something, it is frozen. When she scopes a task to
one sheet, changing a second sheet is a defect even if the change is an
improvement.
