// Pure calculation and validation logic. No DOM access; fully unit-tested.

export const WOZ_MIN_EUR = 10_000;
export const WOZ_MAX_EUR = 10_000_000;

// ---------- Number parsing ----------

const SPACES = /[\s   ]/g;

/**
 * Parse a euro amount written in Dutch or English notation.
 * Accepts: 400000, 400.000, 400,000, 400.000,00, 400,000.00, 400000,50, € 400.000,-
 * Rejects anything whose meaning is not certain (mixed or misplaced separators).
 * @returns {{ok: true, cents: number} | {ok: false, error: 'empty'|'invalid'|'ambiguous'}}
 */
export function parseAmount(raw) {
  let s = String(raw ?? '').replace(SPACES, '');
  if (s === '') return { ok: false, error: 'empty' };
  s = s.replace(/^(€|eur)/i, '').replace(/(€|eur)$/i, '');
  s = s.replace(/[,.]-{1,2}$/, '');
  if (s === '') return { ok: false, error: 'empty' };
  if (/[^0-9.,]/.test(s)) return { ok: false, error: 'invalid' };

  let intPart;
  let decPart = '';
  let m;
  if (/^\d+$/.test(s)) {
    intPart = s;
  } else if ((m = s.match(/^(\d{1,3}(?:\.\d{3})+)$/)) || (m = s.match(/^(\d{1,3}(?:,\d{3})+)$/))) {
    // One kind of separator in groups of three: thousands separator.
    intPart = m[1].replace(/[.,]/g, '');
  } else if ((m = s.match(/^(\d{1,3}(?:\.\d{3})+|\d+),(\d{1,2})$/))) {
    intPart = m[1].replace(/\./g, '');
    decPart = m[2];
  } else if ((m = s.match(/^(\d{1,3}(?:,\d{3})+|\d+)\.(\d{1,2})$/))) {
    intPart = m[1].replace(/,/g, '');
    decPart = m[2];
  } else {
    return { ok: false, error: 'ambiguous' };
  }
  if (intPart.length > 12) return { ok: false, error: 'invalid' };
  const cents = Number(intPart) * 100 + Number(decPart.padEnd(2, '0') || '0');
  return { ok: true, cents };
}

/** Parse a whole number of years. */
export function parseYears(raw) {
  const s = String(raw ?? '').replace(SPACES, '');
  if (s === '') return { ok: false, error: 'empty' };
  if (/^\d{1,3}$/.test(s)) return { ok: true, years: Number(s) };
  if (/^\d+[.,]\d+$/.test(s)) return { ok: false, error: 'notWhole' };
  return { ok: false, error: 'invalid' };
}

// ---------- Dates (calendar dates as 'YYYY-MM-DD', no time zones) ----------

export function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(y, m) {
  return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

/** Strict 'YYYY-MM-DD' parser. Returns {y, m, d} or null. */
export function parseISODate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s ?? ''));
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (y < 1800 || y > 2200 || mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo)) return null;
  return { y, m: mo, d };
}

export function toISO({ y, m, d }) {
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function cmp(a, b) {
  return a.y - b.y || a.m - b.m || a.d - b.d;
}

export function addDays(date, days) {
  const t = Date.UTC(date.y, date.m - 1, date.d) + days * 86_400_000;
  const dt = new Date(t);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

/** Anniversary k years after `date`. 29 February maps to 1 March in non-leap years. */
export function addYears(date, k) {
  const y = date.y + k;
  if (date.m === 2 && date.d === 29 && !isLeapYear(y)) return { y, m: 3, d: 1 };
  return { y, m: date.m, d: date.d };
}

/** Number of whole years completed from `from` up to (not including) `toExclusive`. */
export function completedYears(from, toExclusive) {
  if (cmp(toExclusive, from) <= 0) return 0;
  let n = toExclusive.y - from.y;
  while (n > 0 && cmp(addYears(from, n), toExclusive) > 0) n -= 1;
  return n;
}

/**
 * Remaining whole years of the buy-off period at the conversion date.
 * The end date is the last day of the period (inclusive): a 50-year period that
 * started 01-07-1987 ends 30-06-2037, and 13 whole years remain on 01-07-2024.
 */
export function remainingYears(conversion, endInclusive) {
  const endExclusive = addDays(endInclusive, 1);
  if (cmp(endExclusive, conversion) <= 0) return { years: 0, whole: true, ended: true };
  const years = completedYears(conversion, endExclusive);
  const whole = cmp(addYears(conversion, years), endExclusive) === 0;
  return { years, whole, ended: false };
}

// ---------- Validity of the parameter year ----------

/** Today's calendar date in Europe/Amsterdam as {y, m, d}. */
export function amsterdamToday(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
  return parseISODate(parts);
}

/** 'before' | 'current' | 'expired' */
export function validityStatus(now, data) {
  const today = amsterdamToday(now);
  if (cmp(today, parseISODate(data.validFrom)) < 0) return 'before';
  if (cmp(today, parseISODate(data.validUntil)) > 0) return 'expired';
  return 'current';
}

// ---------- Table lookup and amount ----------

export function lookupPct(data, n) {
  return Object.hasOwn(data.table, n) ? data.table[n] : null;
}

/** '22.99' -> 2299 (hundredths of a percent), using string arithmetic only. */
export function pctToHundredths(pct) {
  const m = /^(\d+)\.(\d{2})$/.exec(pct);
  if (!m) throw new Error(`Invalid percentage ${pct}`);
  return Number(m[1]) * 100 + Number(m[2]);
}

/** Koopsom in whole euros, rounded half up. Exact integer arithmetic. */
export function koopsomEuros(wozCents, pct) {
  const product = wozCents * pctToHundredths(pct); // cents * hundredths of a percent
  return Math.floor((product + 500_000) / 1_000_000);
}

// ---------- Full evaluation ----------

const ELIGIBILITY = {
  canon: { ok: 'boughtOff', block: { periodic: 'canonPeriodic', unknown: 'canonUnknown' } },
  period: { ok: 'fifty', block: { other: 'periodOther', unknown: 'periodUnknown' } },
  issuer: { ok: 'municipality', block: { bkz: 'issuerBkz', unknown: 'issuerUnknown' } },
  use: { ok: 'residential', block: { other: 'useOther', unknown: 'useUnknown' } },
};

/**
 * @param input {canon, period, issuer, use, woz, mode: 'endDate'|'years', endDate, years, conversionDate}
 * @param data  year data (parameters.js)
 * @param now   Date (injected clock)
 */
export function evaluate(input, data, now) {
  if (validityStatus(now, data) === 'expired') return { kind: 'expired' };

  const errors = {};
  const reasons = [];
  for (const [field, rule] of Object.entries(ELIGIBILITY)) {
    const v = input[field];
    if (v === rule.ok) continue;
    if (Object.hasOwn(rule.block, v)) reasons.push(rule.block[v]);
    else errors[field] = 'choose';
  }
  if (Object.keys(errors).length) return { kind: 'invalid', errors };
  if (reasons.length) return { kind: 'blocked', reasons };

  const woz = parseAmount(input.woz);
  if (!woz.ok) errors.woz = { empty: 'wozRequired', invalid: 'wozInvalid', ambiguous: 'wozAmbiguous' }[woz.error];
  else if (woz.cents < WOZ_MIN_EUR * 100 || woz.cents > WOZ_MAX_EUR * 100) errors.woz = 'wozRange';

  const yearStart = parseISODate(`${data.year}-01-01`);
  const yearEnd = parseISODate(`${data.year}-12-31`);
  const conversion = parseISODate(input.conversionDate);
  if (!input.conversionDate) errors.conversionDate = 'dateRequired';
  else if (!conversion) errors.conversionDate = 'dateInvalid';
  else if (cmp(conversion, yearStart) < 0 || cmp(conversion, yearEnd) > 0) errors.conversionDate = 'conversionOutOfYear';

  let end = null;
  let yearsInput = null;
  if (input.mode === 'years') {
    const y = parseYears(input.years);
    if (!y.ok) errors.years = { empty: 'yearsRequired', notWhole: 'yearsNotWhole', invalid: 'yearsInvalid' }[y.error];
    else yearsInput = y.years;
  } else if (input.mode === 'endDate') {
    end = parseISODate(input.endDate);
    if (!input.endDate) errors.endDate = 'dateRequired';
    else if (!end) errors.endDate = 'dateInvalid';
  } else {
    errors.mode = 'choose';
  }
  if (Object.keys(errors).length) return { kind: 'invalid', errors };

  let n;
  let whole = true;
  if (input.mode === 'years') {
    n = yearsInput;
  } else {
    const r = remainingYears(conversion, end);
    if (r.ended) return { kind: 'blocked', reasons: ['periodEnded'] };
    n = r.years;
    whole = r.whole;
  }

  const minN = Math.min(...Object.keys(data.table).map(Number));
  const maxN = Math.max(...Object.keys(data.table).map(Number));
  if (n < minN) return { kind: 'blocked', reasons: ['yearsBelowMin'], n, minN, maxN };
  if (n > maxN) return { kind: 'blocked', reasons: ['yearsAboveMax'], n, minN, maxN };

  const pct = lookupPct(data, n);
  const result = {
    kind: 'result',
    mode: input.mode,
    n,
    whole,
    pct,
    amount: koopsomEuros(woz.cents, pct),
    wozCents: woz.cents,
    conversionDate: toISO(conversion),
    endDate: end ? toISO(end) : null,
    next: null,
  };
  if (!whole) {
    const nextPct = lookupPct(data, n + 1);
    result.next = nextPct
      ? { n: n + 1, pct: nextPct, amount: koopsomEuros(woz.cents, nextPct) }
      : { n: n + 1, pct: null, amount: null };
  }
  return result;
}
