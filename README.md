# Garage Door ASAP Service — Homepage demos

Two homepage redesign concepts for garagedoorasapservice.com, built with Tailwind CSS v4 and vanilla JS (no frameworks, no animation libraries). Both use real content and photos from the live site.

**Start here:** open `index.html` in the project root. It links to both designs.

**Live:** https://bassem1sttest.github.io/garage-door-asap-service-demos/

| Demo | Style | Sections and motion |
|------|-------|---------------------|
| `demo-1-night-shift/` | Bold and industrial. Archivo Wide, sharp corners, brand red `#db0000`. Dark and light sections alternate, and each has its own layout. | Hero: a garage door rolls up over a photo of real garage doors · Services (light): service menu + a scene that swaps, revealed by slats rolling up · About (dark): full-bleed crew banner, cards rise like door panels · Reviews (light): a card deck that is dealt in and flipped · Areas (dark): city search on a map, cities fly out of the HQ pin · FAQ (light): numbered cards that slide in · Free quote (dark): the form opens like a garage door |
| `demo-2-daylight/` | Soft and friendly. Plus Jakarta Sans, rounded tinted panels with thin arcs, floating pill header. | Hero: rotating question + quick quote · Services: pick a symptom to see the likely cause and fix, chips pop in on a spring · About: photo spins in, cards slide in from the sides · Reviews: auto-playing quotes that come into focus · Areas: city pills fly out of the HQ pin · FAQ: questions unfold · Final CTA: the panel opens as a growing circle |

## Content rules

- **Each fact appears once per page.** The rating lives only in Reviews, the 30 years and the lifetime warranty only in About, the city count only in Areas, financing only in the quote section.
- Headings are at most two lines and descriptions at most three, on desktop, laptop and phone.
- On desktop every section fills one screen below the navbar, and scrolling gently snaps so a whole section shows.

## Content sourced from garagedoorasapservice.com

- Phone (877) 787-7121, info@garagedoorasapservice.com, 17649 US-27 Unit 16, Clermont, FL 34711
- Services: spring cycles (10–20k typical, ASAP springs up to 50,000), why to replace both springs, nickel-plated rollers, opener repair and replacement, off-track doors, the 29-point tune-up
- About: family-owned, 30 years, lifetime warranty on all parts, American-made when available, lower overhead than franchises
- Reviews (Carole Engels, Joann Deronda, Margaret Black), 5.0 from 600 reviews
- The full city list (73 cities) and 6 counties
- Brand assets: Mr. ASAP mascot, wordmark, "We Finance" badge, and the garage-door hero photo

## Images (`assets/img/`)

Self-hosted and resized for their slot. Large photos ship as AVIF first (through `<picture>`), with WebP as the fallback.

- **Company photos** from the live site: the hero with two white garage doors (`hero-doors`), crew and trucks, technician at work, before/after shifted door, springs, openers, rollers, logo and mascot.
- **License-free photos** from Unsplash: `home-two-garage`, `home-modern-dusk`, `tools-wall`.

## Performance

- No third-party requests. Fonts are self-hosted variable WOFF2 files trimmed to the characters, weights and widths each design uses (Archivo 52 KB, Plus Jakarta Sans 24 KB), and preloaded.
- The hero image is preloaded as AVIF with `fetchpriority="high"` and a responsive `srcset`.
- Images below the fold use `loading="lazy"` and `decoding="async"` and declare `width`/`height`, so the layout doesn't shift (CLS 0).
- Animations only use `transform`, `opacity` and `clip-path`, and are turned off under `prefers-reduced-motion`. No backdrop blur on opaque cards.
- Measured on a phone profile over slow 4G: the main content appears in about 1.5 s, with no console errors.

## Editing styles

```bash
npm install
npm run dev:1     # watch demo 1
npm run dev:2     # watch demo 2
npm run build     # minified build of both
```

Source CSS lives in each demo's `src/input.css` (theme tokens, components and the "Section animations" block).

## Notes

- Forms are demo-only (no backend). Wire them to your form handler or CRM.
- The phone fields always show at least 16 digits.
