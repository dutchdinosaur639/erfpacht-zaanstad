// Derived method, used ONLY as an integrity check in tests. Not shipped to the browser.
// Not stated in the publication; reconstructed and verified against all 45 table values.

/** Generic method: WOZ * grondquote * (1 - depreciation) * (1 + index)^n / (1 + rate)^n */
export function methodKoopsom({ woz, grondquote, depreciation, indexation, rate, n }) {
  const land = woz * grondquote;
  const afterDep = land * (1 - depreciation);
  const future = afterDep * (1 + indexation) ** n;
  const present = future / (1 + rate) ** n;
  return { land, afterDep, future, present };
}

/** Table percentage for remaining years n under the 2027 parameters, standardised as published. */
export function derivedPct2027(n) {
  const bouwjaar = 2027 - (50 - n);
  const q = bouwjaar >= 1991 ? 0.28 : 0.30;
  const dep = Math.min(50 - n, 40) / 100;
  return q * (1 - dep) * (1.0304 / 1.015) ** n * 100;
}
