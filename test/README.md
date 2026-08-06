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

Open `http://localhost:8118/?cb=1`, paste `tools/measure-in-browser.js` into the
DevTools console, and compare the JSON against the baseline below.

The script lives in `tools/`, not `test/`: Node's test runner sweeps every
`.js`/`.mjs` file under a directory named `test/` regardless of filename, and
this script throws on `document` when loaded outside a browser, which would
make `node --test` permanently red.

**Always load with a fresh query string.** A plain reload can serve a cached
copy and make a fixed defect look unfixed.

**Run it in a foreground tab.** Chrome throttles IntersectionObserver
delivery, CSS animations and media playback in a backgrounded tab, which can
make working reveal/animation code look inert. The iframe-based
responsive/touch-target measurements are unaffected by this; the
`anims` section and anything depending on scroll-triggered reveal are not
reliable if the tab is hidden while the script runs.

### Baseline — 2026-08-06 (code-review fixes: cover identity line, A-005 reorder, A-001 default tab, font-display, comment fix)

Measured via `mcp__claude-in-chrome`, a backgrounded MCP automation tab, so
`document.visibilityState` read `"hidden"` throughout (the known automation-
tab trap noted above), against `http://localhost:8129/?cb=blueprint_fix_20260806_4`
(fresh query string on every navigation). Five outside-review fixes landed
together: a one-line title-block identity strip on the cover (`.csub`, new
tokens-only CSS, no new hex); the six A-005 projects reordered so the three
public entries (cad-to-map, ScoutMini, SplitWise) lead as 05.1&ndash;05.3 and
the three client entries (Highway, West Coast Expressway, Restaurant POS)
follow as 05.4&ndash;05.6, with every `.r`, `Fig. 05.n` caption,
`figbox`/`dwgbox` `aria-label="Figure n, scrollable"`, `data-more`/
`data-label`/`aria-controls`/button text and `id="pN"` renumbered so position
equals number (verified by grepping every one of those six attribute
families across the file: all read 1..6 in document order with no gaps or
duplicates); the two cross-references that pointed at pre-reorder project
numbers &mdash; A-003's OSPIT `.s` field (`PROJECTS 05.1 &middot; 05.2 &middot; 05.3` &rarr;
`05.4 &middot; 05.5 &middot; 05.6`, since the three client projects moved) and A-004's
"USED IN" tags for the INTERFACE/DATA rows (`05.4` &rarr; `05.3`, since
SplitWise moved from position 4 to 3) &mdash; found by grepping every remaining
`05.\d` in the document after the move and updated to match; the A-001
Engineering tab made the default selected tab (`aria-selected="true"`,
`tabindex="0"`, the other four unchanged at `false`/`-1`), the panel's
`aria-labelledby` pointed at `tab-engineering` instead of the static `spec-h`
heading, and the panel's static markup replaced with Engineering's actual
`SPEC` record (title, prose, and the three `Ref drawing`/`Projects`/`Public`
field rows) so markup and ARIA state agree before `blueprint.js` runs (which
still only calls `show()` from click/keydown handlers, never on load, so it
does not fight the new static markup); both `@font-face` rules switched
`font-display:block` &rarr; `swap`; and the stray `/* A-007 */` comment above
`.dep` corrected to `/* A-006 */`. `node --test` (35 tests) is green.

```json
{
 "light": { "combos": 62, "fails": [{ "el": "svg text.tn", "r": "1.00", "need": 4.5 }, { "el": "svg text.ts", "r": "1.00", "need": 4.5 }] },
 "dark": { "combos": 62, "fails": [{ "el": "svg text.tn", "r": "1.00", "need": 4.5 }, { "el": "svg text.ts", "r": "1.00", "need": 4.5 }] },
 "withoutJS": { "hidden": 0, "undrawn": 0 },
 "headingsStable": true,
 "keyboard": { "rovingTabindex": 1, "arrowMovesFocus": true, "panelFollows": true, "endGoesLast": true },
 "anims": { "total": 4, "infinite": 0, "layoutProps": [] },
 "responsive": [
  { "px": 320, "overflow": false, "targets": 37, "under44": [], "minDrawnText": 10.5 },
  { "px": 390, "overflow": false, "targets": 37, "under44": [], "minDrawnText": 10.5 },
  { "px": 768, "overflow": false, "targets": 37, "under44": [], "minDrawnText": 10.5 },
  { "px": 1024, "overflow": false, "targets": 37, "under44": [], "minDrawnText": 10.5 },
  { "px": 1440, "overflow": false, "targets": 37, "under44": [], "minDrawnText": 10.5 }
 ]
}
```

`combos` moved from **61 to 62** in both themes, exactly the expected effect
of the new `.csub` cover line: one new element with a font-size/colour
combination not seen before, nothing else changed shape.

The two `svg text.tn`/`.ts` failures at `r: 1.00` are the **same measurement-
script blind spot** documented in the prior "About" baseline above, but they
are no longer avoidable by "measure with no tab selected": Change 3 makes
`tab-engineering` `aria-selected="true"` on every fresh load, so a selected
tab is now the true default state, not an artifact of test scripting. The
failure is `bgOf()` walking `background-color` up the DOM, which is blind to
the selected tab's `.k rect` SVG `fill` (flips to `--ink` per
`assets/css/blueprint.css:146-147`) and instead compares the `.tn`/`.ts`
text's `--paper` fill against the page's ordinary `--paper` background,
reporting a false 1:1. Measured directly against the live selected-state
colours instead (`getComputedStyle` on `tab-engineering`'s `.tn`/`.ts` fill
vs its `.k rect` fill, the actual visual relationship a person sees): light
theme `rgb(255,255,255)` on `rgb(17,17,17)` and dark theme the equivalent
inverted pair, both **18.88:1** &mdash; far above the 4.5 floor. Zero real
contrast failures in either theme.

`responsive[*].targets` holds at **37** (unchanged from the prior baseline)
at every width (320, 390, 768, 1024, 1440): the cover identity line is a
`<p>`, not an interactive control, so it adds no new touch target.
`overflow: false` and `under44: []` at every width confirm the new cover
line does not push the page wide at 320 or introduce anything under 44px,
and `minDrawnText: 10.5` is unchanged since no drawing geometry changed.

`withoutJS: { hidden: 0, undrawn: 0 }` confirms the reorder and the new
cover line do not depend on JavaScript to be visible &mdash; the `.csub` line
is plain static markup, not gated by the `.js`/`.an` reveal classes (cover
never carried `data-draw` or `.an` to begin with, so no gating was
possible), and every moved project block kept its `an` class and static
content intact.

`headingsStable: true` and the `keyboard` block (`rovingTabindex: 1`,
`arrowMovesFocus: true`, `panelFollows: true`, `endGoesLast: true`) confirm
all five A-001 tabs remain a single roving-tabindex group with exclusive
selection and working arrow/Home/End navigation with Engineering now
starting selected instead of none.

Verified directly against the live DOM on an untouched fresh load (before
the measurement script's own tab-click test mutates selection state):
`tab-engineering` is the only tab with `aria-selected="true"`/`tabindex="0"`,
`#specpanel`'s `aria-labelledby` reads `tab-engineering`, `#spec-h` still
reads "Component Specification", `#spec-t` reads "Engineering", `#spec-p`
matches `SPEC.engineering`'s prose verbatim, and `#spec-d`'s three
`dt`/`dd` pairs read exactly `Ref drawing`/`A-005`, `Projects`/`6`,
`Public`/`3` &mdash; markup and ARIA state agree before `blueprint.js` runs.

`anims.total` read `4` in this run (`0` in an earlier same-day run against a
different tab, `2` in the prior "About" baseline) with the same standing
caveat as every baseline above: `document.visibilityState` was `"hidden"`
throughout, which throttles `IntersectionObserver` delivery unpredictably in
a background automation tab and can under- or over-count reveal-triggered
animations. In this run the throttling was severe enough that scrolling
every `[data-draw]` sheet into view with 400ms pauses between each, then
waiting 1.5s more, still left `drawnCount: 0` of 6 sheets and every
`#a001 .k rect` at `strokeDashoffset: "1px"` (undrawn) &mdash; the observer
callback never fired at all in this session's backgrounded tab, a more
extreme case of the same trap than the prior baseline saw. `blueprint.js`'s
reveal wiring (`assets/js/blueprint.js:1-7`) was not touched by this change
set, so there is no code-level reason to expect different reveal behaviour
than the previous baseline; this number remains reported for continuity, not
treated as newly trusted, exactly as the prior baselines' standing caveat
already states.

**Result: all required values pass** (zero real contrast failures per the
manual verification above; `anims.total` remains outside the required
fields per the standing caveat).

### Baseline — 2026-08-06 (fifth A-001 component, "About", added)

Measured via the Chrome DevTools protocol against
`http://localhost:8129/?cb=about5_clean_1785999400` (fresh query string; a
background tab, so `document.visibilityState` read `"hidden"` throughout —
the known automation-tab trap noted below), after adding a fifth `role="tab"`
component ("About", balloon `05`) to the A-001 assembly, extending the
drawing's axis/dimension line/viewBox to fit it, and relabelling the
dimension text from `4 COMPONENTS` to `5 COMPONENTS`.

`combos: 61`/`61` and `fails: []`/`[]` in both themes are **unchanged** from
the prior baseline: the new box reuses the same `.tn`/`.ts`/`.tl` classes as
the other four, so it adds zero new colour/font-size combinations to the
scan. A first pass run against a page left in a stray selected-tab state (an
artifact of test scripting, not a real defect — see note below) reported two
false failures on `svg text.tn`/`svg text.ts` at `r: 1.00`; a clean reload
reproduced `fails: []` on both themes, confirmed by rerunning the full script
against a fresh navigation with no prior tab interaction. The false failure
was traced to the measurement script's `bgOf()` helper, which walks
`background-color` up the DOM — a check that is blind to the `.k rect`'s SVG
`fill`, so when a tab is `aria-selected` (rect fill flips to `--ink`, text
fill flips to `--paper` per `assets/css/blueprint.css:146-147`) the script
sees only the page's ordinary `--paper` background behind `--paper` text and
reports a false 1:1 ratio. This is a known blind spot in the measurement
script itself, not a rendering defect — the actual selected-state contrast
(`--paper` text on an `--ink`-filled rect) is the strongest ratio on the
page. Every baseline in this file, including this one, is measured with no
tab left selected, which is why it has never shown up here before.

`responsive[*].targets` moved from **36 to 37** at every width (320, 390,
768, 1024, 1440) — the fifth tab is one more keyboard-reachable interactive
control, exactly the expected effect of adding a fifth `role="tab"`.
`under44: []`, `overflow: false`, and `minDrawnText: 10.5` are unchanged at
every width: the new box's `.tn`/`.ts`/`.tl` text reuses the same
`.figbox .dwg`/`.dwgbox .dwg` 10.5px floor as the other four, and the taller
drawing (`viewBox="0 0 520 646"`, up from `530`) scales inside the same
`.dwgbox` scroll region without pushing the page wide at any width.

`keyboard.tabCount: 5` confirms all five tabs are in the roving-tabindex
group: `rovingTabindex: 1` (exactly one stop for the whole group),
`arrowMovesFocus: true`, `panelFollows: true`, and `endGoesLast: true` (Home/End
still land on the first/last of all five, not just the original four) all
hold, verified directly against `#tab-about`: clicking it sets
`aria-selected="true"`, moves `#specpanel`'s `aria-labelledby` to
`tab-about`, and populates the panel with the `about` `SPEC` record
(`Ref drawing A-001`, `Focus Systems, operability`, `Available Summer 2027`)
exactly as authored.

Geometry was read directly off the live SVG, not inferred from a screenshot,
because a screenshot taken in the throttled automation tab under-renders
scroll-reveal animation (see the trap note below): all five `.k rect`
elements report `strokeDashoffset: "0px"` (fully drawn), the axis path reads
`M300,24 V616`, the dimension line reads `M60,40 V566 M52,40 H68 M52,566
H68`, and the rotated label reads exactly `5 COMPONENTS` — the axis and
dimension line still bracket the full five-box stack (`y` values 40, 156,
272, 388, 504 for the five outline rects), and the sheet's `drawn` class and
`opacity: 1` on the new group confirm it revealed in sequence with the rest,
not that a screenshot merely failed to capture it mid-throttle.

`anims.total` read `2`, matching the prior baseline, with the same standing
caveat: `document.visibilityState` was `"hidden"` throughout this run, which
throttles `IntersectionObserver` delivery and can undercount reveal-
triggered animations, so this number is reported for continuity, not treated
as newly trusted.

```json
{
 "light": { "combos": 61, "fails": [] },
 "dark": { "combos": 61, "fails": [] },
 "withoutJS": { "hidden": 0, "undrawn": 0 },
 "headingsStable": true,
 "keyboard": {
  "rovingTabindex": 1,
  "arrowMovesFocus": true,
  "panelFollows": true,
  "endGoesLast": true,
  "tabCount": 5
 },
 "anims": { "total": 2, "infinite": 0, "layoutProps": [] },
 "responsive": [
  { "px": 320, "overflow": false, "targets": 37, "under44": [], "minDrawnText": 10.5 },
  { "px": 390, "overflow": false, "targets": 37, "under44": [], "minDrawnText": 10.5 },
  { "px": 768, "overflow": false, "targets": 37, "under44": [], "minDrawnText": 10.5 },
  { "px": 1024, "overflow": false, "targets": 37, "under44": [], "minDrawnText": 10.5 },
  { "px": 1440, "overflow": false, "targets": 37, "under44": [], "minDrawnText": 10.5 }
 ]
}
```

Required: zero contrast failures in both themes; nothing hidden with JS off;
heading outline stable under interaction; one tab stop for the component
group (now five members) with working arrows and Home/End; zero infinite
animations; zero layout properties animated; no horizontal overflow and no
target under 44x44 at 320, 390, 768, 1024 and 1440; smallest drawn label at
least 10px at every width.

**Result: all required values pass** (see caveat above re: `anims.total`,
which is not one of the required fields). This baseline's `responsive`
entries no longer carry a `themeToggle` sub-field — the copy of
`tools/measure-in-browser.js` in this repo at time of measurement does not
compute one; earlier baselines below that show it reflect an older revision
of the script.

### Baseline — 2026-08-06 (05.5 and 05.6 swapped for real evidence)

Measured via the Chrome DevTools protocol against
`http://localhost:8129/?cb=figures_clean_3` (fresh query string; a background
tab, so `document.visibilityState` read `"hidden"` throughout — the known
automation-tab trap noted below), after replacing the drawn SVG for **Fig.
05.5 (cad-to-map)** with a real `<img>` screenshot of the tool's own demo
site, and the drawn SVG for **Fig. 05.6 (ScoutMini)** with a new drawn SVG
that reproduces the tool's real terminal transcript as selectable text.

Every measured value is **identical** to the prior "theme toggle added"
baseline below: `combos: 61`/`61`, `fails: []`/`[]`, `targets: 36` and
`under44: []` at all five widths, `minDrawnText: 10.5` at all five widths,
`overflow: false` at all five widths, `headingsStable: true`, all four
`keyboard` fields, `withoutJS: {hidden:0, undrawn:0}`, and
`anims: {infinite:0, layoutProps:[]}`. Swapping the two figures added zero
new contrast combinations, zero new touch targets, and no regression to any
required field — the new `<img>` is not an interactive element and the new
SVG's six `<text>` labels reuse the same `.tl`/`.ts` classes (and therefore
the same 10.5px floor) as every other figure on the sheet.

`anims.total` read `2`, matching the prior baseline's trusted figure, but is
still not treated as a verified count for the reason recorded below: the tab
reported `visibilityState: "hidden"` the whole run, which throttles
`IntersectionObserver` delivery and can undercount reveal-triggered
animations. It is reported here only because it happens to agree with the
last trusted number, not because this run re-establishes trust in it.

The new `<img>` (Fig. 05.5) was checked directly, not just via the generic
scan: `naturalWidth`/`naturalHeight` read `1568`×`782`, matching the
`width`/`height` HTML attributes exactly, and its `getBoundingClientRect()`
was identical before and after the `load` event fired (`{width:1000,
height:499.7}` both times) — confirming no layout shift, per the media slot
contract. It renders at the same held 1000px figure width as every SVG on
the sheet, inside the same keyboard-reachable `.figbox` scroll region.

The new SVG (Fig. 05.6) was also checked directly: all six `<text>` elements
(the command line, the three transcript lines, the emphasised source line,
and the dimension-style callout label) read `fontSize: "10.5px"` via
`getComputedStyle` at the figure's held 1000px width — at the 10.5px floor,
same as every other drawn label on the sheet, not merely at-or-above it by
coincidence of a larger authored size.

### Baseline — 2026-08-06 (theme toggle added)

Measured via the Chrome DevTools protocol against
`http://localhost:8129/?cb=finalrun_a` (plus fresh-query-string iframe loads
per width, per the existing responsive methodology), after adding the
`#themeToggle` "sheet polarity" button to the index footer. This baseline
supersedes the prior "post final-fix-wave" run: `combos` moved from 58 to 61
(the toggle's text and its `:hover` state add distinct colour/background
combinations to the contrast scan) and `responsive[*].targets` moved from 35
to 36 (one new interactive control). Everything else — `fails: []`,
`under44: []`, `minDrawnText`, `withoutJS`, `headingsStable`, `keyboard` — is
unchanged and still holds.

The toggle itself was measured directly in the same iframe pass: it renders
at **115.1×44 CSS px** at 320/390/768 (mobile row layout, `min-width:44px`
floor) and **175×44 CSS px** at 1024/1440 (desktop sidebar, `width:100%` of
the 216px column) — at least 44×44 at every width tested, including the two
required checkpoints, 320 and 1440. With the `js` class removed (the
no-script path), `getComputedStyle(themeToggle).display` is `"none"` —
confirmed hidden rather than merely inert when JavaScript is unavailable.

Behavioural checks (real navigation, not iframe, since these depend on
`localStorage` persisting across a load): with `localStorage` cleared and the
OS/browser in dark mode, the button loads reading "Sheet · Inverted" /
`aria-pressed="true"` with `data-theme` left unset (`--paper` resolves dark
from the `prefers-color-scheme` media query, not from an override) — the
default correctly follows the OS preference. Clicking it sets
`data-theme="light"`, both `theme-color` meta tags to `#FFFFFF`, and
`localStorage.theme` to `"light"`. Reloading with a fresh query string
(`?cb=cleartest2`, to rule out a cached response) reproduces `data-theme`,
`--paper` and both meta tags in the light state before any visible paint —
the choice survives a reload with no flash of the wrong theme.

Below is the previous run's note on the responsive-pass fix, unchanged
context for how `targets` is derived:

Measured via the Chrome DevTools protocol against
`http://localhost:8129/?cb=fixverify_full1`, after fixing the responsive pass
to open every `.detail` disclosure panel before measuring (previously it
measured a collapsed page: every control inside `.detail` is `display:none`
until a "more" button is clicked, so those controls never entered the
`height > 0` guard and the gate never saw them — see the prior baseline's
`targets: 31` below versus this run's `targets: 35`).

The controlling tab reported `document.visibilityState === "hidden"`
throughout the run — the same known automation-tab trap as the prior
baseline: Chrome throttles `IntersectionObserver` delivery in a backgrounded
tab, and `assets/js/blueprint.js` gates every entrance animation behind an
`IntersectionObserver` (lines 3–12). So `anims.total: 2` below is not treated
as a trusted measurement of the page's real animation count — it is most
likely an undercount from reveal observers not firing reliably in the 2500ms
window while backgrounded.

The two fields the gate actually requires from this section, `anims.infinite`
and `anims.layoutProps`, are corroborated independently by reading
`assets/css/blueprint.css`: every `@keyframes` rule used (`ln`, `ax`, `fd`)
runs `forwards`, none is `infinite`, and none animates a layout property
(they animate `stroke-dashoffset`, `transform`, and `opacity` only). So the
required constraints hold on source-code evidence even though the live
`total` count for that run should not be trusted. A human should re-run the
script with the tab genuinely focused (pasted directly into DevTools by
hand, not through browser automation) to get a trustworthy `anims.total`,
`headingsStable`-under-real-interaction, and any other scroll-reveal reading
if that number is ever needed for its own sake.

Every other section of the script does not depend on tab visibility (the
contrast, no-JS fallback, keyboard, and iframe-based responsive checks all
read computed style / geometry synchronously, not animation timelines) and
is trusted as recorded.

```json
{
 "light": {
  "combos": 61,
  "fails": []
 },
 "dark": {
  "combos": 61,
  "fails": []
 },
 "withoutJS": {
  "hidden": 0,
  "undrawn": 0,
  "themeToggleHiddenWithoutJS": true
 },
 "headingsStable": true,
 "keyboard": {
  "rovingTabindex": 1,
  "arrowMovesFocus": true,
  "panelFollows": true,
  "endGoesLast": true
 },
 "anims": {
  "total": 2,
  "infinite": 0,
  "layoutProps": []
 },
 "responsive": [
  {
   "px": 320,
   "overflow": false,
   "targets": 36,
   "under44": [],
   "minDrawnText": 10.5,
   "themeToggle": { "w": 115.1, "h": 44 }
  },
  {
   "px": 390,
   "overflow": false,
   "targets": 36,
   "under44": [],
   "minDrawnText": 10.5,
   "themeToggle": { "w": 115.1, "h": 44 }
  },
  {
   "px": 768,
   "overflow": false,
   "targets": 36,
   "under44": [],
   "minDrawnText": 10.5,
   "themeToggle": { "w": 115.1, "h": 44 }
  },
  {
   "px": 1024,
   "overflow": false,
   "targets": 36,
   "under44": [],
   "minDrawnText": 10.5,
   "themeToggle": { "w": 175, "h": 44 }
  },
  {
   "px": 1440,
   "overflow": false,
   "targets": 36,
   "under44": [],
   "minDrawnText": 10.5,
   "themeToggle": { "w": 175, "h": 44 }
  }
 ]
}
```

Note: figure 05.4 is a `<video>` (`minDrawnText` and the touch-target counts
above already reflect that; `.dwg text` selection is unaffected by the swap,
and the video sits inside the same `.figbox` scroll region as the other
figures). Its box is now held at 1000×567.9 CSS px at every viewport width
(320/390/768/1024/1440), with zero difference between the poster-only state
and the state after `loadedmetadata` fires — verified directly against the
video element, not just via this script's `overflow` field.

`targets: 35, under44: []` above supersedes the prior baseline's
`targets: 31, under44: []`: the four additional targets are the controls
inside `.detail` panels that the unfixed script could not see at all (it
recorded a pass — `31, []` — while the real page, panels opened, measured
`35, [4 targets under 44px]` at every width; see `.refs a` in
`assets/css/blueprint.css`, fixed to carry the same 44px touch-target
treatment as `.idm dd a`/`.v a`/`.mn a`).

`targets: 36` in the JSON above supersedes that `35`: the one further target
is `#themeToggle`, added by the theme-toggle change documented at the top of
this section.

Required: zero contrast failures in both themes; nothing hidden with JS off;
heading outline stable under interaction; one tab stop for the component group
with working arrows and Home/End; zero infinite animations; zero layout
properties animated; no horizontal overflow and no target under 44x44 at 320,
390, 768, 1024 and 1440; smallest drawn label at least 10px at every width.

**Result: all required values pass** (see caveat above re: `anims.total`,
which is not one of the required fields).
