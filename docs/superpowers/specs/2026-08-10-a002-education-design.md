# A-002 Education — Design Specification

**Date:** 2026-08-10
**Status:** Proposed for review
**Scope:** A-002 and direct naming references only

## 1. Purpose

A-002 explains Ashley Sum's formal education and academic transition from Malaysia to San Francisco. A recruiter who reads only this sheet should understand:

1. where Ashley studied before San Francisco State University;
2. the programme completed at INTI International College Subang;
3. when the transfer occurred;
4. Ashley's current institution and degree programme; and
5. where to continue for professional experience.

The sheet owns education and transfer. It does not repeat the employment chronology, responsibilities, workstreams, or results owned by A-003 Experience.

## 2. Approved Direction

Use two connected academic nodes:

`INTI International College Subang → transferred → San Francisco State University`

The institutions are the visual anchors. Transfer is relationship notation on the connecting construction line, not a third card, panel, or milestone.

The design must remain recognisably part of the engineering drawing set:

- square key lines;
- a continuous construction datum;
- stable `EDU-01` and `EDU-02` identifiers;
- factual monospaced annotations;
- stronger non-colour emphasis on the current node; and
- no radius, shadow, gradient, icon, photograph, or generic card treatment.

## 3. Naming

The public name of A-002 changes from `Journey` to `Education`.

Keep unchanged:

- drawing number `A-002`;
- anchor `#a002`;
- sheet position `2 of 6`; and
- the six-sheet document architecture.

Update every public or contributor-facing naming surface that describes A-002:

- document index label;
- A-002 sheet header and `h2`;
- page description and Open Graph description where the six sheets are named;
- A-002 source comment;
- figure and ARIA descriptions;
- `AGENTS.md` document-model table;
- A-001 cross-sheet prose or guidance that calls A-002 `Journey`; and
- relevant tests and documentation contracts.

References that contain only the drawing number `A-002` remain unchanged.

## 4. Verified Content

No content outside this section may be inferred or invented.

### 4.1 Introductory line

> From a degree-transfer programme in Malaysia to a Computer Science degree in San Francisco.

### 4.2 EDU-01 — previous institution

**Identifier:** `EDU-01`
**State:** `Previous`
**Institution:** `INTI International College Subang`
**Location:** `Subang Jaya, Malaysia`
**Dates:** `Aug 2023–Dec 2024`
**Programme:** `American Degree Transfer Program, Applied Science`

Supporting sentence:

> Programme completed before transfer to San Francisco State University.

### 4.3 Transfer notation

**Label:** `Transferred`
**Period:** `Dec 2024 → Jan 2025`

The notation states the relationship between EDU-01 and EDU-02. It must remain subordinate to both institutions.

### 4.4 EDU-02 — current institution

**Identifier:** `EDU-02`
**State:** `Current`
**Institution:** `San Francisco State University`
**Location:** `San Francisco, California`
**Dates:** `Jan 2025–Present`
**Programme:** `Bachelor of Science, Computer Science`

Do not add a generic sentence such as `Current degree programme`; the state, dates, and programme already communicate this.

### 4.5 Caption and handoff

**Figure caption:** `Fig. A-002.1 · Academic transition`
**Cross-reference:** `Professional experience → A-003`

The cross-reference is secondary drawing notation, not a prominent call to action.

## 5. Content Exclusions

Do not include:

- a coursework or study-area list;
- Dean's List recognition;
- GPA;
- an expected graduation date;
- employment events or role descriptions;
- competitive swimming or aquatics history;
- project references;
- skill tags;
- an origin/current summary row that repeats the institution locations; or
- any unverified academic claim.

## 6. Visual Composition

### 6.1 Shared node grammar

Both institution records are route nodes on one continuous construction datum. They are not standalone cards.

Each node contains, in this order:

1. EDU identifier and state;
2. date range;
3. institution name;
4. location; and
5. programme name.

EDU-01 includes the approved supporting sentence. EDU-02 does not need a supporting sentence.

The current EDU-02 node uses a heavier key line than EDU-01. Do not rely on colour alone to distinguish it.

### 6.2 Desktop — 1440px

- Place EDU-01 and EDU-02 side by side.
- Run one horizontal datum through both nodes.
- Put the `Transferred · Dec 2024 → Jan 2025` notation on the connector between them.
- Terminate the connector visibly at EDU-02 with a small arrowhead or destination tick.
- Keep the institution nodes dominant and the connector subordinate.
- Preserve negative space around the route.

### 6.3 Tablet — 768px

- Prefer the same horizontal route while both nodes remain readable at the established text floor.
- The route must fit the content pane without page-level overflow.
- If the institution names or programmes become cramped, change to the vertical composition rather than shrink factual text or introduce horizontal panning.

### 6.4 Phone — 390px

- Stack EDU-01 above EDU-02 in normal document order.
- Rotate the datum into a vertical construction line.
- Place the transfer notation between the nodes.
- Retain a small directional arrow or destination tick pointing into EDU-02.
- Require no horizontal panning.
- Keep the same visible content and semantic order as desktop.

The responsive views are one information model and one semantic record set. Do not duplicate desktop and mobile markup.

## 7. Typography, Colour, and Themes

- Use the existing self-hosted Public Sans and Spline Sans Mono fonts.
- Use the existing light, dark, and print theme tokens.
- Do not copy prototype-only colours or generic system fonts into production.
- Factual labels and transfer notation use at least the site's established 8.5–9px drawing-text floor.
- Factual text must meet WCAG AA contrast in light and dark themes.
- Lighter tokens may be used for decorative linework, not essential dates, states, locations, programmes, or transfer text.
- Preserve legibility at 200% zoom.

## 8. Semantics and Accessibility

The essential content must be understandable from semantic HTML without CSS, JavaScript, or animation.

- Use a section heading followed by two ordered education records.
- Keep EDU-01 before EDU-02 in DOM order.
- Express the transfer relationship in visible text, not only with a pseudo-element arrow.
- Decorative lines and arrowheads are hidden from assistive technology.
- The section must not require focus, selection, clicking, or horizontal scrolling to reveal content.
- If a figure wrapper remains, do not label it `scrollable` unless it actually overflows.
- The accessible description must state both institutions, both date ranges, the two programmes, and the transfer interval.

Without JavaScript or when the behaviour script fails, all A-002 content remains visible in its completed state.

## 9. Motion

Motion is decorative and one-time:

1. draw the datum;
2. reveal EDU-01;
3. reveal the transfer notation and direction;
4. reveal EDU-02.

Motion must not:

- hide focusable controls;
- delay access to content;
- animate layout properties;
- loop; or
- change reading order.

Under `prefers-reduced-motion: reduce`, render the completed route immediately with no visible drawing sequence.

Print must also render the completed route regardless of reveal state.

## 10. Interaction

A-002 has no local interactive state. Do not add tabs, accordions, hover-only information, tooltips, carousels, draggable timelines, or zoom controls.

The persistent document index remains the navigation mechanism. The `Professional experience → A-003` notation may remain plain text or become an ordinary anchor if that matches the existing cross-reference convention; it must not resemble a primary button.

## 11. Implementation Boundaries

Allowed production changes:

- A-002 markup in `index.html`;
- direct `Journey` → `Education` naming references;
- A-002-specific responsive, theme, print, and motion CSS;
- minimal reveal logic only if the existing generic reveal system cannot express the route;
- A-002 contracts and browser-measurement coverage;
- `AGENTS.md` naming guidance; and
- cover Updated date if required by the repository contract.

Frozen unless a direct naming reference requires correction:

- A-001 visual design, interaction, and content other than the approved Athletics reference correction;
- A-003 through A-006 markup and behaviour;
- A-003 experience records and details;
- cover composition;
- drawing numbers, anchors, and cross-references; and
- global visual tokens and typography.

Because A-002 no longer contains swimming or aquatics, correct the existing A-001 Athletics cross-reference at the same time:

- visible Athletics reference: `A-003`;
- specification field: `Ref drawings: A-003 · 05.6`; and
- keep `Applied in: SplitWise · 05.6` unchanged.

## 12. Verification Contract

Automated contracts must prove:

- A-002 is publicly named `Education` on all enumerated surfaces;
- `A-002` and `#a002` are preserved;
- exactly two education records exist in EDU-01 then EDU-02 order;
- institution, location, date, programme, and transfer copy match this specification exactly;
- excluded coursework, honours, employment, GPA, and graduation content are absent from A-002;
- A-001 Athletics points to A-003 and 05.6 rather than A-002;
- A-003 through A-006 remain byte-identical;
- no duplicate desktop/mobile education markup exists;
- factual label sizes and contrast tokens meet the stated floor;
- reduced motion and print force the completed route;
- no infinite or layout-property animation is introduced; and
- no page-level or A-002 horizontal overflow exists at 320, 390, 768, 1024, and 1440px.

Manual browser verification must cover:

- 390px vertical route and destination direction;
- 768px breakpoint choice and text legibility;
- 1440px horizontal route and hierarchy;
- light and dark themes;
- 200% zoom;
- no-JavaScript and injected script-failure visibility;
- reduced motion; and
- print preview.

## 13. Acceptance Criteria

A-002 is ready when:

- a recruiter can identify the previous programme, transfer interval, current degree, and present institution in one scan;
- the sheet is visually and semantically distinct from A-001 and A-003;
- transfer reads as a relationship rather than a third content object;
- the route is directional on desktop and mobile;
- all factual text is readable and contrast-compliant;
- phone users need no horizontal pan;
- Education naming is consistent across the portfolio;
- professional experience remains owned by A-003; and
- automated and manual verification pass without changing A-003 through A-006.

## 14. Approved Prototype Reference

The approved visual direction is the critique-corrected v4 prototype stored in the gitignored brainstorming workspace:

`.superpowers/brainstorm/46537-1786336993/content/a002-education-prototype-v4.html`

The prototype is visual evidence only. Its review scaffolding, local colours, local fonts, explanatory mobile note, and approval control are not production content.
