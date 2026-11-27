// Year-specific data. A new parameter year is a change to this file only.
// Values are copied from the official publication; do not compute them.
// Percentages are strings with exactly two decimals to avoid floating-point drift.

export default Object.freeze({
  year: 2027,
  validFrom: '2027-01-01',
  validUntil: '2027-12-31',
  verifiedOn: '2026-11-27',

  // Publisher and contact line shown in the footer. Must be set before the
  // production deploy; the pipeline test "publisher is set" enforces this.
  publisher: 'dutchdinosaur639 via github.com/dutchdinosaur639/erfpacht-zaanstad/issues',

  // The table applies only to a buy-off period (afkoopperiode) of this length.
  buyOffPeriodYears: 50,

  // Bijlage 1, Gemeenteblad 2026, 547830: remaining years -> koopsom as % of current WOZ value.
  table: Object.freeze({
    5: '19.41', 6: '19.70', 7: '20.00', 8: '20.30', 9: '20.61',
    10: '20.93', 11: '21.60', 12: '22.28', 13: '22.99', 14: '22.13',
    15: '22.81', 16: '23.51', 17: '24.23', 18: '24.97', 19: '25.72',
    20: '26.49', 21: '27.27', 22: '28.08', 23: '28.90', 24: '29.74',
    25: '30.60', 26: '31.48', 27: '32.38', 28: '33.29', 29: '34.23',
    30: '35.19', 31: '36.17', 32: '37.17', 33: '38.20', 34: '39.25',
    35: '40.32', 36: '41.41', 37: '42.53', 38: '43.67', 39: '44.83',
    40: '46.02', 41: '47.24', 42: '48.49', 43: '49.76', 44: '51.05',
    45: '52.38', 46: '53.74', 47: '55.12', 48: '56.53', 49: '57.98',
  }),

  // Parameters as published (informational on the page; the result uses only the table).
  parameters: Object.freeze({
    grondquote: Object.freeze([
      { from: 1991, to: null, pct: '28' },
      { from: 1981, to: 1990, pct: '30' },
      { from: 1971, to: 1980, pct: '32' },
      { from: 1961, to: 1970, pct: '34' },
      { from: 1931, to: 1960, pct: '35' },
      { from: null, to: 1930, pct: '36' },
    ]),
    depreciationPerStartedYearPct: '1',
    depreciationMaxPct: '40',
    indexationPct: '3.04',
    discountRatePct: '1.5',
    landValueMinPerM2: 350,
    landValueMaxPerM2: 800,
  }),

  sources: Object.freeze({
    publication: {
      label: 'Gemeenteblad 2026, 547830',
      decided: '2026-11-17',
      published: '2026-11-26',
      url: 'https://zoek.officielebekendmakingen.nl/gmb-2026-547830.html',
    },
    table: {
      label: 'Bijlage 1 (exb-2026-40851)',
      url: 'https://repository.officiele-overheidspublicaties.nl/externebijlagen/exb-2026-40851/currentItem',
    },
    municipalPage: {
      label: 'zaanstad.nl: Erfpacht',
      url: 'https://www.zaanstad.nl/direct-regelen/wonen-bouwen-en-omgeving/wonen-en-verhuizen/erfpacht/',
    },
    example2024: {
      label: 'Raadsinformatiebrief parameters 2024',
      url: 'https://zaanstad.bestuurlijkeinformatie.nl/Document/View/9e3efd63-c680-4b07-b18b-c16f10c0e776',
    },
  }),

  links: Object.freeze({
    priceIndication: 'https://loket.zaanstad.nl/mozard/!suite31.scherm0117?mBsb=925',
    wozLoket: 'https://www.wozwaardeloket.nl/',
    bkz: 'https://www.betaalbarekoopwoningen.nl/',
  }),
});
