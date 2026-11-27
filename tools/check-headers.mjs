// Verify that a deployed URL serves the security headers from staticwebapp.config.json.
// Usage: node tools/check-headers.mjs https://example.azurestaticapps.net/
import { readFile } from 'node:fs/promises';

const url = process.argv[2];
if (!url) { console.error('usage: node tools/check-headers.mjs <url>'); process.exit(2); }
const config = JSON.parse(await readFile(new URL('../src/staticwebapp.config.json', import.meta.url), 'utf8'));
const required = ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options',
  'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options'];

let failed = false;
for (const path of ['', 'js/app.js', 'data/parameters.js']) {
  const res = await fetch(new URL(path, url), { redirect: 'manual' });
  console.log(`${res.status} ${new URL(path, url).href}`);
  if (res.status !== 200) { failed = true; continue; }
  for (const h of required) {
    const got = res.headers.get(h);
    const ok = got === config.globalHeaders[h];
    if (!ok) failed = true;
    console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${h}: ${got ?? '(missing)'}`);
  }
}
const html = await (await fetch(url)).text();
const dict = await (await fetch(new URL('js/i18n.js', url))).text();
for (const marker of ['Van erfpacht naar vol eigendom', 'From leasehold to full ownership']) {
  const ok = dict.includes(marker);
  if (!ok) failed = true;
  console.log(`  ${ok ? 'OK  ' : 'FAIL'} language string served: ${marker}`);
}
if (!html.includes('js/app.js')) { failed = true; console.log('  FAIL index.html does not load js/app.js'); }
process.exit(failed ? 1 : 0);
