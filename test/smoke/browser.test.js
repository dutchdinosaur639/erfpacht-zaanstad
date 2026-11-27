// Browser smoke test: both languages at 360 px, no console errors, no CSP violations,
// no third-party requests, values kept across language switch, date notices via an injected clock.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startServer } from '../../tools/serve.mjs';

let server;
let browser;
let base;
const shotDir = process.env.SMOKE_SCREENSHOTS;

before(async () => {
  server = await startServer(0);
  base = `http://127.0.0.1:${server.address().port}/`;
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
  await new Promise((ok) => server.close(ok));
});

async function openPage({ locale, clock = '2027-03-15T10:00:00Z' }) {
  const context = await browser.newContext({ locale, viewport: { width: 360, height: 780 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') problems.push(`console ${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('request', (r) => { if (!r.url().startsWith(base)) problems.push(`external request: ${r.url()}`); });
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  await page.clock.setFixedTime(new Date(clock));
  await page.goto(base);
  await page.waitForSelector('h1:not(:empty)');
  return { context, page, problems };
}

async function assertClean(page, problems) {
  const csp = await page.evaluate(() => window.__csp);
  assert.deepEqual(csp, [], 'CSP violations');
  assert.deepEqual(problems, [], 'console errors / external requests');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert.ok(overflow <= 0, `horizontal overflow of ${overflow}px`);
}

async function fillHappyPath(page, woz) {
  await page.check('input[name="canon"][value="boughtOff"]');
  await page.check('input[name="period"][value="fifty"]');
  await page.check('input[name="issuer"][value="municipality"]');
  await page.check('input[name="use"][value="residential"]');
  await page.fill('#woz', woz);
  await page.fill('#endDate', '2040-04-30');
  await page.click('button[type="submit"]');
}

for (const [locale, lang, woz, amount, next, title] of [
  ['nl-NL', 'nl', '400.000', '€ 91.960', '€ 88.520', /^Erfpacht Zaanstad/],
  ['en-GB', 'en', '400,000', '€91,960', '€88,520', /^Zaanstad leasehold/],
]) {
  test(`${lang}: renders, calculates and is clean at 360 px`, async () => {
    const { context, page, problems } = await openPage({ locale });
    assert.equal(await page.getAttribute('html', 'lang'), lang);
    assert.match(await page.title(), title);
    assert.equal(await page.getAttribute(`.lang-btn[data-lang="${lang}"]`, 'aria-pressed'), 'true');
    await fillHappyPath(page, woz);
    const result = page.locator('#result');
    await result.locator('h2').waitFor();
    const text = (await result.innerText()).replace(/ | /g, ' ');
    assert.ok(text.includes(amount), `amount ${amount} in: ${text}`);
    assert.ok(text.includes(next), `range includes ${next}`);
    assert.equal(await result.getAttribute('aria-live'), 'polite');
    await page.click('.how summary');
    if (shotDir) await page.screenshot({ path: `${shotDir}/smoke-${lang}.png`, fullPage: true });
    await assertClean(page, problems);
    await context.close();
  });
}

test('language toggle keeps values, updates lang/title/description/messages, and persists', async () => {
  const { context, page, problems } = await openPage({ locale: 'nl-NL' });
  await fillHappyPath(page, '400.000');
  await page.locator('#result h2').waitFor();
  await page.click('.lang-btn[data-lang="en"]');
  assert.equal(await page.getAttribute('html', 'lang'), 'en');
  assert.match(await page.title(), /^Zaanstad leasehold/);
  assert.match(await page.getAttribute('meta[name="description"]', 'content'), /^Unofficial calculator/);
  assert.equal(await page.inputValue('#woz'), '400.000');
  assert.equal(await page.inputValue('#endDate'), '2040-04-30');
  assert.ok((await page.innerText('#result')).includes('€91,960'));
  assert.match(await page.innerText('#validity'), /1 January 2027/);

  // Validation message switches language too.
  await page.fill('#woz', '400.000.00');
  await page.click('button[type="submit"]');
  assert.match(await page.innerText('#err-woz'), /not clear/);
  await page.click('.lang-btn[data-lang="nl"]');
  assert.match(await page.innerText('#err-woz'), /niet duidelijk/);
  assert.equal(await page.getAttribute('#woz', 'aria-invalid'), 'true');

  // Override persists over the browser language.
  await page.click('.lang-btn[data-lang="en"]');
  await page.reload();
  await page.waitForSelector('h1:not(:empty)');
  assert.equal(await page.getAttribute('html', 'lang'), 'en');
  assert.ok(!page.url().includes('?') && !page.url().includes('#'), 'no values in URL');
  await assertClean(page, problems);
  await context.close();
});

test('unknown browser language falls back to English', async () => {
  const { context, page, problems } = await openPage({ locale: 'de-DE' });
  assert.equal(await page.getAttribute('html', 'lang'), 'en');
  await assertClean(page, problems);
  await context.close();
});

test('no-result path explains why and links the price indication', async () => {
  const { context, page, problems } = await openPage({ locale: 'nl-NL' });
  await page.check('input[name="canon"][value="unknown"]');
  await page.check('input[name="period"][value="fifty"]');
  await page.check('input[name="issuer"][value="municipality"]');
  await page.check('input[name="use"][value="residential"]');
  await page.click('button[type="submit"]');
  const text = await page.innerText('#result');
  assert.match(text, /akte van vestiging/);
  assert.equal(await page.locator('#result a[href*="loket.zaanstad.nl"]').count(), 1);
  assert.doesNotMatch(text, /€/);
  await assertClean(page, problems);
  await context.close();
});

test('before 2027: notice that 2026 parameters apply and are not used', async () => {
  const { context, page, problems } = await openPage({ locale: 'nl-NL', clock: '2026-12-10T10:00:00Z' });
  assert.match(await page.innerText('#validity'), /parameters 2026/);
  await assertClean(page, problems);
  await context.close();
});

test('from 2028: outdated message replaces the result', async () => {
  const { context, page, problems } = await openPage({ locale: 'en-GB', clock: '2028-01-01T00:30:00+01:00' });
  assert.match(await page.innerText('#result'), /outdated/);
  await fillHappyPath(page, '400000');
  const text = await page.innerText('#result');
  assert.match(text, /outdated/);
  assert.doesNotMatch(text, /€/);
  await assertClean(page, problems);
  await context.close();
});

test('security headers are served locally as configured', async () => {
  const res = await fetch(base);
  const csp = res.headers.get('content-security-policy');
  assert.match(csp, /frame-ancestors 'none'/);
  assert.doesNotMatch(csp, /unsafe-inline/);
  assert.ok(res.headers.get('strict-transport-security'));
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
});
