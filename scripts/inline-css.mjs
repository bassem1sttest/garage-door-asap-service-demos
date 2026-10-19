// Puts each design's built CSS inside its index.html, so the first paint needs no extra request.
// usage: node scripts/inline-css.mjs <design-dir>          -> inline styles.css
//        node scripts/inline-css.mjs <design-dir> --strip  -> back to <link>, so Tailwind never scans its own output
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dir, flag] = process.argv.slice(2);
const page = join(dir, 'index.html');
const html = readFileSync(page, 'utf8');
const link = '<link rel="stylesheet" href="./styles.css" />';
const inlined = /<style data-inline>[\s\S]*?<\/style>/;

let out;
if (flag === '--strip') {
  out = html.replace(inlined, link);
} else {
  const css = readFileSync(join(dir, 'styles.css'), 'utf8').trim();
  const tag = `<style data-inline>${css}</style>`;
  out = inlined.test(html) ? html.replace(inlined, () => tag) : html.replace(link, () => tag);
  if (!out.includes('<style data-inline>')) throw new Error(`no stylesheet link found in ${page}`);
}
writeFileSync(page, out);
