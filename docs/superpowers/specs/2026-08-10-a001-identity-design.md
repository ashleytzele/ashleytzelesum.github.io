# A-001 Identity — Design Specification

**Date:** 2026-08-10  
**Status:** Proposed for review  
**Scope:** A-001 only

## 1. Purpose

A-001 is the orientation sheet for Ashley Sum. A recruiter who reads only this drawing should understand:

1. where Ashley comes from;
2. what Ashley is doing now;
3. what kind of engineering interests Ashley;
4. the role swimming and aquatics play in Ashley's identity; and
5. what Ashley is seeking next.

The sheet is an overview, not a replacement for A-002 Journey, A-003 Experience, A-004 Engineering, A-005 Projects, or A-006 Contact. It introduces those subjects and points forward to their detailed drawings.

## 2. Design Principles

- Preserve the approved engineering-drawing visual language.
- Keep the four-component assembly as the central identity device.
- Make the basic orientation understandable without interaction.
- Use interaction for supporting detail, not for essential facts.
- Use natural language. Blueprint terminology belongs in labels, annotations, references, and structure rather than ordinary prose.
- Keep every claim traceable to `ASHLEY-MASTER-PROFILE.md`.
- Do not invent a narrow engineering specialisation, swimming credentials, competition level, team size, or leadership authority.
- Keep all changes inside A-001 and its directly supporting CSS, JavaScript, and tests.

## 3. Information Architecture

The assembly contains four components in this order:

1. Background
2. Now
3. Engineering
4. Athletics

The sequence moves from origin to present activity, then professional direction, then the personal domain that connects to Ashley's work.

`Now` is selected by default because it answers the most immediate recruiter question: who is Ashley today?

## 4. Visible Sheet Content

### 4.1 Sheet header

Keep the existing header shape and metadata:

- Drawing A-001
- Identity
- Sheet 1 of 6
- Rev 3.0
- Scale 1:1
- Active

Keep the page heading `Identity`.

### 4.2 Assembly annotations

Keep:

- numbered balloons `01` through `04`;
- assembly axis `A–A` on desktop and tablet where space permits;
- the dimension annotation `4 COMPONENTS`;
- component outlines and leader relationships;
- the selected-part inversion treatment; and
- primary drawing references.

Use these component labels and visible descriptors:

| No. | Component | Descriptor | Primary visible reference |
|---|---|---|---|
| 01 | Background | Malaysia · INTI · San Francisco | A-002 |
| 02 | Now | Computer Science · aquatics | A-003 |
| 03 | Engineering | Systems · software · physical operations | A-004 |
| 04 | Athletics | Competitive swimming · aquatics | A-002 |

Primary references stay short enough to read as drawing annotations. Additional references belong in the specification panel rather than being compressed into the assembly.

## 5. Component Specifications

The specification panel retains its current stable shape:

- eyebrow: `Component Specification`;
- component title;
- one short paragraph;
- three label/value fields.

### 5.1 Background

**Title:** Background

**Paragraph:**

> From Malaysia, through INTI International College, to San Francisco State, where I am pursuing a B.S. in Computer Science.

**Fields:**

- Ref drawing: A-002
- From: Malaysia
- Previous: INTI International College

### 5.2 Now

**Title:** Now

**Paragraph:**

> I am studying Computer Science at San Francisco State and working as a Student Lead in Aquatics, with software engineering experience across systems, interfaces and physical operations.

**Fields:**

- Studying: B.S. Computer Science
- Current: Student Lead, Aquatics
- Seeking: Summer 2027 software engineering internship

The copy must say `software engineering experience`, not imply that the June–August 2026 internship remains an indefinite current role.

### 5.3 Engineering

**Title:** Engineering

**Paragraph:**

> I am interested in software that connects systems, interfaces and physical operations, with a focus on making complicated tools usable by the people who depend on them.

**Fields:**

- Ref drawings: A-004 · A-005
- Experience: Backend · full stack · mobile
- Focus: Systems · operability

This describes the pattern supported by Ashley's work without declaring an unsupported single specialisation.

### 5.4 Athletics

**Title:** Athletics

**Paragraph:**

> Competitive swimming provides the domain knowledge behind SplitWise, while lifeguarding and aquatics work bring a different kind of operational responsibility outside software.

**Fields:**

- Ref drawing: A-002
- Discipline: Swimming
- Applied in: SplitWise · 05.6

Do not add competition level, events, strokes, times, certifications, years trained, coaching, or officiating unless Ashley later confirms them.

## 6. Static Overview

The static overview must communicate the essential identity without requiring component selection.

**Eyebrow:** Overview

**Paragraph:**

> From Malaysia to San Francisco, I am studying Computer Science at San Francisco State while working as a Student Lead in Aquatics. My software work spans systems, interfaces and physical operations, with a focus on making complicated tools usable by the people who depend on them.

**Metadata:**

- Location: San Francisco, CA · relocatable
- Availability: Summer 2027
- Contact: email · GitHub · LinkedIn · résumé

The current `Status` field is removed. Its role and availability are separated so a past internship cannot be misread as Ashley's permanent current status.

Contact remains on A-001 despite also appearing on A-006 because immediate recruiter access is useful. A-006 remains the full contact and document-close drawing.

## 7. Visual Composition

### 7.1 Desktop — 1440px

- Keep the fixed document index and desktop A-001 drawing coordinate.
- Keep the centered content pane and two-column system grid.
- Left column: four-part vertical exploded assembly.
- Right column: selected component specification followed by the static overview.
- The assembly remains the visual anchor; the specification is the primary reading companion.
- `Now` appears selected on first view.
- Preserve intentional negative space.
- Do not add cards, photography, colour coding, decorative icons, gradients, shadows, or unrelated diagrams.

### 7.2 Tablet — 768px

- Keep the sticky horizontal drawing-number navigation.
- Hide the A-001 coordinate rule as it does today.
- Stack the assembly above the specification and overview.
- Keep the full assembly visible without page-level overflow.
- Show a pan hint only if the assembly actually overflows its container; do not display a false hint merely because the viewport is below a breakpoint.

### 7.3 Phone — 390px

- Replace the wide, pannable assembly presentation with a compact vertical assembly representation.
- Keep all four component names visible together in one scan.
- Preserve numbered balloons, component outlines, primary references, and selected-part inversion.
- Omit the long vertical dimension line and A–A axis when they would force horizontal panning; the four numbered components already communicate the assembly relationship.
- Place the selected specification immediately after the component group.
- Place the static overview and metadata after the specification.
- Do not shrink technical labels below the established readable drawing-text floor.
- Do not create page-level horizontal overflow.

The phone representation is a responsive view of the same four-component model, not a different information architecture. The implementation uses one semantic component-control set that reflows across breakpoints. Decorative axis, dimension, leader, and reference marks may change or hide around that control set, but desktop and phone must not introduce duplicate interactive markup.

## 8. Interaction Design

### 8.1 Selection

- Clicking or tapping a component selects it and replaces the specification content in place.
- Only one component is selected at a time.
- The selected state uses the current ink/paper inversion.
- Hover may preview emphasis but must remain visually distinguishable from the persistent selected state.
- Selection must not change the page heading or cause layout shift.

### 8.2 Keyboard

Retain the existing tab pattern:

- one tab stop enters the component group;
- Arrow Down and Arrow Right move to the next component;
- Arrow Up and Arrow Left move to the previous component;
- Home selects the first component;
- End selects the final component;
- Enter and Space activate the focused component; and
- focus moves with arrow-key selection.

Desktop/tablet and phone representations must not create duplicate active tab stops. Only the visible representation participates in the accessibility tree and keyboard order.

### 8.3 Drawing references

Primary references remain drawing notation. They are not styled as hyperlinks.
They remain non-navigational in this A-001 pass. Navigation continues through the document index, preventing technical annotations from becoming visually inconsistent interface controls.

## 9. Animation

- Retain the existing one-time reveal when A-001 enters the viewport.
- On desktop/tablet, retain the construction-line draw, axis reveal, and staggered annotation fade.
- On phone, use a restrained sequential reveal of the four compact component rows.
- Do not animate layout properties.
- Do not loop animation.
- Honour `prefers-reduced-motion` by showing the completed drawing immediately.
- A script failure or disabled JavaScript must never leave content hidden.

## 10. Accessibility

- Keep exactly one A-001 tablist and one logical tab per component in the active responsive representation.
- Keep one tabpanel whose accessible label follows the selected component.
- Preserve visible focus treatment.
- Preserve 44px minimum pointer targets.
- Do not place interactive controls inside `role="img"`.
- Do not communicate selection by colour alone; inversion and focus/outline state must remain discernible.
- Dynamic specification updates must be available to assistive technology without excessively interrupting reading.
- The component group, specification, overview, contact links, and next sheet must follow a logical DOM and keyboard order.

## 11. Data and Implementation Boundaries

- Keep the four component records in one JavaScript data source.
- The one responsive component-control set must use the keys `background`, `now`, `engineering`, and `athletics`.
- Do not duplicate component prose independently across desktop and phone markup.
- Keep the component controls in one DOM structure. Reflow them with CSS; treat the surrounding axis, dimensions, leaders, and other drawing marks as non-interactive decoration.
- Component count, rendered controls, specification records, and `4 COMPONENTS` annotation must continue to move as one tested unit.
- Preserve the static-site constraint: no framework, dependency, build step, CDN, or third-party request.
- No changes to the frozen cover or A-002 through A-006.

## 12. Testing and Acceptance Criteria

### Automated contracts

The implementation must keep the full existing suite green and add or update focused contracts proving:

- four component keys match four interactive tabs;
- the default component is `now`;
- all four specification records contain the required fields;
- the static overview is present without JavaScript;
- exactly one component control set exists and is keyboard-accessible at every width;
- desktop/tablet and phone layouts share the same component data and control markup;
- the `4 COMPONENTS` annotation agrees with the model;
- all ARIA references resolve;
- the tablist retains roving tabindex semantics;
- no client-identifying term enters tracked files; and
- the cover Updated date is changed only if the production site files change, following the existing contract.

### Browser verification

Verify at 1440px, 768px, and 390px:

- no page-level horizontal overflow;
- all four components are identifiable;
- selected and hover states are distinguishable;
- click/tap and keyboard selection update the correct specification;
- no duplicate focusable component controls exist;
- touch targets are at least 44px;
- the 390px view shows all four component labels without horizontal panning;
- reduced-motion mode shows completed content immediately;
- light and dark themes preserve contrast; and
- the frozen cover remains visually unchanged.

## 13. Out of Scope

- Any change to the cover.
- Restructuring A-002 through A-006.
- Rewriting detailed education, experience, engineering, or project content.
- Adding a photograph, biography timeline, skill cloud, personality test, hobbies list, or testimonials.
- Adding unverified swimming or leadership details.
- Choosing a narrower career specialisation than the available evidence supports.
- Deploying or publishing the site.

## 14. Success Test

After reading A-001 once, a recruiter should be able to say:

> Ashley is a Computer Science student from Malaysia now at San Francisco State, works as a Student Lead in Aquatics, has software engineering experience with systems connected to physical operations, swims competitively, and is seeking a Summer 2027 software engineering internship.

If that summary requires opening multiple later drawings, A-001 has not completed its job.
