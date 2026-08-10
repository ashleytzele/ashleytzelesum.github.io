# A-003 Experience Design Specification

**Status:** Approved for implementation

**Drawing:** A-003

**Sheet position:** 3 of 6

**Section anchor:** `#a003`

**Approved thesis:** Builder + operator

**Approved prototype:** Two vertical career tracks with role-owned inline details

## 1. Purpose

A-003 explains what Ashley's work history reveals about how she operates. It must show two equally authored forms of experience:

- building technical systems; and
- operating real environments with responsibility for people, facilities, and safety.

The sheet is not a second Education timeline and not a project-case-study index. A-002 owns the academic transition; A-004 owns engineering capability; A-005 owns project depth. A-003 owns career progression, responsibility, and the relationship between technical and operational work.

## 2. Design Thesis

The visible composition is a pair of independent vertical tracks:

1. **Software / Systems** — the builder track;
2. **Operations / Aquatics** — the operator track.

Chronology moves forward from top to bottom. The two tracks sit side by side on wide screens. On narrow screens, they stack without changing their internal order: Software / Systems first, then Operations / Aquatics.

This vertical model is deliberately extensible. Future roles append to the appropriate ordered track without shrinking existing nodes, introducing horizontal panning, or requiring a new component.

## 3. Exact Visible Introduction

The sheet retains:

- `Drawing A-003`;
- visible name `Experience`;
- `Sheet 3 of 6`;
- anchor `#a003`;
- the established revision/status metadata conventions.

The heading is:

> Experience

The orienting sentence is:

> Building technical systems and operating real environments—across software, facilities, safety, and team coordination.

## 4. Track and Role Content

### 4.1 Software / Systems

Track label: `Software / Systems`

Track descriptor: `Builder track`

#### EXP-01

- State: `Previous`
- Dates: `Jun–Sep 2024`
- Title: `IT Support`
- Organization: `Zengo Corporation`
- Location: `Malaysia`
- Summary: `Supported internal users and enterprise systems, and built an inventory application that automated stock calculations.`
- Evidence line: `Inventory tracking · Support + troubleshooting`

Role-owned detail label: `Scope & output`

- `Built an inventory tracking application that automated stock calculations.`
- `Provided technical support and troubleshooting for internal users and enterprise systems.`

#### EXP-02

- State: `Internship`
- Dates: `Jun–Aug 2026`
- Title: `Software Engineering Intern`
- Organization: `OSPIT Mobility`
- Department: `Technical / R&D`
- Location: `Malaysia`
- Summary: `Solved five software and systems-integration problems spanning equipment identity, offline maps, printing, and mobile applications.`
- Evidence line: `5 workstreams · Drawings 05.1–05.3`
- Handoff: `Project evidence → A-005`

Role-owned detail label: `Scope & results`

- `Reconciled equipment identity across four systems that each named the same device differently.`
- `Built a CAD-to-map pipeline delivered to six touchscreen kiosk sites.`
- `Originated a service that lets a cloud point-of-sale print to any thermal printer.`
- `Added a consent flow and fixed production defects in a live Android app.`
- `Repointed a native mobile app to a different backend, then pivoted it to a WebView.`

### 4.2 Operations / Aquatics

Track label: `Operations / Aquatics`

Track descriptor: `Operator track`

#### EXP-03

- State: `Previous`
- Dates: `Aug 2025–Mar 2026`
- Title: `Lifeguard`
- Organization: `Mashouf Wellness Center`
- Location: `San Francisco, California`
- Summary: `Protected patron safety through active surveillance, facility checks, and emergency readiness on the pool deck.`
- Evidence line: `Lifeguarding · CPR · AED · First Aid`

Role-owned detail label: `Operational responsibility`

- `Maintained surveillance and incident readiness on an active pool deck.`
- `Completed facility checks and opened or closed the aquatics area.`

#### EXP-04

- State: `Current`
- Dates: `Apr 2026–Present`
- Title: `Student Lead, Aquatics`
- Organization: `SFSU Campus Recreation`
- Location: `San Francisco, California`
- Summary: `Coordinates student staff and daily aquatics operations while supporting facility management and enforcing safety standards.`
- Evidence line: `Staff · Safety · Facility operations`

Role-owned detail label: `Leadership & operations`

- `Opens and closes the facility and coordinates student staff on shift.`
- `Responds to incidents and keeps the pool deck to safety standards.`

The visible `Promoted` label is explicitly excluded. The Lifeguard-to-Student-Lead relationship is communicated through forward chronology and the connecting track, without making an unsupported employment-status claim.

## 5. Concurrent-Role Relation

The sheet includes one visible factual relation outside the role details:

- Label: `Concurrent responsibility`
- Value: `Student Lead + OSPIT · Jun–Aug 2026`

This relation must remain readable text. It may not be conveyed only by a line, color, position, animation, or generated pseudo-element.

## 6. Role Widget Model

Each role is one self-contained widget with:

1. identifier and state;
2. date range;
3. title;
4. organization, department when applicable, and location;
5. concise visible summary;
6. concise evidence line;
7. one role-owned `Open details` control; and
8. one inline detail region belonging to that role.

The detail region opens inside the same widget. There is no shared detail section, no global selected-role panel, and no tablist. Multiple role details may remain open simultaneously for comparison.

Control labels use the exact pattern:

- closed: `Open details — [role label]`;
- open: `Close details — [role label]`.

The control is a native button with `aria-expanded` and `aria-controls`. It does not change the heading hierarchy when activated.

## 7. Semantic Structure

Required hierarchy:

- one A-003 `section` with `h2` Experience;
- two track sections, each with an `h3` track heading;
- one ordered list per track;
- each list item contains one role article;
- each role title is an `h4`;
- the concurrent-role relation is visible text after the two tracks;
- the figure caption/handoff follows the route.

DOM order is:

1. Software / Systems track;
2. EXP-01;
3. EXP-02;
4. Operations / Aquatics track;
5. EXP-03;
6. EXP-04;
7. concurrent-role relation;
8. figure caption and A-004/A-005 handoff.

Visual placement may put tracks side by side, but CSS may not change this reading order.

## 8. Progressive Enhancement and Failure States

All role summaries and all role details are present in the original HTML.

Default/static state:

- every role detail is visible;
- every disclosure control is hidden;
- track names, dates, summaries, evidence, and concurrency text are visible;
- no content depends on a runtime class, animation, or successful script request.

Enhanced state is earned only after the external behavior script initializes successfully:

- disclosure controls become visible;
- details may begin collapsed;
- each control operates only its own detail region;
- multiple details may remain open;
- button text and `aria-expanded` stay synchronized.

If JavaScript is disabled or the external script fails synchronously or asynchronously, the static complete state remains. A failed script may not leave visible inert controls or hidden details.

## 9. Layout and Responsive Behavior

### Wide screens

- two equal `minmax(0, 1fr)` track columns;
- independent vertical timelines;
- forward chronology from top to bottom;
- role height is content-driven, not synchronized across tracks;
- the current Student Lead role uses a heavier key line and explicit `Current` text;
- concurrency text sits after both tracks and does not depend on cross-column pixel alignment.

### Narrow screens

- one track column;
- Software / Systems appears first;
- Operations / Aquatics appears second;
- each timeline remains vertical;
- each role detail expands in normal document flow;
- no horizontal panning;
- no duplicate mobile markup;
- no clipped labels or overlapping title/date rows at 320px, 390px, or 200% zoom.

The breakpoint is content-driven. Start from the existing record breakpoint near 860px, then choose the smallest value that preserves readable nodes and details without reducing factual text below the established floor.

## 10. Future Role Capacity

The implementation must not encode a fixed count of two roles per track.

- Each track consumes an ordered list of repeatable role articles.
- A future role appends to one track in chronological order.
- Connectors derive from list structure, not `nth-child` rules limited to two entries.
- The last-node terminator derives from `:last-child` or equivalent structural logic.
- The layout remains two track columns on wide screens and stacked tracks on narrow screens regardless of role count.
- Role-owned disclosure identifiers and control relationships remain unique as nodes are added.

A contract test must prove a third synthetic role can use the component without requiring a new selector, a new grid track, or a hard-coded role count.

## 11. Visual Language

A-003 remains inside the established blueprint system:

- Public Sans for titles and narrative copy;
- Spline Sans Mono for identifiers, dates, track descriptors, evidence, and drawing notation;
- square, key-lined role widgets;
- existing paper, ink, secondary, reference, line, hairline, light, dark, and print tokens only;
- 8.5–9px minimum for factual drawing labels;
- body copy remains comfortably readable and does not shrink to fit;
- current state is distinguishable without color;
- timeline rails, ticks, arrows, and node markers are decorative and hidden from assistive technology.

Forbidden:

- gradients, shadows, glow, blur, glass, rounded cards, emoji;
- wide SVG career diagrams;
- horizontal-panning experience figures;
- a visible `Promoted` badge;
- a shared role-detail section;
- tab or tabpanel roles;
- hover-only information;
- duplicated mobile role markup.

## 12. Motion

One reveal may draw the decorative track rails, ticks, and markers after the runtime gate is earned.

- Role content and controls do not animate from hidden opacity.
- Details open without layout-jarring entrance choreography.
- No infinite animation.
- No width, height, margin, padding, inset, or other layout-property animation.
- Reduced motion shows the complete construction immediately.
- Disabled JavaScript and script failure show the complete construction immediately.
- Print shows the complete construction immediately.

## 13. Print

Print output:

- hides disclosure controls;
- expands every role detail;
- completes all decorative linework;
- avoids separating a role summary from the start of its details when practical;
- permits an oversized role to fragment rather than overflow or clip;
- keeps track labels and role headings with their first content;
- uses the existing print tokens and page contract.

## 14. Sheet Handoff

The final caption is:

- `Fig. A-003.1 — Builder + operator tracks`

The right-side handoff is:

- `Engineering → A-004 · Projects → A-005`

OSPIT's `05.1–05.3` references are meaningful links or locally explained references to A-005. A-003 does not reproduce A-005 case-study diagrams or long project narratives.

## 15. Scope Boundaries

### In scope

- A-003 markup, visual composition, disclosure behavior, progressive enhancement, print behavior, tests, and browser measurements;
- the generic disclosure controller only where required to make A-003 fail open;
- direct A-003 naming/description references in contributor documentation;
- browser evidence for A-003.

### Out of scope

- changing factual role dates, employers, titles, or approved copy;
- adding employment metrics not already supported by current portfolio evidence;
- changing A-001, A-002, A-004, A-005, or A-006 visual design;
- changing project case studies;
- changing Education content;
- adding new external dependencies or requests.

A-001, A-002, A-004, A-005, and A-006 must remain byte-identical except for a direct A-003 cross-reference correction proven necessary by an exact contract.

## 16. Acceptance and Verification

Automated contracts must verify:

- exactly two track containers in the approved order;
- exact approved role content and role ordering;
- no visible `Promoted` label;
- semantic `h2` → `h3` → `h4` hierarchy;
- ordered-list track structure;
- one role-owned disclosure per role;
- unique and correct `aria-controls`/`aria-expanded` relationships;
- no tablist, tab, or tabpanel roles;
- static details visible and controls hidden;
- enhanced details/control state earned only after runtime success;
- synchronous script failure fails open;
- multiple details may remain open;
- no essential content hidden by reveal CSS;
- two wide track columns and one narrow column without duplicate markup;
- no horizontal panning or A-003 media-width floor;
- factual text floor;
- current state does not rely only on color;
- reduced-motion and print completion;
- no infinite or layout-property animation;
- third-role extensibility without hard-coded count selectors;
- downstream-sheet hash isolation.

Browser evidence must cover:

- 320px, 390px, 768px, 1024px, and 1440px;
- no page or A-003 overflow;
- correct desktop side-by-side and mobile stacked direction;
- Software / Systems first in reading order;
- all four roles and both track headings visible;
- controls at least 44px;
- details opening inside their owning role;
- two details open simultaneously;
- keyboard activation and focus retention;
- 200% zoom without overlap;
- light and dark contrast;
- disabled JavaScript and injected script failure;
- reduced motion;
- print preview with complete, unclipped role content;
- unchanged A-001 interactions, A-002 route, A-004 module controls, and A-005 disclosures.

## 17. Approved Outcome

A-003 should read immediately as a career map with two forms of evidence: Ashley builds technical systems and operates real environments. The vertical tracks make progression and future growth legible; role-owned details reward interaction without separating evidence from its source; fail-open behavior keeps the complete work history available in every runtime mode.
