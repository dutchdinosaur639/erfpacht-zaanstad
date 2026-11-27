import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../../src/data/parameters.js';
import { koopsomEuros, pctToHundredths } from '../../src/js/calc.js';
import { methodKoopsom } from '../helpers/derived.js';

const WOZ = 400_000 * 100;

test('WOZ 400000, n=13 -> 91960', () => assert.equal(koopsomEuros(WOZ, data.table[13]), 91960));
test('WOZ 400000, n=14 -> 88520', () => assert.equal(koopsomEuros(WOZ, data.table[14]), 88520));
test('WOZ 400000, n=30 -> 140760', () => assert.equal(koopsomEuros(WOZ, data.table[30]), 140760));

test('rounding to whole euros is half up and exact', () => {
  assert.equal(koopsomEuros(123_457 * 100, '19.41'), 23963); // 23962.9037
  assert.equal(koopsomEuros(250 * 100, '20.00'), 50);
  assert.equal(koopsomEuros(2_50, '20.00'), 1); // 0.50 -> 1 (half up)
  assert.equal(koopsomEuros(2_49, '20.00'), 0); // 0.498 -> 0
  assert.equal(koopsomEuros(10_000_000 * 100, '57.98'), 5_798_000);
});

test('percentage string conversion', () => {
  assert.equal(pctToHundredths('22.99'), 2299);
  assert.equal(pctToHundredths('20.00'), 2000);
  assert.throws(() => pctToHundredths('22.9'));
});

test('method check with 2024 parameters (2024 council letter example)', () => {
  const r = methodKoopsom({ woz: 440_000, grondquote: 0.30, depreciation: 0.37, indexation: 0.0241, rate: 0.015, n: 13 });
  assert.equal(r.land.toFixed(2), '132000.00');
  assert.equal(r.afterDep.toFixed(2), '83160.00');
  assert.equal(r.future.toFixed(2), '113335.31');
  assert.equal(r.present.toFixed(2), '93391.36');
});
