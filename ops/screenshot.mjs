// Screenshot-verify every wireframe/prototype page at mobile and desktop viewports.
// Usage: node ops/screenshot.mjs [glob-root...]  (defaults to design/wireframes and design/prototype)
// Output: design/screenshots/<viewport>/<relative-path>.png + a manifest JSON.
import { chromium } from 'playwright';
import { readdirSync, statSync, mkdirSync, writeFileSync } from 'fs';
import { join, relative, dirname } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ['design/wireframes', 'design/prototype'];
const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: 'desktop', width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
];

function htmlFiles(dir) {
  let out = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out = out.concat(htmlFiles(p));
    else if (f.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = targets.flatMap(t => {
  const p = join(ROOT, t);
  try { return statSync(p).isDirectory() ? htmlFiles(p) : [p]; } catch { return []; }
});
if (!files.length) { console.error('No HTML files found for', targets); process.exit(1); }

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--force-prefers-reduced-motion'] });
const manifest = [];
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor });
  const page = await ctx.newPage();
  for (const file of files) {
    const rel = relative(ROOT, file).replace(/^design\//, '').replace(/\.html$/, '');
    const out = join(ROOT, 'design/screenshots', vp.name, rel + '.png');
    mkdirSync(dirname(out), { recursive: true });
    const errors = [];
    page.removeAllListeners('pageerror');
    page.on('pageerror', e => errors.push(String(e)));
    await page.goto('file://' + file, { waitUntil: 'networkidle' });
    await page.waitForTimeout(250);
    await page.screenshot({ path: out, fullPage: true });
    manifest.push({ file: relative(ROOT, file), viewport: vp.name, png: relative(ROOT, out), pageErrors: errors });
    console.log(`${vp.name}  ${relative(ROOT, file)}  -> ${relative(ROOT, out)}${errors.length ? '  JS-ERRORS:' + errors.length : ''}`);
  }
  await ctx.close();
}
await browser.close();
writeFileSync(join(ROOT, 'design/screenshots/manifest.json'), JSON.stringify(manifest, null, 1));
const errCount = manifest.filter(m => m.pageErrors.length).length;
console.log(`\n${manifest.length} screenshots; ${errCount} pages with JS errors`);
process.exit(errCount ? 2 : 0);
