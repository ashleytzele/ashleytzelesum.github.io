# ashleytzelesum.com

Personal portfolio for **Ashley Sum** — CS student at San Francisco State, national-level swimmer, building data tools for the sports I actually compete in.

**Live:** [ashleytzelesum.com](https://ashleytzelesum.com) · [LinkedIn](https://www.linkedin.com/in/ashley-sum) · [CV](assets/documents/ASHLEY_SUM_CV.pdf)

## What's here

One static page. No framework, no runtime dependencies.

```
index.html          the entire site — markup + a small scroll-spy script
tailwind.config.js  design tokens (colors, radii, fonts)
src/input.css       CSS source — base styles and component classes
assets/
  css/site.css      compiled stylesheet (committed; do not edit by hand)
  images/           hero, about, project screenshots
  logos/            site logo, social icons
  videos/           project demo recordings
  documents/        CV (PDF)
CNAME               custom domain
sitemap.xml         search engines
_config.yml         disables Jekyll processing on GitHub Pages
```

Sections live in `index.html` behind these anchors: `#home`, `#about`, `#projects`, `#experience`, `#skills`, `#contact`. HTML comments mark each boundary.

## Running it locally

```bash
npm run serve      # http://localhost:8080
```

Opening `index.html` directly in a browser also works — there's no server-side anything.

## Changing styles

`assets/css/site.css` is generated. Whenever you **add or change a Tailwind class in `index.html`**, or edit `src/input.css` / `tailwind.config.js`, rebuild it:

```bash
npm install        # once
npm run build      # rebuild assets/css/site.css
```

Or leave `npm run watch` running while you edit, and it rebuilds on save.

**Commit the rebuilt `assets/css/site.css`.** If you forget, the new class silently has no effect on the live site — that's the one footgun in this setup.

## Deploying

Build the CSS, then push to `main`. GitHub Pages serves it at [ashleytzelesum.com](https://ashleytzelesum.com) within a minute or two.

## Editing

| To change | Edit |
| --- | --- |
| Any copy | The text in `index.html` — search for the section comment |
| Colors, radii, fonts | `tailwind.config.js`, then `npm run build` |
| A project | Duplicate a `<!-- Project N -->` block, swap image, copy, tech chips, links |
| CV | Replace `assets/documents/ASHLEY_SUM_CV.pdf`, keep the filename |
| Images | Drop into `assets/images/`, update the `src`, set `width`/`height` |

Resize images to roughly 2× their display size before committing, and keep the `width`/`height` attributes accurate — they prevent the page from jumping as images load.

## Stack

Tailwind CSS (compiled), Material Symbols, Inter, devicon. The only JavaScript is a ~20-line `IntersectionObserver` that highlights the current section in the nav.

## Known limitations

- **No dark mode.** The `dark:` variants that used to be scattered through the markup could never activate, so they were removed. Adding real dark mode means defining dark values for the whole token set in `tailwind.config.js`.
- **Demo links open raw `.mp4` files** (8.6 MB and 3.4 MB) rather than embedded players, and neither project has a live deployment.
- **`og:image` is a 500×500 square logo** while `twitter:card` is set to `summary`. A proper 1200×630 preview image would look better when the site is shared.
- **The design is largely an untouched Material 3 export** — the token set in `tailwind.config.js` has far more colors than the site uses.

---

© 2026 Ashley Sum
