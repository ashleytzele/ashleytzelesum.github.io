# ashleytzelesum.com

Personal portfolio for Ashley Sum, presented as an engineering drawing set:
a title block and six numbered sheets covering identity, education, experience,
system modules, projects and contact.

Static site on GitHub Pages. No build step, no dependencies, no framework.

## Layout

    index.html                        markup, plus the inline icon sprite
    assets/css/blueprint.css          the whole stylesheet
    assets/js/blueprint.js            scroll reveal, component tabs, disclosures
    assets/fonts/                     Public Sans and Spline Sans Mono (OFL 1.1)
    assets/images/                    figure media and the video poster
    assets/videos/                    figure media
    assets/documents/                 résumé
    docs/superpowers/specs/           design spec
    docs/superpowers/plans/           implementation plan
    test/                             contract tests (node --test)
    tools/measure-in-browser.js       manual browser measurement gate

## Running it

    python3 -m http.server 8118

Then open <http://localhost:8118/>.

## Tests

    node --test

Plus a manual browser measurement pass — `tools/measure-in-browser.js`. See
`test/README.md` for how to run it.

## Changing content

Every fact on the page lives in a named slot with a fixed shape. The shapes are
specified in `docs/superpowers/specs/2026-08-06-blueprint-portfolio-design.md`;
the contract tests enforce them. A figure can be a drawn SVG, an image or a
video, and swapping one for another is a change inside the slot alone.

Sheet numbers `A-001`–`A-006` are load-bearing: the index, the anchors and the
cross-references inside the drawings all depend on them.

## Credits

Fonts: Public Sans and Spline Sans Mono, SIL OFL 1.1 — see `assets/fonts/OFL.txt`.
Icons: Simple Icons, CC0 1.0, inlined as an SVG sprite.
