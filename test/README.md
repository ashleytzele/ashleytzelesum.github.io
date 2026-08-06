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

Open `http://localhost:8118/?cb=1`, paste `test/measure-in-browser.js` into the
DevTools console, and compare the JSON against the baseline below.

**Always load with a fresh query string.** A plain reload can serve a cached
copy and make a fixed defect look unfixed.

**Run it in a foreground tab.** Chrome throttles IntersectionObserver
delivery, CSS animations and media playback in a backgrounded tab, which can
make working reveal/animation code look inert. The iframe-based
responsive/touch-target measurements are unaffected by this; the
`anims` section and anything depending on scroll-triggered reveal are not
reliable if the tab is hidden while the script runs.

### Baseline — 2026-08-06

Measured via the Chrome DevTools protocol against `http://localhost:8129/?cb=t5run`.
The controlling tab reported `document.visibilityState === "hidden"` and
`document.hasFocus() === false` throughout the run, even after an explicit
OS-level attempt to bring the Chrome window and tab to the foreground
(`osascript` window/tab activation). This is the known automation-tab trap:
Chrome throttles `IntersectionObserver` delivery in a backgrounded tab, and
`assets/js/blueprint.js` gates every entrance animation behind an
`IntersectionObserver` (lines 3–12). So `anims.total: 0` below is most likely
an artifact of the reveal observers never firing in the 2500ms window, not
evidence that the page has no entrance animations — **it is not treated as a
trusted measurement of `anims.total`.**

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
  "combos": 60,
  "fails": []
 },
 "dark": {
  "combos": 60,
  "fails": []
 },
 "withoutJS": {
  "hidden": 0,
  "undrawn": 0
 },
 "headingsStable": true,
 "keyboard": {
  "rovingTabindex": 1,
  "arrowMovesFocus": true,
  "panelFollows": true,
  "endGoesLast": true
 },
 "anims": {
  "total": 0,
  "infinite": 0,
  "layoutProps": []
 },
 "responsive": [
  {
   "px": 320,
   "overflow": false,
   "targets": 31,
   "under44": [],
   "minDrawnText": 10.5
  },
  {
   "px": 390,
   "overflow": false,
   "targets": 31,
   "under44": [],
   "minDrawnText": 10.5
  },
  {
   "px": 768,
   "overflow": false,
   "targets": 31,
   "under44": [],
   "minDrawnText": 10.5
  },
  {
   "px": 1024,
   "overflow": false,
   "targets": 31,
   "under44": [],
   "minDrawnText": 10.5
  },
  {
   "px": 1440,
   "overflow": false,
   "targets": 31,
   "under44": [],
   "minDrawnText": 10.5
  }
 ]
}
```

Note: figure 05.4 changed from a raster image to a `<video>` after this
script was written. `minDrawnText` and the touch-target counts above already
reflect that change (`.dwg text` selection is unaffected by the swap; the
video sits inside the same `.figbox` scroll region as the other figures).

Required: zero contrast failures in both themes; nothing hidden with JS off;
heading outline stable under interaction; one tab stop for the component group
with working arrows and Home/End; zero infinite animations; zero layout
properties animated; no horizontal overflow and no target under 44x44 at 320,
390, 768, 1024 and 1440; smallest drawn label at least 10px at every width.

**Result: all required values pass** (see caveat above re: `anims.total`,
which is not one of the required fields).
