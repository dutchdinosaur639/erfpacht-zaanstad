import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../../src/data/parameters.js';
import { evaluate } from '../../src/js/calc.js';

const NOW = new Date('2027-03-15T12:00:00Z');
const base = {
  canon: 'boughtOff', period: 'fifty', issuer: 'municipality', use: 'residential',
  woz: '400.000', mode: 'years', years: '13', endDate: '', conversionDate: '2027-01-01',
};
const run = (over, now = NOW) => evaluate({ ...base, ...over }, data, now);

test('happy path with years: single scenario', () => {
  const r = run({});
  assert.equal(r.kind, 'result');
  assert.equal(r.n, 13);
  assert.equal(r.pct, '22.99');
  assert.equal(r.amount, 91960);
  assert.deepEqual(r.scenarios.map((s) => s.n), [13]);
  assert.equal(r.min, r.max);
});

test('whole period by end date: inclusive vs exclusive counting, highest amount wins', () => {
  // 01-01-2027 up to and including 31-12-2056 = 30 whole years; exclusive counting gives 29.
  const r = run({ mode: 'endDate', endDate: '2056-12-31' });
  assert.equal(r.kind, 'result');
  assert.deepEqual(r.scenarios.map((s) => [s.basis, s.n, s.amount]), [
    ['floorExclusive', 29, 136920], ['floorInclusive', 30, 140760],
  ]);
  assert.equal(r.n, 30);
  assert.equal(r.amount, 140760);
  assert.equal(r.basis, 'floorInclusive');
  assert.equal(r.whole, true);
});

test('fractional period 13.3 years: 13 beats 14 because of the published drop', () => {
  const r = run({ mode: 'endDate', endDate: '2040-04-30' });
  assert.deepEqual(r.scenarios.map((s) => [s.n, s.amount]), [[13, 91960], [14, 88520]]);
  assert.equal(r.n, 13);
  assert.equal(r.amount, 91960);
  assert.equal(r.min, 88520);
  assert.equal(r.max, 91960);
});

test('fractional period 20.5 years: rounding up gives the highest amount', () => {
  const r = run({ mode: 'endDate', endDate: '2047-06-30' });
  assert.deepEqual(r.scenarios.map((s) => [s.n, s.pct]), [[20, '26.49'], [21, '27.27']]);
  assert.equal(r.n, 21);
  assert.equal(r.basis, 'ceil');
  assert.equal(r.amount, 109080);
});

test('fractional at 49.x: 50 is not in the table and is reported as outside', () => {
  const r = run({ mode: 'endDate', endDate: '2076-06-30' });
  assert.equal(r.n, 49);
  assert.deepEqual(r.outside, [50]);
  assert.deepEqual(r.scenarios.map((s) => s.n), [49]);
});

test('exactly 5 years by end date: exclusive count 4 is outside the table, 5 is used', () => {
  const r = run({ mode: 'endDate', endDate: '2031-12-31' });
  assert.equal(r.kind, 'result');
  assert.equal(r.n, 5);
  assert.deepEqual(r.outside, [4]);
});

for (const [n, kind, reason] of [[4, 'blocked', 'yearsBelowMin'], [5, 'result'], [49, 'result'], [50, 'blocked', 'yearsAboveMax'], [0, 'blocked', 'yearsBelowMin']]) {
  test(`boundary n=${n} (years input) -> ${kind}`, () => {
    const r = run({ years: String(n) });
    assert.equal(r.kind, kind);
    if (reason) assert.deepEqual(r.reasons, [reason]);
    else assert.equal(r.n, n);
  });
}

for (const [end, n, kind] of [['2031-12-31', 5, 'result'], ['2032-01-01', 5, 'result'], ['2031-12-30', 4, 'blocked'], ['2075-12-31', 49, 'result'], ['2076-12-31', 50, 'blocked'], ['2076-12-30', 49, 'result']]) {
  test(`boundary via end date ${end} -> n=${n} ${kind}`, () => {
    const r = run({ mode: 'endDate', endDate: end });
    assert.equal(r.kind, kind);
    if (kind === 'blocked') assert.equal(r.n, n);
    else assert.ok(r.scenarios.some((s) => s.basis === 'floorInclusive' && s.n === n));
  });
}

test('4.9 years remaining gives no amount (no rounding up into the table)', () => {
  const r = run({ mode: 'endDate', endDate: '2031-12-01' });
  assert.equal(r.kind, 'blocked');
  assert.deepEqual(r.reasons, ['yearsBelowMin']);
});

test('period already ended', () => {
  const r = run({ mode: 'endDate', endDate: '2026-12-31' });
  assert.deepEqual(r, { kind: 'blocked', reasons: ['periodEnded'] });
});

const paths = [
  ['canon', 'periodic', 'canonPeriodic'], ['canon', 'unknown', 'canonUnknown'],
  ['period', 'other', 'periodOther'], ['period', 'unknown', 'periodUnknown'],
  ['issuer', 'bkz', 'issuerBkz'], ['issuer', 'unknown', 'issuerUnknown'],
  ['use', 'other', 'useOther'], ['use', 'unknown', 'useUnknown'],
];
for (const [field, value, reason] of paths) {
  test(`no result: ${field}=${value} -> ${reason}`, () => {
    assert.deepEqual(run({ [field]: value }), { kind: 'blocked', reasons: [reason] });
  });
}

test('several blocking reasons are all reported, before input validation', () => {
  const r = run({ canon: 'periodic', issuer: 'bkz', woz: '' });
  assert.deepEqual(r, { kind: 'blocked', reasons: ['canonPeriodic', 'issuerBkz'] });
});

test('unanswered eligibility questions are validation errors', () => {
  const r = run({ canon: null, use: null });
  assert.deepEqual(r, { kind: 'invalid', errors: { canon: 'choose', use: 'choose' } });
});

const invalid = [
  [{ woz: '' }, 'woz', 'wozRequired'],
  [{ woz: 'veel' }, 'woz', 'wozInvalid'],
  [{ woz: '400.000.00' }, 'woz', 'wozAmbiguous'],
  [{ woz: '9.999' }, 'woz', 'wozRange'],
  [{ woz: '10.000.001' }, 'woz', 'wozRange'],
  [{ conversionDate: '' }, 'conversionDate', 'dateRequired'],
  [{ conversionDate: '2027-02-30' }, 'conversionDate', 'dateInvalid'],
  [{ conversionDate: '2026-12-31' }, 'conversionDate', 'conversionOutOfYear'],
  [{ conversionDate: '2028-01-01' }, 'conversionDate', 'conversionOutOfYear'],
  [{ years: '' }, 'years', 'yearsRequired'],
  [{ years: '13,5' }, 'years', 'yearsNotWhole'],
  [{ years: 'x' }, 'years', 'yearsInvalid'],
  [{ mode: 'endDate', endDate: '' }, 'endDate', 'dateRequired'],
  [{ mode: 'endDate', endDate: '2041-02-29' }, 'endDate', 'dateInvalid'],
  [{ mode: null }, 'mode', 'choose'],
];
for (const [over, field, code] of invalid) {
  test(`validation ${JSON.stringify(over)} -> ${field}:${code}`, () => {
    const r = run(over);
    assert.equal(r.kind, 'invalid');
    assert.equal(r.errors[field], code);
  });
}

test('WOZ range bounds are inclusive', () => {
  assert.equal(run({ woz: '10.000' }).kind, 'result');
  assert.equal(run({ woz: '10.000.000' }).kind, 'result');
});

test('conversion date anywhere in 2027 is accepted', () => {
  assert.equal(run({ conversionDate: '2027-12-31' }).kind, 'result');
});

test('from 1 January 2028 (Amsterdam) no amount is returned', () => {
  assert.deepEqual(run({}, new Date('2027-12-31T23:00:00Z')), { kind: 'expired' });
  assert.equal(run({}, new Date('2027-12-31T22:59:59Z')).kind, 'result');
});

test('before 2027 the 2027 calculation is still available (with a notice)', () => {
  assert.equal(run({}, new Date('2026-11-27T10:00:00Z')).kind, 'result');
});
