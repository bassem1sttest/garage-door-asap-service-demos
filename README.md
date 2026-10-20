# Garage Door ASAP Service — Homepage demos

Two homepage redesign concepts for garagedoorasapservice.com, built with Tailwind CSS v4 and vanilla JS (no frameworks, no animation libraries). Both use real content and photos from the live site.

**Start here:** open `index.html` in the project root. It links to both designs.

**Live:** https://bassem1sttest.github.io/garage-door-asap-service-demos/

| Demo | Style | Sections and motion |
|------|-------|---------------------|
| `demo-1-night-shift/` | Bold and industrial. Archivo Wide, sharp corners, brand red `#db0000`. Dark and light sections alternate, and each has its own layout. | Hero (dark): a full-screen slider, one service per slide with its own photo, changing every 3 seconds (pause button, dots) · About (light): crew photo + three cards · Reviews (dark): three review cards dealt into place · FAQ (light): numbered cards that slide in · Free quote (dark): service area map + a quote form (searchable city list, service list), which opens like a garage door |
| `demo-2-daylight/` | Light, friendly, editorial. Plus Jakarta Sans, soft 28px radii, floating pill header. | Hero photo with a Google rating line and a quick-quote bar · guarantees · specialties with the Mr. ASAP mascot · how it works · service cards that switch to an "after" photo on hover (and by themselves on touch screens) · about · reviews · booking form · FAQ · call-now panel |

## Content rules (Night Shift)

- **Each fact appears once per page.** The rating lives only in Reviews, the 30 years and the lifetime warranty only in About, the city count only in Areas, financing only in the quote section.
- Headings are at most two lines and descriptions at most three, on desktop, laptop and phone.
- On desktop every section fills one screen below the navbar, and scrolling gently snaps so a whole section shows.

## Content sourced from garagedoorasapservice.com

- Phone (877) 787-7121, info@garagedoorasapservice.com, 17649 US-27 Unit 16, Clermont, FL 34711
- Services: spring cycles (10–20k typical, ASAP springs up to 50,000), why to replace both springs, nickel-plated rollers, opener repair and replacement, off-track doors, the 29-point tune-up
- About: family-owned, 30 years, lifetime warranty on all parts, American-made when available, lower overhead than franchises
- Reviews (Carole Engels, Joann Deronda, Margaret Black), 5.0 from 600 reviews
- The full city list (73 cities) and 6 counties
- Brand assets: Mr. ASAP mascot and wordmark

## Images (`assets/img/`)

Self-hosted and resized for their slot. Large photos ship as AVIF first (through `<picture>`), with WebP as the fallback.

- Photos are matched to the service they show (springs, openers, rollers, shifted doors, tune-ups), and no image carries a credit, watermark or source name.
- Photos that only show at large sizes keep their real width in `srcset`, so the browser never picks an upscaled file.

## Performance

- No third-party requests. Fonts are self-hosted variable WOFF2 files trimmed to the characters, weights and widths each design uses (Archivo 32 KB, Plus Jakarta Sans 12 KB), and preloaded.
- The built CSS and the minified JS (esbuild) are placed inside each `index.html` (`<style data-inline>`, `<script data-inline>` at the end of `<body>`), so a page needs no extra request for them. `npm run build` does this through `scripts/inline-assets.mjs`; `src/input.css` and `main.js` stay the files to edit, and the intermediate `styles.css` is not committed.
- Only the first hero photo loads up front; each slider photo loads one slide ahead. The hero image is preloaded as AVIF with `fetchpriority="high"` and a responsive `srcset`.
- Images below the fold use `loading="lazy"` and `decoding="async"` and declare `width`/`height`, so the layout doesn't shift (CLS 0).
- Animations only use `transform`, `opacity` and `clip-path`, and are turned off under `prefers-reduced-motion`. No backdrop blur on opaque cards.
- Measured on a phone profile over slow 4G: the main content appears in about 1.5 s, with no console errors.

## Editing styles

```bash
npm install
npm run dev:1     # watch demo 1
npm run dev:2     # watch demo 2
npm run build     # minified build of both, with the CSS and JS placed inside each page
```

Source CSS lives in each demo's `src/input.css` (theme tokens, components and the "Section animations" block).

## Notes

- Forms are demo-only (no backend). Wire them to your form handler or CRM.
- Every dropdown is the same accessible list (ARIA combobox, shared code in both `main.js` files): it always opens downward as an overlay, so the form and the page never move; 4.5 rows show and the rest scroll. The city field is searchable, and a city outside the list can still be sent.
- The phone fields always show at least 16 digits.
