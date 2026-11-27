import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, parseYears } from '../../src/js/calc.js';

const ok = (s, euros) => test(`parses "${s}" as ${euros}`, () => assert.deepEqual(parseAmount(s), { ok: true, cents: Math.round(euros * 100) }));
const bad = (s, error) => test(`rejects "${s}" (${error})`, () => assert.deepEqual(parseAmount(s), { ok: false, error }));

ok('400000', 400000);
ok('400.000', 400000);
ok('400,000', 400000);
ok('1.250.000', 1250000);
ok('1,250,000', 1250000);
ok('€ 400.000', 400000);
ok('€400,000', 400000);
ok('400.000 €', 400000);
ok('EUR 400000', 400000);
ok('€ 400.000,-', 400000);
ok('400.000,00', 400000);
ok('400,000.00', 400000);
ok('400000,50', 400000.5);
ok('400000.5', 400000.5);
ok(' 400 000 ', 400000);
ok('400 000', 400000);

bad('', 'empty');
bad('   ', 'empty');
bad('€', 'empty');
bad('abc', 'invalid');
bad('400k', 'invalid');
bad('-400000', 'invalid');
bad('4e5', 'invalid');
bad('400.000.00', 'ambiguous');
bad('400,000,00', 'ambiguous');
bad('1.234,567', 'ambiguous');
bad('1,234.567', 'ambiguous');
bad('1.234.5', 'ambiguous');
bad('40.00.000', 'ambiguous');
bad('400.0000', 'ambiguous');
bad('1.000,000.00', 'ambiguous');
bad('.400', 'ambiguous');
bad('400.', 'ambiguous');

test('years parsing', () => {
  assert.deepEqual(parseYears('13'), { ok: true, years: 13 });
  assert.deepEqual(parseYears(' 5 '), { ok: true, years: 5 });
  assert.deepEqual(parseYears(''), { ok: false, error: 'empty' });
  assert.deepEqual(parseYears('13,5'), { ok: false, error: 'notWhole' });
  assert.deepEqual(parseYears('13.5'), { ok: false, error: 'notWhole' });
  assert.deepEqual(parseYears('-3'), { ok: false, error: 'invalid' });
  assert.deepEqual(parseYears('dertien'), { ok: false, error: 'invalid' });
});
