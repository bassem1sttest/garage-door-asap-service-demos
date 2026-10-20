// Puts each design's built CSS and minified JS inside its index.html, so the page needs no extra
// requests for them (the script sits at the end of <body>, so the page is parsed when it runs).
// usage: node scripts/inline-assets.mjs <design-dir>          -> inline styles.css + minified main.js
//        node scripts/inline-assets.mjs <design-dir> --strip  -> back to <link>/<script src>, so Tailwind never scans its own output
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { transformSync } from 'esbuild';

const [dir, flag] = process.argv.slice(2);
const page = join(dir, 'index.html');
const html = readFileSync(page, 'utf8');
const link = '<link rel="stylesheet" href="./styles.css" />';
const script = '<script src="./main.js" defer></script>';
const inlineCss = /<style data-inline>[\s\S]*?<\/style>/;
const inlineJs = /<script data-inline>[\s\S]*?<\/script>/;

let out;
if (flag === '--strip') {
  out = html.replace(inlineCss, link).replace(inlineJs, script);
} else {
  const css = readFileSync(join(dir, 'styles.css'), 'utf8').trim();
  const js = transformSync(readFileSync(join(dir, 'main.js'), 'utf8'), { minify: true, target: 'es2020' }).code.trim();
  if (js.includes('</script')) throw new Error('main.js contains "</script" and cannot be inlined');
  const styleTag = `<style data-inline>${css}</style>`;
  const scriptTag = `<script data-inline>${js}</script>`;
  out = (inlineCss.test(html) ? html.replace(inlineCss, () => styleTag) : html.replace(link, () => styleTag));
  out = (inlineJs.test(out) ? out.replace(inlineJs, () => scriptTag) : out.replace(script, () => scriptTag));
  if (!out.includes('<style data-inline>') || !out.includes('<script data-inline>')) throw new Error(`stylesheet link or main.js script tag not found in ${page}`);
}
writeFileSync(page, out);
