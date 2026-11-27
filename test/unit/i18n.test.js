import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import data from '../../src/data/parameters.js';
import {
  dict, detectLanguage, resolveLanguage, readStoredLanguage, writeStoredLanguage, STORAGE_KEY,
  t, formatEuro, formatPct, formatDate,
} from '../../src/js/i18n.js';

const placeholders = (s) => [...s.matchAll(/\{(\w+)\}|\[\[(\w+)\]\]/g)].map((m) => m[0]).sort();

test('both languages have identical keys', () => {
  assert.deepEqual(Object.keys(dict.nl).sort(), Object.keys(dict.en).sort());
});

test('each key has the same placeholders and links in both languages', () => {
  for (const k of Object.keys(dict.nl)) assert.deepEqual(placeholders(dict.nl[k]), placeholders(dict.en[k]), k);
});

test('no empty strings', () => {
  for (const l of ['nl', 'en']) for (const [k, v] of Object.entries(dict[l])) assert.ok(v.trim(), `${l}.${k}`);
});

test('every link token and data-i18n key used has a string', () => {
  const html = readFileSync(new URL('../../src/index.html', import.meta.url), 'utf8');
  const keys = [...html.matchAll(/data-i18n="(\w+)"/g)].map((m) => m[1]);
  const linkKeys = [...html.matchAll(/data-i18n-link="(\w+)"/g)].map((m) => `link_${m[1]}`);
  const tokens = Object.values(dict.nl).flatMap((s) => [...s.matchAll(/\[\[(\w+)\]\]/g)].map((m) => `link_${m[1]}`));
  for (const k of [...keys, ...linkKeys, ...tokens]) assert.ok(k in dict.nl, k);
});

test('every reason and error code produced by calc.js has a string', () => {
  const src = readFileSync(new URL('../../src/js/calc.js', import.meta.url), 'utf8');
  const reasons = ['canonPeriodic', 'canonUnknown', 'periodOther', 'periodUnknown', 'issuerBkz', 'issuerUnknown',
    'useOther', 'useUnknown', 'periodEnded', 'yearsBelowMin', 'yearsAboveMax'];
  for (const r of reasons) { assert.ok(src.includes(`'${r}'`), r); assert.ok(`reason_${r}` in dict.nl, r); }
  const errors = ['choose', 'wozRequired', 'wozInvalid', 'wozAmbiguous', 'wozRange', 'dateRequired', 'dateInvalid',
    'conversionOutOfYear', 'yearsRequired', 'yearsNotWhole', 'yearsInvalid'];
  for (const e of errors) { assert.ok(src.includes(`'${e}'`), e); assert.ok(`err_${e}` in dict.nl, e); }
});

test('official Dutch terms are used', () => {
  const all = Object.values(dict.nl).join(' ');
  for (const term of ['erfpacht', 'canon', 'koopsom', 'afkoopperiode', 'WOZ-waarde', 'vol eigendom']) assert.ok(all.includes(term), term);
});

test('English shows the Dutch term in brackets at first use', () => {
  const intro = dict.en.intro;
  for (const term of ['(canon)', '(erfpacht)', '(koopsom)', '(vol eigendom)', '(WOZ-waarde)']) assert.ok(intro.includes(term), term);
  assert.ok(dict.en.q_period_help.includes('(afkoopperiode)'));
});

test('language detection: first nl/en entry wins, otherwise English', () => {
  assert.equal(detectLanguage(['nl-NL', 'en']), 'nl');
  assert.equal(detectLanguage(['en-GB', 'nl']), 'en');
  assert.equal(detectLanguage(['de-DE', 'fr', 'NL-be', 'en']), 'nl');
  assert.equal(detectLanguage(['de-DE', 'en-US', 'nl']), 'en');
  assert.equal(detectLanguage(['de-DE', 'fr-FR']), 'en');
  assert.equal(detectLanguage([]), 'en');
  assert.equal(detectLanguage(undefined), 'en');
});

function memoryStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
}
const throwing = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };

test('stored override wins over the browser', () => {
  assert.equal(resolveLanguage(memoryStorage({ [STORAGE_KEY]: 'en' }), ['nl-NL']), 'en');
  assert.equal(resolveLanguage(memoryStorage({ [STORAGE_KEY]: 'nl' }), ['en-US']), 'nl');
});

test('invalid stored value is ignored', () => {
  assert.equal(resolveLanguage(memoryStorage({ [STORAGE_KEY]: 'de' }), ['nl']), 'nl');
});

test('storage failures fall back to the browser and never throw', () => {
  assert.equal(readStoredLanguage(throwing), null);
  assert.equal(writeStoredLanguage(throwing, 'nl'), false);
  assert.equal(resolveLanguage(throwing, ['nl-NL']), 'nl');
  assert.equal(resolveLanguage(null, ['fr']), 'en');
});

test('writing the override persists it', () => {
  const s = memoryStorage();
  assert.equal(writeStoredLanguage(s, 'nl'), true);
  assert.equal(readStoredLanguage(s), 'nl');
});

test('formatting per language', () => {
  assert.equal(formatEuro('nl', 91960).replace(/\s/g, ' '), '€ 91.960');
  assert.equal(formatEuro('en', 91960), '€91,960');
  assert.equal(formatPct('nl', '22.99'), '22,99%');
  assert.equal(formatPct('en', '22.99'), '22.99%');
  assert.equal(formatDate('nl', '2027-01-01'), '1 januari 2027');
  assert.equal(formatDate('en', '2027-01-01'), '1 January 2027');
});

test('templating', () => {
  assert.equal(t('nl', 'result_years_value', { n: 13 }), '13 jaar');
  assert.throws(() => t('nl', 'does_not_exist'));
});

test('publisher is set (enforced for production deploys)', { skip: process.env.REQUIRE_PUBLISHER !== '1' }, () => {
  assert.ok(!/PUBLISHER_NAME_AND_CONTACT/.test(data.publisher));
  assert.ok(data.publisher.trim().length > 3);
});

test('no parameter year is hard-coded outside the data file (a new year is a data change)', () => {
  const files = ['../../src/js/i18n.js', '../../src/js/app.js', '../../src/js/calc.js', '../../src/index.html'];
  for (const f of files) {
    const src = readFileSync(new URL(f, import.meta.url), 'utf8')
      .replace(/example2024/g, '')
      .replace(/^\s*(\/\/|\*).*$/gm, '') // comments may cite dated examples
      .replace(/(uit|municipality\\?'s) 2024/g, '')
      .replace(/(parameters 2024|2024 council)/g, '');
    assert.doesNotMatch(src, /\b20[2-9]\d\b/, f);
  }
});
