# ashleytzelesum.com

Personal portfolio of Ashley Sum, version 3. Static site on GitHub Pages: no build step, no framework, no dependencies.

## Layout

    index.html        the portfolio: hero, projects, experience, skills, education, outside of code, contact
    life.html         "Outside of code": a draggable, endless photo and video wall
    img/              project media, cartoons, favicons
    img/life/         photo wall: full photos, t/ thumbnails, v/ 720p wall clips, hd/ full-quality videos
    test/             confidentiality check (node --test)
    CNAME             custom domain

The previous blueprint design (version 2) is kept in git under the tag `v2-blueprint`.

## Running it

    python3 -m http.server 8118

Then open <http://localhost:8118/>.

## Tests

    node --test

Run from the repo root. It scans every tracked file for the client-identifying terms in `.confidential-terms` (gitignored, never commit it).
