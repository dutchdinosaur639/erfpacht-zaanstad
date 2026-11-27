// Sensitivity checks for the EUR 350..800 per m2 land value limits (Gemeenteblad 2026, 547830, 1f).
// The page cannot apply these limits (plot size is not asked and the residual method is not
// published); these tests document when the table result may be overridden.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validPlotRange } from '../helpers/derived.js';

test('WOZ 400000, 13 years: table holds for plots of about 95..216 m2', () => {
  const r = validPlotRange(400_000, 13);
  assert.equal(r.land.toFixed(0), '75600'); // 400000 x 30% x (1 - 37%)
  assert.equal(r.minM2.toFixed(1), '94.5');
  assert.equal(r.maxM2.toFixed(1), '216.0');
});

test('WOZ 400000, 14 years: lower grondquote (28%) shifts the range down', () => {
  const r = validPlotRange(400_000, 14);
  assert.equal(r.land.toFixed(0), '71680'); // 400000 x 28% x (1 - 36%)
  assert.equal(r.minM2.toFixed(1), '89.6');
  assert.equal(r.maxM2.toFixed(1), '204.8');
});

test('larger plots fall below EUR 350/m2 first as depreciation grows (fewer years left)', () => {
  assert.ok(validPlotRange(400_000, 5).maxM2 < validPlotRange(400_000, 30).maxM2);
});

test('an apartment-sized share (small plot) can exceed EUR 800/m2', () => {
  // WOZ 300000 on 60 m2 of land, 13 years left: 56700 / 60 = 945 per m2 > 800.
  const r = validPlotRange(300_000, 13);
  assert.ok(60 < r.minM2);
});
