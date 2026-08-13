# A-006 Contact — Title Block

**Status:** Approved (prototype reviewed 2026-08-13)
**Sheet:** A-006, Contact — sheet 6 of 6
**Scope:** Structure and design only. Content corrections are Ashley's, separately.

## 1. Goal

Rebuild A-006 as the drawing set's **title block**: the formal terminator every
engineering drawing ends with. Contact details stop being a section and become
fields in that block.

## 2. Why the current sheet fails

Four structural defects, all visible in the markup:

1. **The sheet ends twice.** A contact grid (`.dep`), a call to action (`.init`)
   and an email line close the sheet; then `.endpage` closes it again with
   "End of Document", its own metadata, a signature, and a second set of contact
   links.
2. **The email address appears three times** on one sheet — the button, the line
   beneath it, and the end block.
3. **The grid is abandoned at the last moment.** Every sheet in the set is
   left-aligned to a document grid. `.endpage` sets `text-align:center` and
   `.endmeta` sets `margin:… auto`, so the final screen of the site breaks the
   visual system the other five sheets establish. Nothing on a real drawing is
   centred.
4. **`.dep` holds unequal things in equal cells.** Status, Open to and Location
   are facts; Résumé is a download control styled identically to a data value.

Two smaller signals confirm the components are wrong rather than merely untidy:
`.endmeta` is used twice, the second time with an inline `style` override; and
`.sig` repeats the name and title the cover's `h1` already carries.

## 3. The idea

Five sheet headers have been abbreviating a title block for the whole document
(`Sheet 4 of 6 · Rev 3.0 · Scale 1:1 · Active`), and the index rail carries
another fragment (`AS-001 / Rev 3.0`). **The block itself has never been drawn.**

A-006 draws it. The scattered fragments come home, and "Drawn by" is where
contact details naturally live.

### Issued for

Real drawings carry an **Issued for** field — *issued for construction*,
*issued for tender* — stating what the document is released to do. Here it
states the ask:

> **ISSUED FOR** — Summer 2027 software engineering internship

This replaces `Open to: Collaboration — Enterprise software · dashboards ·
mobile`, the vaguest line on the site and the only unevidenced one ("mobile" has
no project behind it on A-005).

## 4. Layout

One bordered block, five columns at full width:

```
"title  title  title  title  drawn"
"issued issued issued issued drawn"
"doc    rev    sheets scale  refs"
"status date   loc    loc    refs"
```

Cells and their sources — every value already exists on the site:

| Cell | Content | Comes from |
|---|---|---|
| Document title | Blueprint of Ashley Sum · Computer Science, SFSU | cover |
| Issued for | Summer 2027 software engineering internship | replaces `Open to` |
| Drawn by | Ashley Sum · Software Engineer · email | `.sig` + `.dep` |
| References | GitHub, LinkedIn, Résumé (PDF) | `.endmeta` |
| Document no. | AS-001 | index rail |
| Revision | 3.0 | sheet headers |
| Sheets | 6 | cover |
| Scale | 1:1 | sheet headers |
| Status | Active | sheet headers |
| Issued | the cover's Updated date | cover |
| Location | San Francisco, CA · relocatable | `.dep` |

One action follows the block: the existing `.init` "Email me", unchanged.

### Hairlines

The block is a grid with `gap:1px` over a `--line` background; cells paint
`--paper`. Every division is exactly one pixel and no cell can double its
neighbour's border. This is what makes it read as a drawn block rather than a
row of boxes, and it survives any rearrangement of the areas.

### Responsive

| Width | Columns | Areas |
|---|---|---|
| > 1000px | 5 | as above |
| ≤ 1000px | 2 | title, issued full width; drawn + refs paired; metadata in pairs; location full width |
| ≤ 620px | 1 | `grid-template-areas:none`, cells forced to `grid-area:auto`, DOM order governs |

DOM order is therefore **title, issued, drawn, refs, doc, rev, sheets, scale,
status, date, loc** — contact ahead of metadata, because on a phone the contact
route matters more than the revision number.

## 5. Deletions

`.dep`, `.endpage`, `.endmeta` and `.sig` are used **only** on A-006 (verified:
lines 697–718 of `index.html` are their sole occurrences). Their rules are
removed from `blueprint.css` with the markup. `.init` is kept unchanged.

No other sheet, no test and no JS references them.

## 6. Constraints

Inherited from the project and binding here:

- No dependencies, no build step, no third-party requests.
- Semantic HTML. The block is a `<dl>`-flavoured structure of labelled values,
  not a table — it is not tabular data, it is a set of named fields.
- Both themes, via tokens only. No colour literals outside `:root`.
- Print must not inherit the dark theme (the `:root,:root[data-theme]`
  precedence rule already in the stylesheet).
- `prefers-reduced-motion` respected; the block carries the existing `.an`
  reveal, nothing new.
- Every link ≥ 44px target.
- A-001 through A-005 unchanged.

## 7. Accessibility

- The block is one `<section>`-level region under the existing `<h2>Contact</h2>`;
  no new heading level, so the document outline is unchanged.
- Each cell is a label/value pair. Labels are not `<label>` elements — nothing
  here is a form control.
- References are a list of links; the trailing `↗` and `PDF` markers are
  decorative and `aria-hidden`, with the link text carrying the full purpose
  (WCAG 2.4.4 — "Résumé", not "PDF").
- Focus states use the existing `:focus-visible` rule.

## 8. Out of scope

Content is Ashley's, later, and explicitly **not** changed by this work:

- The résumé PDF names client systems the site abstracts (Odoo twice, Epson
  ePOS, MQTT), carries a client cost figure and a site count, and is dated
  4 August — before the Quorum rename, and listing SplitWise as the only
  project.
- Skills drift between the résumé and A-004 (C++ vs JavaScript/Kotlin/SQL;
  Tailwind vs Bootstrap).

These are recorded here so they are not lost, not because this spec addresses
them.

## 9. Tests

New contract tests:

1. **A-006 carries exactly one email address.** The regression this sheet had.
2. **A-006 declares no centred text.** No `text-align:center` and no `margin:…auto`
   in any A-006 rule — the grid discipline that broke before.
3. **Every title-block field is non-empty**, and the block carries the fields the
   spec names.
4. **The deleted components stay deleted** — `.dep`, `.endpage`, `.endmeta` and
   `.sig` appear in neither the markup nor the stylesheet.

Each must be shown to fail when the condition it names is violated, before it
counts as passing.

## 10. Verification

- `node --test` green from the repository root (not `node --test test/`, which
  Node resolves as a module).
- Browser measurement at 390 / 768 / 1440: block folds 5 → 2 → 1 without
  horizontal overflow, no cell narrower than its longest unbreakable token, and
  all link targets ≥ 44px.
- Print: block renders on the paper palette regardless of the theme toggle.
