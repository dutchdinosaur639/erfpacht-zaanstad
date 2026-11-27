import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../../src/data/parameters.js';
import { validityStatus, amsterdamToday } from '../../src/js/calc.js';

const at = (iso) => validityStatus(new Date(iso), data);

test('before 1 January 2027 (Amsterdam time)', () => {
  assert.equal(at('2026-11-27T10:00:00Z'), 'before');
  assert.equal(at('2026-12-31T22:59:59Z'), 'before'); // 23:59:59 CET
});
test('from 1 January 2027 00:00 Amsterdam', () => {
  assert.equal(at('2026-12-31T23:00:00Z'), 'current');
  assert.equal(at('2027-07-01T12:00:00Z'), 'current');
  assert.equal(at('2027-12-31T22:59:59Z'), 'current');
});
test('from 1 January 2028 00:00 Amsterdam: outdated', () => {
  assert.equal(at('2027-12-31T23:00:00Z'), 'expired');
  assert.equal(at('2031-05-05T12:00:00Z'), 'expired');
});
test('Amsterdam date in summer time', () => {
  assert.deepEqual(amsterdamToday(new Date('2027-06-30T22:30:00Z')), { y: 2027, m: 7, d: 1 });
});
test('validity window matches the parameter year', () => {
  assert.equal(data.validFrom, `${data.year}-01-01`);
  assert.equal(data.validUntil, `${data.year}-12-31`);
});
