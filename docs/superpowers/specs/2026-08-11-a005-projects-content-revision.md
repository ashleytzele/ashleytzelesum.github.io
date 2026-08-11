# A-005 Projects — Content Revision Specification

**Status:** Approved for implementation

**Drawing:** A-005

**Sheet position:** 5 of 6

**Section anchor:** `#a005`

**Approved thesis:** The layout stays; what each entry says changes

**Approved proposal:** `https://claude.ai/code/artifact/7d4598aa-932f-4dd1-8a3b-70bd077faf94` (Rev 2)

---

## 1. Purpose and scope boundary

A-005 proves what Ashley built. It is the evidence A-004 points at.

**This is a content revision, not a redesign.** Four layout directions were prototyped and rejected before landing here. The decision is explicit: the entry layout is correct and stays. What is wrong is what the entries *say*, one figure-sizing bug, and one failure mode.

Read §12 before proposing any layout change.

### Unchanged

The `.proj` structure entirely: the `.ph` head with reference, name and tagline; the `.pb` body with its side label column; the position of the description, the figure and the disclosure button. No CSS restructuring, no reordering, no renumbering, no new components.

### Changed

1. Photographic figures fit their column instead of being hard-coded to 1000px (§2).
2. Every detail panel is rebuilt on a shared field spine (§3–§5).
3. 05.5 is rewritten from MeeTeam to Quorum (§6).
4. Panels ship open and the runtime collapses them (§7).
5. The two ranking labels are deleted (§8).

---

## 2. The figure sizing fix

`assets/css/blueprint.css` currently sets:

```css
.figbox img,.figbox video{width:1000px;max-width:none;height:auto}
.figbox svg{min-width:1000px;max-width:none}
```

The comment above it argues that a drawn SVG's 8px labels become illegible when scaled down, and that is correct — **for drawn SVGs**. It was then applied to photographs and video, where it is wrong: a screenshot has no small labels to protect and should fit its container.

Consequences on the live site: the content box is 286px at a 390px viewport and 663px at 768px, against a 1000px figure. Both pan sideways. SplitWise's `<video controls>` renders 1000px wide inside that scroller, so its play button sits roughly 700px off-screen — the demo cannot be started without first panning horizontally.

**Required change:**

```css
.figbox img,.figbox video{width:100%;max-width:100%;height:auto}
```

The `svg` floor stays. `width`/`height` attributes stay on every element so the box is reserved before the file loads and nothing shifts.

**Consequence to accept:** the three drawn figures still pan while the three photographs no longer do. That inconsistency is visible and is the argument for §11's redraw, which is deferred rather than dropped.

---

## 3. The field spine

Every detail panel opens with one context field whose **label varies by how the project started**, then three fields common to all six, then optional fields only where the material genuinely exists.

**Field 1 — context.** `Problem` where something was broken or handed to her. `Inspiration` where it began from her own interest.

**Always, in this order:** `Approach` · `Result` · `What I learned`

**Optional, only where real:** `Constraints` · `Architecture` · `What went wrong`

**Binding rule: no project manufactures a failure to fill a slot.** Where nothing notable went wrong, `What went wrong` is absent. An absent field is not a gap; an invented one is a lie, and the same error as the false stack citations recorded in the A-004 spec §8.

---

## 4. Per-project assignment

| Ref | Project | Opens on | Also earns | Change |
|---|---|---|---|---|
| 05.1 | cad-to-map | Problem | Constraints · Architecture · What went wrong | unchanged |
| 05.2 | Asset Management System | Problem | Constraints · Architecture · What went wrong | unchanged |
| 05.3 | ePOS Simulator | Problem | Constraints · Architecture · What went wrong | unchanged |
| 05.4 | ScoutMini | Inspiration | — | gains 3 fields |
| 05.5 | Quorum | Problem | Architecture · What went wrong | rewritten whole |
| 05.6 | SplitWise Swimming Analytics | Inspiration | — | gains 3 fields |

05.1–05.3 already carry the full set under different labels; their `Problem` field exists and their remaining fields map across unchanged. Only the three shallow entries and Quorum require new writing.

---

## 5. New copy

Nine new fields. Draft copy below is grounded in the repositories and the master profile. **It is Ashley's to approve or replace** — it is a shape proposal, not final text.

### 05.4 ScoutMini — three new fields

**This entry is currently framed wrongly on the site.** It reads as an anti-hallucination exercise about Formula 1. The actual intent is an assistant for someone new to a sport, who wants to understand a player or a race and has no way to tell a confident answer from an invented one. Fact-grounding is the mechanism, not the point.

**Inspiration** *(draft)*
> Getting into a sport means asking questions with obvious answers to everyone but you — who drives for which team, who is number 11, why that lap mattered. Ask a chatbot and you get a fluent answer that may be entirely made up, which is worse than none when you have no way to check it. The idea was an assistant a newcomer could trust: it answers only from real data, and shows where each number came from.

**Approach** *(draft)*
> Fetch the numbers first, then let the model write only from what a tool returned. It never answers from memory, and every report prints its source. An agent mode lets it choose which data tools to call across several steps. It is built against Formula 1 timing data, and the shape is deliberately sport-agnostic — the model never touches the data source directly, so another sport is another set of tools rather than a rewrite.

**Result** *(draft)*
> 73 tests, all offline, every external call fixtured.

`What I learned` is kept verbatim from the existing entry: *"Prompting it to be careful did not hold; only the structure did."*

**Binding accuracy rule for this entry.** Formula 1 is what is built. Other sports are the design intent, not a shipped feature. The copy may say the architecture generalises; it must not say or imply that it currently answers questions about any other sport. The summary description on the sheet also needs revising, since it currently names Formula 1 as the subject rather than as the first data source.

### 05.6 SplitWise — three new fields

**Inspiration** *(draft, from Ashley's account)*
> Swim analysis tools want a subscription and a level of detail most swimmers cannot easily produce — sensors, stroke telemetry, someone entering it all. I swim, so I knew which numbers actually matter and which ones anyone can get with a stopwatch and a lane. The question was how much useful insight you can reach from only the easily measurable ones.

**Approach** — `[NEEDS ASHLEY]`. Which metrics she settled on as the easily-measurable set, and what they are derived into. The existing lessons text says deciding what a race is actually made of took longer than building the charts; that decomposition is the substance of this field.

**Result** — `[NEEDS ASHLEY]`. It is deployed with a recorded demo. Whether anyone else uses it, and any figure worth stating, is hers to supply.

**Also unresolved:** the database. The site once said MongoDB, the code uses Flask-SQLAlchemy, and the `Procfile` launches a CSV/JSON/SQLite path. Three sources disagree. **No database is named in this entry until that is settled.**

### Summary lines that change

The `.pdesc` on the sheet is what a visitor reads without opening anything, so where §5 changes the framing it must change too.

**05.4 ScoutMini.** Currently: *"Answers Formula 1 questions from real timing data instead of model memory…"* — which makes Formula 1 the subject. Replace with something that leads on who it is for:

> *(draft)* An assistant for someone new to a sport, who wants to know who a player is or why a result mattered and has no way to tell a real answer from an invented one. It answers only from real data and prints its sources. Built against Formula 1 timing data.

**05.6 SplitWise.** Currently a feature list — *"race and split analysis, stroke rate, velocity charts, personal best tracking…"* — which says what it contains rather than why it exists. Replace with something that leads on the constraint:

> *(draft)* Swim analysis without a subscription or a sensor rig. It works from the numbers any swimmer can record at the pool, and turns them into the few that show whether a race went well.

Both are drafts and subject to §5's approval rule.

### 05.5 Quorum — see §6

---

## 6. 05.5 Quorum

MeeTeam no longer exists. `ashleytzele/MeeTeam` returns 404; the repository was renamed to `ashleytzele/Quorum` on 2026-08-11. The entry is rewritten whole, not edited.

Everything below is verified from the repository, not recalled.

**What it is.** Meeting software across three cooperating pieces: a static SPA on Supabase (auth, database, storage); a local Python engine that turns a transcript plus submitted notes into templated minutes; and an optional desktop recorder. Seven pages, no framework — the same no-dependency constraint as this portfolio.

**Opens on:** `Problem`. `PRODUCT.md` describes two roles in a company running recurring meetings, with preparation scattered before and notes scattered after.

**Architecture** *(earns the field)*
> AI generation is opt-in and runs locally. The web app health-checks a bridge on `localhost:8899`; if it is down, generation is disabled with a clear message and the entire structured flow still works. Meeting status is derived from what has actually happened — Collecting, Recorded, Draft, Published — never set by a manual flag.

**What went wrong** *(earns the field)*
> Two row-level-security failures, both fixed with `SECURITY DEFINER`. `is_admin()` queries the profiles table, and the profiles policy calls `is_admin()` — without definer rights that recurses forever. Separately, the signup trigger needs a pinned `search_path` or account creation fails outright with a database error.

The second of those is not on the site today and is the better story: a trigger that only fails at signup is found by hitting it, not by reading it.

**Technology:** JavaScript · Supabase · PostgreSQL · row-level security

**Source link:** Quorum must be public before this ships. See §10.

---

## 7. Panels ship open

`.detail` is currently `display:none`, opened only when the runtime sets `data-open="true"`. The `<noscript>` block at `index.html:32` covers JavaScript being *disabled*.

It does not cover JavaScript being **enabled and failing**. In that state a visitor gets six buttons that do nothing and content reachable only by typing a URL fragment.

**Required:** invert it, matching the pattern A-003 already uses at `blueprint.css` — the detail is visible in the static markup, and a successfully-initialised runtime collapses it. A broken runtime then leaves every panel readable.

`.detail:target`, `.detail[data-open="false"]`, `.proj:target .detail` and `.proj:target .detail[data-open="false"]` must all continue to behave as the A-004 spec §3 requires. That cascade is load-bearing for A-004's evidence links and is regression-tested.

---

## 8. The ranking labels

Delete `Featured engineering work` and `Other builds`.

They assert a ranking that runs backwards. The three marked "other" — ScoutMini, Quorum, SplitWise — are the three a stranger can clone, run or open. Two of the three marked "featured" can never be published at all.

With the panels levelled by §3, the labels also stop describing anything true about depth.

---

## 9. Structure, semantics and accessibility

- Heading order unchanged: one `<h2>` for the sheet, one `<h3>` per project.
- The `.dgrid` field grid uses `repeat(auto-fit,minmax(230px,1fr))` and overflows below roughly a 334px viewport, where the content box is 216px. Correct while the markup is being rewritten.
- Every `aria-controls` continues to resolve; `aria-expanded` must match the static state, which §7 inverts to `true`.
- Source links keep their existing treatment and 44px targets.
- `Client work — not published` stays on 05.2 and 05.3.
- No client-identifying term in any tracked file. Enforced by test.

---

## 10. What this needs before it ships

1. **Quorum made public.** Its source link returns 404 to every visitor today, which reads worse than having no link.
2. **Ashley's copy for the three SplitWise fields**, and a decision on the database claim.
3. **Her approval or replacement of the ScoutMini and Quorum draft copy** in §5 and §6.

---

## 11. Deferred, not dropped

**One shared 16:9 for every figure.** The six figures currently range from 1.29:1 to 4.76:1 — the three drawn ones are letterbox strips nearly five times wider than tall. This was the real cause of every rejected layout looking wrong, and it remains true. It is deferred because with the layout unchanged the raggedness matters far less than it did in a side-by-side list, and because doing it properly means redrawing three figures or replacing them with real captures.

When it happens: crop cad-to-map by 15% and the console by 3%, re-cut the SplitWise poster to match its video, and redraw or recapture 05.3, 05.4 and 05.5.

**The SplitWise poster aspect mismatch.** 1.29:1 poster inside a 1.76:1 video box renders pillarboxed with roughly 133px of blank either side. A re-crop fixes it; CSS should not paper over it.

---

## 12. Out of scope

- The entry layout, in any form. Four directions were prototyped and rejected; this decision is deliberate and closed.
- Reordering or renumbering the six projects. A-004 cites `05.1`–`05.6` by number in its claim prose and links to `#proj-1`–`#proj-6`. Renumbering is a cross-sheet change requiring A-004's copy, its spec and its tests to move with it.
- Backlinks from A-005 to A-004's claims. Added, then removed on instruction as out of scope. A-005 retains only the six `id="proj-N"` attributes the evidence links anchor to.
- A-001, A-002, A-003, A-004 and the cover.
- The 40MB `CAD-MAP video.mov`, still untracked. It needs re-encoding before it can ship — the other demo videos are 3.5MB and 8.6MB — and a decision about whether it replaces the 05.1 still or joins it.

---

## 13. Acceptance

### Existing tests stay green

`node --test` from the repo root, currently 84/84. Note `node --test test/` does not work.

Particular attention: `every local asset referenced actually exists`, `every figure slot holds exactly one medium`, `every media element declares intrinsic size and a text alternative`, `no client-identifying term appears in any tracked file`, and the A-004 cascade guards.

### New tests required

1. **Every detail panel opens with a context field** labelled either `Problem` or `Inspiration`, and no panel has both.
2. **Every detail panel contains `Approach`, `Result` and `What I learned`**, in that order after the context field.
3. **No panel contains a field outside the permitted set** — the spine plus `Constraints`, `Architecture`, `What went wrong`.
4. **`.figbox img` and `.figbox video` do not use a fixed pixel width.** This is the regression guard for §2; the previous rule was deliberate and commented, so it will look intentional to anyone who re-adds it.
5. **Panels are open in the static markup** — every `.detail` ships without `data-open="false"`, and every `.more` button ships `aria-expanded="true"`.
6. **No project entry names a database for 05.6** until the contradiction in §5 is resolved.

### Manual browser gate

`tools/measure-in-browser.js` at 390, 768 and 1440 in both themes. Confirm no horizontal overflow on any photographic figure, and that SplitWise's video controls are reachable without panning.

The A-004 record notes this gate was never run during that work, and that three of its defects were visible only in a rendered page. Run it here.
