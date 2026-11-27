// Prints, per WOZ value and remaining years, the plot sizes (m2) for which the published table
// is not overridden by the EUR 350..800 per m2 limits. Usage: node tools/limits-analysis.mjs
import { validPlotRange } from '../test/helpers/derived.js';

const wozValues = [250_000, 300_000, 350_000, 400_000, 450_000, 500_000, 600_000, 750_000];
const years = [5, 10, 13, 14, 20, 30, 40, 49];
const pad = (s, n) => String(s).padStart(n);
console.log(`Plot size range (m2) where land value after depreciation is EUR 350..800/m2\n`);
console.log(pad('WOZ \\ years', 12) + years.map((n) => pad(n, 11)).join(''));
for (const woz of wozValues) {
  const cells = years.map((n) => {
    const r = validPlotRange(woz, n);
    return pad(`${Math.ceil(r.minM2)}-${Math.floor(r.maxM2)}`, 11);
  });
  console.log(pad(woz.toLocaleString('nl-NL'), 12) + cells.join(''));
}
