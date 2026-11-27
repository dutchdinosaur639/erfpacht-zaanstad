import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseISODate as d, remainingYears, completedYears, addYears, addDays, toISO } from '../../src/js/calc.js';

const rem = (c, e) => remainingYears(d(c), d(e));

test('2024 example: 01-03-2024 to 30-06-2037 -> 13 years, not whole', () => {
  assert.deepEqual(rem('2024-03-01', '2037-06-30'), { years: 13, whole: false, ended: false });
});

test('end date is inclusive: 01-07-2024 to 30-06-2037 is exactly 13 years', () => {
  assert.deepEqual(rem('2024-07-01', '2037-06-30'), { years: 13, whole: true, ended: false });
});

test('one day short of a whole year counts down', () => {
  assert.deepEqual(rem('2027-01-01', '2039-12-30'), { years: 12, whole: false, ended: false });
  assert.deepEqual(rem('2027-01-01', '2039-12-31'), { years: 13, whole: true, ended: false });
  assert.deepEqual(rem('2027-01-01', '2040-01-01'), { years: 13, whole: false, ended: false });
});

test('leap days', () => {
  // End 28-02-2040 (leap year): runs until 29-02-2040, one day past the anniversary.
  assert.deepEqual(rem('2027-02-28', '2040-02-28'), { years: 13, whole: false, ended: false });
  assert.deepEqual(rem('2027-02-28', '2040-02-27'), { years: 13, whole: true, ended: false });
  // End on the leap day itself.
  assert.deepEqual(rem('2027-03-01', '2040-02-29'), { years: 13, whole: true, ended: false });
  assert.deepEqual(rem('2027-02-28', '2040-02-29'), { years: 13, whole: false, ended: false });
  // Start on a leap day: anniversary in a non-leap year is 1 March.
  assert.equal(completedYears(d('2028-02-29'), d('2029-02-28')), 0);
  assert.equal(completedYears(d('2028-02-29'), d('2029-03-01')), 1);
  assert.equal(completedYears(d('2028-02-29'), d('2032-02-29')), 4);
  assert.equal(toISO(addYears(d('2028-02-29'), 1)), '2029-03-01');
  assert.equal(toISO(addDays(d('2040-02-28'), 1)), '2040-02-29');
  assert.equal(toISO(addDays(d('2039-02-28'), 1)), '2039-03-01');
  assert.equal(toISO(addDays(d('2039-12-31'), 1)), '2040-01-01');
});

test('ended periods', () => {
  assert.equal(rem('2027-01-01', '2026-12-31').ended, true);
  assert.equal(rem('2027-06-01', '2027-05-31').ended, true);
  assert.equal(rem('2027-06-01', '2027-06-01').ended, false); // last day is the conversion day
});

test('strict date parsing', () => {
  assert.equal(d('2027-02-29'), null);
  assert.equal(d('2028-02-29')?.d, 29);
  assert.equal(d('2027-13-01'), null);
  assert.equal(d('2027-1-1'), null);
  assert.equal(d(''), null);
  assert.equal(d('01-01-2027'), null);
});
