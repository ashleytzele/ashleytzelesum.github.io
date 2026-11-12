# AGENTS.md — working memory for this repo

Read this before touching anything.

## 1. What this is

`ashleytzelesum.com`, version 3 of Ashley Sum's personal portfolio. Ashley is a Computer Science student at San Francisco State University looking for a Summer 2027 software engineering internship.

Static site on GitHub Pages. No framework, no bundler, no build step. Two pages:

- `index.html`: hero, pinned diagonal project slider, experience and education timelines, skills, outside of code, contact. Fonts load from Google Fonts.
- `life.html`: an endless, draggable masonry wall of photos and videos with a back button.

Version 2 (the blueprint drawing set) is preserved under the git tag `v2-blueprint`. Its design rules and contract tests do not apply to version 3.

## 2. Confidentiality (still binding)

Ashley's professional work was done at OSPIT Mobility on an engagement for a client. Naming OSPIT is fine. Naming the client is not settled. Keep off every tracked file: the client's name and abbreviation, their domains, sub-brand names, internal system names, and individual site place names.

`.confidential-terms` holds the forbidden strings and is gitignored on purpose. Committing that file is the leak. `node --test` scans every tracked file against it. Run it before every commit. A technology name can itself be forbidden when it identifies a specific internal system.

Text inside images and videos is not covered by the test. Check new media by eye.

## 3. Content sources (outside this repo, on purpose)

- `~/Desktop/ASHLEY-MASTER-PROFILE.md`: the source of truth, with `[NEEDS CLARIFICATION]` markers.
- `~/Desktop/website-content.md` and `~/Desktop/project-inventory-2026-08-07.md`.

Do not copy any of these into the repo.

## 4. Copy rules

- Website copy carries no numbers.
- Describe what a project delivered overall, not a per-person split. Never claim a feature Ashley did not work on.

## 5. How Ashley works

brainstorm → prototype → spec → plan → tasks → result. She reviews visually; "doesn't feel right" is real signal. When she freezes something, it is frozen.
