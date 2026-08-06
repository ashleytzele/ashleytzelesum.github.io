# Blueprint of a Software Engineer — Portfolio Design

## Purpose

Rebuild `ashleytzelesum.com` as an engineering drawing set. The site targets internship recruiters and engineering teams evaluating Ashley Sum for Summer 2027 roles.

The format is not decoration. Ashley's actual work at OSPIT is decomposing systems into modules and flow diagrams and writing the documentation for them. A drawing set is what that work produces, so the portfolio is presented as the deliverable of the job it is applying for.

This spec fixes the **system**, not the content. Every fact on the page is expected to change — descriptions get rewritten, projects get added, drawings may become videos. What must survive those changes is the structure below.

## Core Principle

The drawing conventions carry the meaning; the content sits in named slots.

A recruiter reads it as a normal scrolling page with a sidebar index. An engineer reads it as a drawing set with a title block, sheet numbers, callouts and a parts breakdown. Neither has to learn a control scheme. Nothing requires panning, zooming, or interpreting a legend before the content makes sense.

## Content Scope

**Fixed by this spec** — the six-sheet structure, the sheet numbering, the drawing conventions, the token set, the motion system, and the accessibility and responsive contracts.

**Expected to change** — every string, every project, every drawing, every field label, the number of records in a sheet, and the medium of any figure.

Sheets may be added, but a new sheet takes the next number in sequence and inherits the sheet contract unchanged. Renumbering existing sheets is a breaking change: the index, the anchors, the cross-references inside drawings, and any shared link all depend on them.

## Document Structure

| Sheet | Title | Holds |
|---|---|---|
| Cover | Title block | Name, revision, scale, status, author, date, sheet count |
| A-001 | Identity | Exploded assembly of the four components, component specification panel, contact block |
| A-002 | Education | Education records |
| A-003 | Experience | Role records with expandable detail |
| A-004 | System Modules | Stack section drawing, module cells, legend |
| A-005 | Projects | Project records with figure and expandable detail |
| A-006 | Contact | Availability, contact routes, closing action |

The sidebar index lists sheets by number and title, marks the current sheet, and collapses to a horizontal scrolling strip below 960px. Every sheet is reachable by anchor and by deep link.

---

## Slot Contracts

A slot is a named position with a fixed shape. Content authored into a slot must satisfy its contract; anything satisfying the contract can be dropped in without touching CSS or JS.

### Sheet slot

Every sheet carries a header (`Drawing A-00n` + title, and sheet/revision/status metadata), exactly one `<h2>` naming it, and a body. Sheets reveal once when scrolled into view and then stay static.

### Record slot — Education, Experience

A record is: a period marker, a title (`<h3>`), an organisation, and a short description of what Ashley did. Experience records may additionally carry an expandable detail panel.

Records are a list. Adding, removing or reordering one must require no other change.

### Project slot

A project is: a reference number (`05.n`), a title (`<h3>`), a tagline, a description, one media slot, a caption, a source/status line, and an expandable detail panel.

The detail panel holds free-form labelled fields. Field labels are content, not structure — `Features`, `Responsibilities`, `Technology`, `Lessons learned`, `Constraint`, `Hardware tested` are current examples, not a fixed vocabulary. A field is a label plus either prose or a list.

Every project must state whether its source is public. Client work says so plainly rather than linking nowhere.

### Media slot

**This is the slot most likely to change medium, so its contract is the strictest.**

A media slot accepts exactly one of:

- **Drawn SVG** — the current form. Uses the drawing vocabulary below.
- **Raster image** — screenshot or photograph.
- **Video** — screen recording or demo.

All three must satisfy the same contract:

1. **Declared intrinsic size.** Width and height, or an aspect ratio, known before load. No layout shift, ever.
2. **Text alternative.** A substantive description of what the media shows, not a filename. For SVG this is a label on the root element; for image and video it is `alt` / an adjacent description.
3. **Scale floor.** Media is held at its authored scale inside a horizontally scrollable region rather than being shrunk to the viewport. A figure that shrinks becomes illegible long before it becomes convenient. The scroll region is keyboard-reachable and announces itself as scrollable.
4. **No autoplay with sound.** Video is muted, carries controls, and never plays automatically when `prefers-reduced-motion: reduce` is set. A poster frame is required, and the poster must be legible on its own.
5. **Renders without JavaScript.** Media is never revealed by script alone.
6. **Caption below, source line under that.** The caption states what the figure shows. Both are content.

Swapping a drawn SVG for a video must be a change inside the slot only.

### Component slot — A-001 assembly

The assembly drawing holds a fixed count of components, currently four, each with a balloon number, a name, a one-line summary, a cross-reference to another sheet, and a specification record.

Components behave as a single-select group: selecting one displays its specification beside the drawing. The count is content; the interaction is structure. Changing the count means updating the balloon numbers, the "n components" dimension label, and the specification records together — they are one unit.

### Field slot

A field is a label and a value. Labels are uppercase monospace; values are body text. Fields appear in the title block, the specification panel, the contact block, and project detail panels. They are the same slot everywhere and must look the same everywhere.

### Icon slot

An icon is a reference into the sprite. Icons appear alongside technology names, contact routes, and module entries.

**An icon never appears alone.** Every icon is paired with its text label, is hidden from assistive technology, and inherits the current text colour so it themes for free. A technology with no icon shows its name and is marked as having no mark rather than showing an empty box.

---

## Visual System

### Palette

Eleven tokens, greyscale only, no accent colour. Colour is never the sole carrier of meaning.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#FFFFFF` | `#0D0D0D` | sheet |
| `--ink` | `#111111` | `#F2F2F2` | primary text, key linework |
| `--sec` | `#666666` | `#A2A2A2` | secondary text |
| `--ref` | `#767676` | `#8E8E8E` | reference labels, metadata |
| `--refdec` | `#999999` | `#6E6E6E` | decorative registration marks only |
| `--line` | `#D9D9D9` | `#2B2B2B` | rules and borders |
| `--hair` | `#EDEDED` | `#1C1C1C` | hairlines |
| `--mid` | `#B8B8B8` | `#3A3A3A` | dimension lines |

`--refdec` is below AA and is permitted **only** on elements hidden from assistive technology. Any visible text uses `--ref` or darker.

Four complete theme sources: system preference, explicit dark, explicit light, and print. Each redefines the full set. No hex value appears outside a theme block.

### Typography

Two self-hosted faces, no remote requests.

- **Sans** — headings, prose, drawing titles.
- **Mono** — sheet numbers, field labels, dimensions, drawing annotations, metadata.

Mono is the drawing's voice: anything a draughtsman would letter is mono. Prose is sans.

### Drawing vocabulary

Consistent across every figure, and the reason the set reads as one document:

- **Key linework** — solid, `--ink`, the subject.
- **Construction lines** — thin, `--line`, relationships and leaders.
- **Dimension lines** — `--mid`, with arrowheads and a rotated label.
- **Centre lines** — dash-dot, for assembly axes.
- **Balloons** — numbered circles on leader lines.
- **Cross-references** — the target sheet number, set right, in mono.
- **Registration marks** — corner ticks and coordinate letters at the sheet frame. Decorative and hidden from assistive technology.

Every drawn path is normalised so its stroke animation cannot drift out of sync with its geometry when the shape is resized.

### Layout

Desktop is a fixed index column plus a sheet column. Sheets use a two-column grid where content warrants it and collapse to one below 900px.

Breakpoints exist where the layout actually breaks, not on a fixed scale. A rule that changes a border direction and the rule that collapses its grid share a breakpoint — a divider that flips at a different width than the grid it divides is a defect.

Grid tracks that must be allowed to shrink are declared so they can. A track that floors at its content's intrinsic width will push the whole page wide the moment a figure with a scale floor lands in it.

---

## Motion System

One easing curve. No overshoot, no bounce, no looping ambient motion.

Each sheet draws itself once when first scrolled into view: linework draws along its path, then labels fade in. After that it is static. Nothing re-animates.

Only `transform`, `opacity` and stroke offset are animated. No layout property is ever animated.

**Motion must never gate content.** Reveal states are applied only when JavaScript is present to remove them, and a no-script fallback renders everything immediately. With JavaScript disabled, in a background tab, or if the observer never fires, the full page is readable.

`prefers-reduced-motion: reduce` renders every drawing in its final state with no animation. The content is identical; only the drawing performance is removed.

---

## Accessibility Contract

These are verified numbers, not aspirations. The build must hold them.

- **Contrast** — zero failures in both themes, for HTML text and SVG text alike. Decorative marks are exempt only if genuinely hidden from assistive technology.
- **Headings** — exactly one `<h1>`, no skipped levels, and the outline does not change when the page is interacted with. A heading that is rewritten by a click is not a heading.
- **Touch targets** — every interactive element at least 44×44 CSS pixels at every width.
- **Keyboard** — every control operable, focus visible, DOM order equals tab order, no traps. Scrollable regions are focusable.
- **The component group is a tab set** — one tab stop for the group, arrow keys and Home/End move between components, selection is exclusive, and the specification panel is labelled by the selected component.
- **Disclosure buttons** are real buttons, report their expanded state, and point at the panel they control.
- **Interactive SVG is never inside a presentational role.** A role that collapses its subtree hides every control in it.
- **Contact routes appear as selectable text**, not only as link targets.
- **Print** — A3 landscape, ink on paper, index hidden, every collapsed panel expanded, one sheet per page. A printed copy loses no content.

## Performance Contract

- Zero network requests beyond the document. Fonts self-hosted, icons inline, no dependencies.
- Zero console errors.
- Zero infinite animations.
- Zero layout properties animated.
- Every image carries explicit dimensions.
- No unreferenced assets ship. An unused sprite symbol is dead weight.
- Attributes that cannot take effect are not written. A lazy-loading hint on an inlined image is noise.

## Deliberate Departures

- **No accent colour.** The set is greyscale. Adding a brand colour turns a drawing into a dashboard.
- **No cards.** Records are ruled rows, not floating panels.
- **No shadows, gradients, blur, or glass.** One 2px radius exists in the entire document.
- **No hero metric row.** No counts of anything that cannot be verified.
- **No emoji.**
- **No numbered section labels.** The `01 02 03 04` on the assembly are balloon callouts on a drawing, which is what balloons are for — they are not editorial eyebrows above headings, and that distinction must be preserved if sections are ever numbered.
- **No canvas panning, zooming, or diagram chrome** around the page.

## Success Criteria

- A recruiter identifies who Ashley is, her status, and her strongest project within 30 seconds, without opening anything.
- An engineer can open detail on any role or project and find substance underneath.
- The set reads as one document: any figure could be cut out and still be recognisable as belonging to it.
- Every content slot can be refilled — including swapping a drawn figure for a video — without touching CSS or JavaScript.
- The accessibility and performance contracts hold after content changes, not just at launch.
- The design is recognisably tied to how Ashley works, not to a copied product brand.

## Out of Scope

- Any content management layer. Content lives in the markup; the contracts above are what make editing safe.
- Analytics, tracking, or third-party embeds.
- A blog or any section that requires ongoing publishing to stay current.
