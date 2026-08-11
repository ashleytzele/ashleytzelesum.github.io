# PRODUCT.md

Strategic context for `ashleytzelesum.com`. Inferred from `AGENTS.md`,
`docs/superpowers/specs/2026-08-06-blueprint-portfolio-design.md` and the existing
per-sheet specs rather than from an interview, because those documents already answer
every question the init flow asks. Correct anything that misreads the intent.

## Register

**Brand.** Design IS the product. This is a portfolio: the artefact is the argument.

## Product purpose

Present Ashley Sum — a Computer Science student at San Francisco State — to internship
recruiters and engineering teams evaluating her for **Summer 2027 software engineering
roles**.

The site is an engineering drawing set: a cover with a title block, then six numbered
sheets (A-001 Identity, A-002 Education, A-003 Experience, A-004 Engineering,
A-005 Projects, A-006 Contact).

The format is the thesis, not decoration. Her actual professional work is decomposing
systems into modules and flow diagrams and writing the documentation for them. A drawing
set is what that work produces, so the portfolio is presented as the deliverable of the
job it is applying for.

## Target users

**Primary — the internship recruiter.** Scanning, non-specialist, ninety seconds. Needs
to establish quickly that this person builds real things, and to find the evidence. Will
not synthesise six project entries into a conclusion on their own.

**Secondary — the hiring engineer.** Reads for substance and will open a detail panel,
follow a link to source, and ask a follow-up question in an interview about anything
claimed. Every claim on the site must survive that follow-up.

**Tertiary — assistive-technology users on any device.** Not an edge case; a contract.

## Brand personality

**Drafted. Understated. Verifiable.**

- Plain, technical, British-leaning prose. No marketing voice, no superlatives, no
  "passionate about", no "scroll to explore".
- Systems described by what they do, not by adjectives.
- Negative space is intentional. Filling it is a regression.
- Claims are attached to evidence. Where a contribution was a team's, it is described as
  the team's.

## Anti-references

Explicitly NOT:

- The technology-inventory portfolio — logo grids, proficiency bars, skill percentages,
  a wall of clickable tool badges. The previous A-004 was this, and it is what the
  current work is replacing.
- Résumé-residue tag clouds ("Software Engineering", "UI/UX", "Digital Transformation").
- Gradients, drop shadows, glows, blurs, rounded card grids, emoji. All banned by test.
- Any framework, bundler, dependency, CDN, or third-party request. Enforced by test.
- Hero-metric templates and identical card grids.

## Strategic design principles

1. **The drawing conventions carry the meaning; content sits in named slots.** Every fact
   lives in a slot with a fixed shape. A figure slot accepts a drawn SVG, an image or a
   video, and swapping one for another must not touch layout or CSS.
2. **Sheet numbers are load-bearing.** The index, the anchors and the cross-references
   drawn inside figures all depend on them. Renumbering is a breaking change.
3. **Each sheet must have a job no other sheet can do.** A-003 says where she worked,
   A-005 proves what she built; A-004 must state the conclusion neither can.
4. **Fail open.** Content is never gated behind JavaScript. Disclosures ship expanded and
   are collapsed by script; a runtime failure leaves a complete, readable document.
5. **Nothing requires panning, zooming, or learning a control scheme** before the content
   makes sense.

## Accessibility

Contractual, not aspirational, and enforced by 76 tests:

- WCAG 2.1 AA contrast throughout
- 44×44 minimum touch targets on every control
- Full keyboard operation; visible focus; correct ARIA relationships
- `prefers-reduced-motion` honoured — every animation has a still alternative
- Light, dark and print all supported
- No horizontal overflow at any viewport
- Interactive SVG never inside a presentational role; icons always `aria-hidden`

## Constraints

Static site on GitHub Pages. Three files carry it: `index.html`,
`assets/css/blueprint.css`, `assets/js/blueprint.js`. No build step. Self-hosted fonts
(Public Sans, Spline Sans Mono, OFL 1.1). Client-identifying terms are forbidden in
tracked files and checked by test.
