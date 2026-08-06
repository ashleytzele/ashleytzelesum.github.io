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
