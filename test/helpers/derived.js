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

/** Standardised land value after depreciation as a fraction of WOZ, as implied by the 2027 table. */
export function landShareAfterDepreciation2027(n) {
  const bouwjaar = 2027 - (50 - n);
  const q = bouwjaar >= 1991 ? 0.28 : 0.30;
  return q * (1 - Math.min(50 - n, 40) / 100);
}

/**
 * Plot sizes (m2) for which the land value after depreciation stays within EUR 350..800 per m2.
 * Outside this range the municipality calculates the land value residually (method not published).
 */
export function validPlotRange(woz, n, minPerM2 = 350, maxPerM2 = 800) {
  const land = woz * landShareAfterDepreciation2027(n);
  return { land, minM2: land / maxPerM2, maxM2: land / minPerM2 };
}
