import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../../src/data/parameters.js';
import { lookupPct } from '../../src/js/calc.js';
import { derivedPct2027 } from '../helpers/derived.js';

// Independent copy transcribed from Bijlage 1 (exb-2026-40851), verified 2026-11-27.
const BIJLAGE_1 = {
  5: '19.41', 6: '19.70', 7: '20.00', 8: '20.30', 9: '20.61', 10: '20.93', 11: '21.60', 12: '22.28',
  13: '22.99', 14: '22.13', 15: '22.81', 16: '23.51', 17: '24.23', 18: '24.97', 19: '25.72', 20: '26.49',
  21: '27.27', 22: '28.08', 23: '28.90', 24: '29.74', 25: '30.60', 26: '31.48', 27: '32.38', 28: '33.29',
  29: '34.23', 30: '35.19', 31: '36.17', 32: '37.17', 33: '38.20', 34: '39.25', 35: '40.32', 36: '41.41',
  37: '42.53', 38: '43.67', 39: '44.83', 40: '46.02', 41: '47.24', 42: '48.49', 43: '49.76', 44: '51.05',
  45: '52.38', 46: '53.74', 47: '55.12', 48: '56.53', 49: '57.98',
};

test('table has exactly the keys 5..49', () => {
  const keys = Object.keys(data.table).map(Number).sort((a, b) => a - b);
  assert.deepEqual(keys, Array.from({ length: 45 }, (_, i) => i + 5));
});

for (let n = 5; n <= 49; n++) {
  test(`lookup n=${n} equals Bijlage 1 (${BIJLAGE_1[n]}%)`, () => {
    assert.equal(lookupPct(data, n), BIJLAGE_1[n]);
  });
  test(`derived formula n=${n} matches the table to 2 decimals`, () => {
    assert.equal(derivedPct2027(n).toFixed(2), data.table[n]);
  });
}

test('published drop from n=13 to n=14 is kept as published', () => {
  assert.equal(data.table[13], '22.99');
  assert.equal(data.table[14], '22.13');
});

test('no lookup outside the table', () => {
  for (const n of [-1, 0, 4, 50, 51, 13.5]) assert.equal(lookupPct(data, n), null);
});

test('every percentage has exactly two decimals', () => {
  for (const v of Object.values(data.table)) assert.match(v, /^\d{2}\.\d{2}$/);
});
