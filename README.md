# Garage Door ASAP Service — Homepage demos

Two homepage redesign concepts for garagedoorasapservice.com, built with Tailwind CSS v4 and vanilla JS (no frameworks, no animation libraries). Each one uses real content and photos from the live site.

**Start here:** open `index.html` in the project root. It links to both designs.

| Demo | Style | Signature sections |
|------|-------|--------------------|
| `demo-1-night-shift/` | Dark, cinematic, industrial. Archivo Wide, sharp corners, numbered sections, brand red `#db0000` | Garage door rolls up to reveal a full-bleed dusk photo · photo service cards with pointer spotlight · "Springs that last" cycle chart (10k vs 20k vs 50k) · real before/after shifted-door job · crew photo with count-up stats · 73-city live search · quote form with financing badge |
| `demo-2-daylight/` | Light, friendly, editorial. Plus Jakarta Sans, soft 28px radii, floating pill header | Photo-collage hero with word rotator and quick quote · services bento with real part photos · "What's your door doing?" diagnosis tool with a photo per symptom · 29-point tune-up checklist (from the maintenance page) · crew photo · autoplay reviews · city checker and marquee · FAQ · Mr. ASAP mascot CTA |

## Content sourced from garagedoorasapservice.com

- Phones (877) 787-7121 / (877) 919-7828, info@garagedoorasapservice.com, 17649 US-27 Unit 16, Clermont, FL 34711
- Services and service-page copy: spring cycles (10,000 minimum, 10–20k typical, ASAP springs up to 50,000), why to replace both springs, nickel-plated rollers, opener repair and replacement features, off-track door causes and repair steps, the full maintenance inspection and tune-up list
- About: family-owned, 30 years, lifetime warranty on all parts, American-made when available, lower overhead than franchises
- Reviews (Margaret Black, Joann Deronda, Carole Engels), 5.0 from 600 reviews
- The full city list (73 cities) and 6 counties
- Brand assets: Mr. ASAP mascot, wordmark, "We Finance — no payment, no interest for 25 months" badge

## Images (`assets/img/`)

All images are self-hosted WebP, resized for their slot, and the large photos also ship as AVIF (served first through `<picture>`, with WebP as the fallback). Both demos share them.

- **Company photos** from the live site: crew and trucks, technician at work, before/after shifted door, springs, openers, rollers, spring stock, logo and mascot.
- **License-free photos** for the large hero and background images: Unsplash (`home-dusk`, `home-two-garage`, `home-palms`, `home-modern-dusk`, `tools-wall`) and rawpixel CC0 (`home-florida`, `door-glass`).

Swap in your own job-site photos any time: keep the file names, or update the `src`/`srcset` paths.

## Performance

- No third-party requests: fonts are self-hosted variable WOFF2 files trimmed to the Latin characters, weights and widths each design uses (Archivo 52 KB, Plus Jakarta Sans 24 KB), and preloaded.
- The hero image is preloaded as AVIF with `fetchpriority="high"` and a responsive `srcset`, so phones download about 15–25 KB for it.
- Every image below the fold uses `loading="lazy"` and `decoding="async"` and declares `width`/`height`, so the layout doesn't jump while images load.
- Compiled CSS is about 47–52 KB per demo (about 9 KB gzipped). JS is a few KB with no dependencies, loaded with `defer`.
- Animations only use `transform`/`opacity`/`clip-path` and are disabled under `prefers-reduced-motion`. Design 2's hero zoom and scroll progress bar are CSS scroll-driven animations, its FAQ is a native `<details name>` accordion, and its diagnosis panel swaps with a View Transition, so no JS runs on scroll.
- Measured on a phone profile over slow 4G: the largest content appears in about 1.7 s, the page weighs 220–260 KB, and the layout never shifts (CLS 0). There are no console errors.

## Editing styles

```bash
npm install
npm run dev:1     # watch demo 1
npm run dev:2     # watch demo 2
npm run build     # minified build of both
```

Source CSS lives in each demo's `src/input.css` (theme tokens + component and animation layer).

## Notes

- Forms are demo-only (no backend). Wire them to your form handler or CRM.
- The before/after and parts photos from the live site are low resolution (260–960 px), so they're used at small sizes. Higher-resolution originals would look sharper in the crew banner (Design 1) and the service cards.
