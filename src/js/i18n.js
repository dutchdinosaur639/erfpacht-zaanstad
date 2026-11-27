// All user-facing strings. Both languages must have identical keys (enforced by a test).
// {name} = variable, [[name]] = link (label from link_<name>, href from the data file).

export const LANGS = ['nl', 'en'];
export const STORAGE_KEY = 'erfpacht-zaanstad-lang';

export const dict = {
  nl: {
    meta_title: 'Erfpacht Zaanstad: koopsom vol eigendom {year} berekenen (onofficieel)',
    meta_description: 'Onofficiële rekenhulp: schat de koopsom om in {year} erfpachtgrond in Zaanstad te kopen als u de canon heeft afgekocht.',
    lang_group_label: 'Taal',
    lang_nl_aria: 'Nederlands (NL)',
    lang_en_aria: 'English (EN)',

    h1: 'Van erfpacht naar vol eigendom in Zaanstad: rekenhulp {year}',
    intro: 'Heeft u de canon van uw erfpacht afgekocht? Dan kunt u hier schatten welke koopsom u in {year} betaalt om de grond te kopen. U krijgt dan vol eigendom. De berekening gaat uit van de WOZ-waarde van uw woning.',

    unofficial_title: 'Onofficiële rekenhulp',
    unofficial_text: 'Deze pagina is gemaakt door een onafhankelijke partij. Zij is niet van de gemeente Zaanstad. Alleen de officiële offerte van de gemeente telt.',

    notBuyoff_title: 'Let op: dit is geen rekenhulp voor het afkopen van de canon',
    notBuyoff_text: 'Veel mensen zeggen "erfpacht afkopen" als zij de canon voor een nieuwe periode vooruit betalen. Daarvoor is deze pagina niet. Hier gaat het alleen om het kopen van de grond: het omzetten van erfpacht naar vol eigendom.',

    validity_before: 'Deze pagina rekent met de parameters {year}. Die gelden vanaf {from}. Tot die datum gelden de parameters {prevYear}. Daarmee rekent deze pagina niet.',
    validity_current: 'Deze pagina rekent met de parameters {year}. Die gelden van {from} tot en met {until}.',
    validity_expired: 'De parameters {year} gelden niet meer. Deze pagina geeft daarom geen bedrag. Kijk op de website van de gemeente voor de actuele parameters.',

    step1_title: 'Stap 1: Geldt de tabel voor u?',
    step1_intro: 'Beantwoord eerst deze vier vragen. U vindt de antwoorden in de akte van vestiging van de erfpacht of in uw koopakte.',

    q_canon: 'Hoe betaalt u de canon?',
    q_canon_help: 'De canon is de vergoeding die u betaalt voor het gebruik van de grond.',
    canon_boughtOff: 'Ik heb de canon afgekocht (in één keer vooruit betaald)',
    canon_periodic: 'Ik betaal de canon per jaar of per half jaar',
    canon_unknown: 'Weet ik niet',

    q_period: 'Voor hoeveel jaar is de canon afgekocht?',
    q_period_help: 'Dit heet de afkoopperiode.',
    period_fifty: '50 jaar',
    period_other: 'Een andere periode, bijvoorbeeld 75 jaar',
    period_unknown: 'Weet ik niet',

    q_issuer: 'Wie heeft de grond in erfpacht uitgegeven?',
    q_issuer_help: 'Meestal is dat de gemeente Zaanstad. Soms is het Betaalbare Koopwoningen Zaanstad (BKZ).',
    issuer_municipality: 'Gemeente Zaanstad',
    issuer_bkz: 'Betaalbare Koopwoningen Zaanstad (BKZ)',
    issuer_unknown: 'Weet ik niet',

    q_use: 'Staat er een woning op de grond?',
    q_use_help: 'De tabel geldt alleen voor grond met een woning.',
    use_residential: 'Ja, een woning',
    use_other: 'Nee, bijvoorbeeld een bedrijfspand',
    use_unknown: 'Weet ik niet',

    apartment_note: 'Woont u in een appartement? Dan kan de grond alleen samen met het hele appartementencomplex worden gekocht.',

    step2_title: 'Stap 2: Vul uw gegevens in',
    woz_label: 'WOZ-waarde van uw woning',
    woz_help: 'Gebruik de WOZ-waarde {year} (waardepeildatum 1 januari {prevYear}). Die staat op de WOZ-beschikking die u begin {year} krijgt, en in het [[wozLoket]]. Heeft u die nog niet? Vul dan de WOZ-waarde {prevYear} in; de uitkomst is dan minder precies. Bijvoorbeeld: 400.000',
    mode_legend: 'Wat weet u van de afkoopperiode?',
    mode_endDate: 'Ik weet de einddatum',
    mode_years: 'Ik weet het aantal jaren dat nog over is',
    endDate_label: 'Einddatum van de afkoopperiode',
    endDate_help: 'Deze datum staat in de akte van vestiging of in uw koopakte.',
    years_label: 'Aantal jaren dat de afkoopperiode nog loopt',
    years_help: 'Alleen hele jaren, op de datum van omzetting.',
    conversion_label: 'Verwachte datum van omzetting',
    conversion_help: 'Een datum in {year}. Weet u het nog niet? Laat dan {yearStart} staan.',
    submit: 'Bereken de koopsom',

    errors_summary: 'Controleer de velden met een foutmelding.',
    err_choose: 'Kies een antwoord.',
    err_wozRequired: 'Vul de WOZ-waarde in.',
    err_wozInvalid: 'Vul alleen een bedrag in cijfers in, bijvoorbeeld 400.000.',
    err_wozAmbiguous: 'Dit bedrag is niet duidelijk. Schrijf het zonder punten en komma\'s, bijvoorbeeld 400000.',
    err_wozRange: 'Vul een WOZ-waarde in tussen {min} en {max}.',
    err_dateRequired: 'Vul een datum in.',
    err_dateInvalid: 'Deze datum bestaat niet. Controleer de datum.',
    err_conversionOutOfYear: 'Kies een datum in {year}. Deze pagina rekent alleen met de parameters {year}.',
    err_yearsRequired: 'Vul het aantal jaren in.',
    err_yearsNotWhole: 'Vul alleen hele jaren in. Weet u de einddatum? Kies dan "Ik weet de einddatum".',
    err_yearsInvalid: 'Vul een heel getal in, bijvoorbeeld 13.',

    result_title: 'Geschatte koopsom',
    result_amount_label: 'Koopsom (hoogste bedrag)',
    result_pct_label: 'Percentage van de WOZ-waarde',
    result_years_label: 'Resterende jaren van de afkoopperiode',
    result_years_value: '{n} jaar',
    result_range: 'Het besluit zegt niet precies hoe de gemeente de resterende jaren telt. Afhankelijk daarvan ligt de koopsom tussen {min} en {max}. Wij tonen het hoogste bedrag, zodat u niet te laag uitkomt.',
    result_outside: 'Voor {list} jaar staat geen percentage in de tabel. Die telling is niet meegenomen.',

    disclaimer_title: 'Alleen een indicatie',
    disclaimer_text: 'Dit bedrag is alleen een indicatie. U kunt er geen rechten aan ontlenen. Alleen de officiële offerte van de gemeente telt.',
    costs_text: 'De kosten koper, zoals de kosten van de notaris, komen er nog bij. De gemeente rekent volgens haar website zelf geen extra kosten. Vraag de notaris naar de bijkomende kosten.',
    next_step: 'Wilt u verder? Vraag een prijsindicatie aan bij de gemeente: [[priceIndication]].',

    how_title: 'Hoe is dit berekend?',
    how_years_endDate: 'Resterende looptijd: van {conversion} tot en met {end}. Wij hebben deze tellingen vergeleken:',
    how_years_direct: 'Resterende jaren: u heeft zelf {n} jaar ingevuld.',
    how_rounding: 'Het besluit zegt niet hoe de gemeente een deel van een jaar telt. In het rekenvoorbeeld van de gemeente uit 2024 tellen alleen hele jaren. Omdat dat niet zeker is, kiezen wij het hoogste bedrag. Let op: een langere looptijd geeft niet altijd een hoger bedrag (bij 13 jaar is het percentage hoger dan bij 14 jaar).',
    scenario_line: '{label}: {n} jaar, {pct}, {amount}',
    scenario_floorInclusive: 'Hele jaren, de einddatum telt mee',
    scenario_floorExclusive: 'Hele jaren, de einddatum telt niet mee',
    scenario_ceil: 'Een deel van een jaar telt als heel jaar',
    scenario_chosen: '(gebruikt)',
    how_table: 'Tabel: in de tabel van de gemeente (parameters {year}) hoort bij {n} jaar het percentage {pct}.',
    how_amount: 'Koopsom: WOZ-waarde {woz} × {pct} = {amount}, afgerond op hele euro\'s.',
    how_params: 'De gemeente heeft de tabel gemaakt met de parameters {year}: grondquote, depreciatie (afschrijving) van 1% per begonnen jaar met een maximum van 40%, waardevast maken met {index}% per jaar en een rekenrente van {rate}%.',
    how_limits: 'Let op: de gemeente kan in uw situatie anders rekenen. Bijvoorbeeld als de grondwaarde lager is dan € {min} of hoger dan € {max} per m². Dat kan deze rekenhulp niet controleren.',

    blocked_title: 'Deze rekenhulp kan voor u geen bedrag geven',
    reason_canonPeriodic: 'U betaalt de canon per jaar of per half jaar. De tabel geldt alleen als de canon is afgekocht.',
    reason_canonUnknown: 'U weet niet of de canon is afgekocht.',
    reason_periodOther: 'De tabel geldt alleen als de canon voor 50 jaar is afgekocht.',
    reason_periodUnknown: 'U weet niet voor hoeveel jaar de canon is afgekocht.',
    reason_issuerBkz: 'De grond is uitgegeven door BKZ. De tabel van de gemeente geldt daar niet voor. Neem contact op met BKZ: [[bkz]].',
    reason_issuerUnknown: 'U weet niet wie de grond in erfpacht heeft uitgegeven.',
    reason_useOther: 'Deze rekenhulp is alleen voor grond met een woning.',
    reason_useUnknown: 'U weet niet of de grond een woonbestemming heeft.',
    reason_periodEnded: 'De einddatum van de afkoopperiode ligt vóór de datum van omzetting.',
    reason_yearsBelowMin: 'De afkoopperiode loopt nog {n} jaar. De tabel begint bij {min} jaar.',
    reason_yearsAboveMax: 'De afkoopperiode loopt nog {n} jaar. De tabel gaat tot en met {max} jaar.',
    blocked_where_to_look: 'Waar vindt u dit? In de akte van vestiging van de erfpacht of in uw koopakte.',
    blocked_next: 'De gemeente kan u wel een vrijblijvende prijsindicatie geven: [[priceIndication]].',

    expired_title: 'De parameters zijn verouderd',

    footer_unofficial: 'Onafhankelijke, onofficiële rekenhulp. Niet van de gemeente Zaanstad.',
    footer_sources_title: 'Bronnen',
    footer_verified: 'Parameterjaar {year}. Bronnen voor het laatst gecontroleerd op {date}.',
    footer_publisher: 'Uitgever en contact: {publisher}',
    footer_privacy: 'Privacy: alles wordt in uw browser berekend. Wij slaan uw gegevens niet op en gebruiken geen cookies of statistieken. Alleen uw taalkeuze wordt in uw browser bewaard.',

    link_wozLoket: 'WOZ-waardeloket',
    link_priceIndication: 'prijsindicatie aanvragen bij de gemeente Zaanstad',
    link_bkz: 'Betaalbare Koopwoningen Zaanstad',
    link_municipalPage: 'pagina Erfpacht op zaanstad.nl',
    link_publication: '{publicationLabel} (besluit parameters {year})',
    link_table: '{tableLabel}: tabel koopsom afkopers {year}',
    link_example2024: 'Raadsinformatiebrief parameters 2024 (rekenvoorbeeld)',
  },

  en: {
    meta_title: 'Zaanstad leasehold: estimate the {year} price for full ownership (unofficial)',
    meta_description: 'Unofficial calculator: estimate the purchase price for buying leasehold land in Zaanstad in {year} if you have bought off the ground rent.',
    lang_group_label: 'Language',
    lang_nl_aria: 'Nederlands (NL)',
    lang_en_aria: 'English (EN)',

    h1: 'From leasehold to full ownership in Zaanstad: {year} calculator',
    intro: 'Have you bought off the ground rent (canon) of your leasehold (erfpacht)? Then you can estimate here the purchase price (koopsom) you pay in {year} to buy the land. You then get full ownership (vol eigendom). The calculation uses the WOZ value (WOZ-waarde) of your home.',

    unofficial_title: 'Unofficial calculator',
    unofficial_text: 'This page is made by an independent party. It is not from Gemeente Zaanstad. Only the official offer from the municipality counts.',

    notBuyoff_title: 'Note: this is not a calculator for buying off the ground rent',
    notBuyoff_text: 'Many people say "erfpacht afkopen" when they pay the ground rent in advance for a new period. This page is not for that. It is only about buying the land: converting leasehold to full ownership.',

    validity_before: 'This page uses the {year} parameters. They apply from {from}. Until then the {prevYear} parameters apply. This page does not calculate with those.',
    validity_current: 'This page uses the {year} parameters. They apply from {from} to {until} inclusive.',
    validity_expired: 'The {year} parameters no longer apply, so this page does not give an amount. See the municipality\'s website for the current parameters.',

    step1_title: 'Step 1: Does the table apply to you?',
    step1_intro: 'First answer these four questions. You can find the answers in the deed establishing the leasehold (akte van vestiging) or in your purchase deed (koopakte).',

    q_canon: 'How do you pay the ground rent?',
    q_canon_help: 'The ground rent is the fee you pay for using the land.',
    canon_boughtOff: 'I have bought it off (paid in advance in one sum)',
    canon_periodic: 'I pay it every year or every six months',
    canon_unknown: 'I don\'t know',

    q_period: 'For how many years was the ground rent bought off?',
    q_period_help: 'This is the buy-off period (afkoopperiode).',
    period_fifty: '50 years',
    period_other: 'Another period, for example 75 years',
    period_unknown: 'I don\'t know',

    q_issuer: 'Who issued the land in leasehold?',
    q_issuer_help: 'Usually Gemeente Zaanstad. Sometimes Betaalbare Koopwoningen Zaanstad (BKZ).',
    issuer_municipality: 'Gemeente Zaanstad',
    issuer_bkz: 'Betaalbare Koopwoningen Zaanstad (BKZ)',
    issuer_unknown: 'I don\'t know',

    q_use: 'Is there a home on the land?',
    q_use_help: 'The table only applies to land with a home on it.',
    use_residential: 'Yes, a home',
    use_other: 'No, for example business premises',
    use_unknown: 'I don\'t know',

    apartment_note: 'Do you live in an apartment? Then the land can only be bought together with the whole apartment complex.',

    step2_title: 'Step 2: Enter your details',
    woz_label: 'WOZ value of your home',
    woz_help: 'Use the {year} WOZ value (valuation date 1 January {prevYear}). It is on the WOZ assessment (WOZ-beschikking) you receive early in {year}, and in the [[wozLoket]]. Not received yet? Enter the {prevYear} WOZ value; the result is then less precise. For example: 400,000',
    mode_legend: 'What do you know about the buy-off period?',
    mode_endDate: 'I know the end date',
    mode_years: 'I know the number of years left',
    endDate_label: 'End date of the buy-off period',
    endDate_help: 'This date is in the deed establishing the leasehold or in your purchase deed.',
    years_label: 'Number of years left in the buy-off period',
    years_help: 'Whole years only, on the conversion date.',
    conversion_label: 'Expected conversion date',
    conversion_help: 'A date in {year}. Not sure yet? Keep {yearStart}.',
    submit: 'Calculate the purchase price',

    errors_summary: 'Please check the fields with an error message.',
    err_choose: 'Choose an answer.',
    err_wozRequired: 'Enter the WOZ value.',
    err_wozInvalid: 'Enter an amount in figures only, for example 400,000.',
    err_wozAmbiguous: 'This amount is not clear. Write it without dots or commas, for example 400000.',
    err_wozRange: 'Enter a WOZ value between {min} and {max}.',
    err_dateRequired: 'Enter a date.',
    err_dateInvalid: 'This date does not exist. Please check it.',
    err_conversionOutOfYear: 'Choose a date in {year}. This page only uses the {year} parameters.',
    err_yearsRequired: 'Enter the number of years.',
    err_yearsNotWhole: 'Enter whole years only. Do you know the end date? Then choose "I know the end date".',
    err_yearsInvalid: 'Enter a whole number, for example 13.',

    result_title: 'Estimated purchase price',
    result_amount_label: 'Purchase price (highest amount)',
    result_pct_label: 'Percentage of the WOZ value',
    result_years_label: 'Years left in the buy-off period',
    result_years_value: '{n} years',
    result_range: 'The decision does not say exactly how the municipality counts the remaining years. Depending on that, the purchase price is between {min} and {max}. We show the highest amount, so that your estimate is not too low.',
    result_outside: 'The table has no percentage for {list} years. That count is not included.',

    disclaimer_title: 'An indication only',
    disclaimer_text: 'This amount is an indication only. No rights can be derived from it. Only the official offer from the municipality counts.',
    costs_text: 'Buyer\'s costs (kosten koper), such as the notary\'s fees, come on top. According to its website, the municipality charges no extra costs itself. Ask your notary about the additional costs.',
    next_step: 'Want to go ahead? Request a price indication from the municipality: [[priceIndication]].',

    how_title: 'How was this calculated?',
    how_years_endDate: 'Remaining period: from {conversion} up to and including {end}. We compared these ways of counting:',
    how_years_direct: 'Years left: you entered {n} years yourself.',
    how_rounding: 'The decision does not say how the municipality counts part of a year. In the municipality\'s 2024 worked example only whole years count. Because this is not certain, we use the highest amount. Note: a longer period does not always give a higher amount (the percentage for 13 years is higher than for 14).',
    scenario_line: '{label}: {n} years, {pct}, {amount}',
    scenario_floorInclusive: 'Whole years, the end date counts',
    scenario_floorExclusive: 'Whole years, the end date does not count',
    scenario_ceil: 'Part of a year counts as a whole year',
    scenario_chosen: '(used)',
    how_table: 'Table: in the municipality\'s table ({year} parameters), {n} years corresponds to {pct}.',
    how_amount: 'Purchase price: WOZ value {woz} × {pct} = {amount}, rounded to whole euros.',
    how_params: 'The municipality made the table with the {year} parameters: land share (grondquote), depreciation of 1% per started year up to 40%, indexation of {index}% per year and a discount rate of {rate}%.',
    how_limits: 'Note: the municipality may calculate differently in your case, for example if the land value is below €{min} or above €{max} per m². This calculator cannot check that.',

    blocked_title: 'This calculator cannot give you an amount',
    reason_canonPeriodic: 'You pay the ground rent every year or every six months. The table only applies if the ground rent was bought off.',
    reason_canonUnknown: 'You do not know whether the ground rent was bought off.',
    reason_periodOther: 'The table only applies if the ground rent was bought off for 50 years.',
    reason_periodUnknown: 'You do not know for how many years the ground rent was bought off.',
    reason_issuerBkz: 'The land was issued by BKZ. The municipality\'s table does not apply. Contact BKZ: [[bkz]].',
    reason_issuerUnknown: 'You do not know who issued the land in leasehold.',
    reason_useOther: 'This calculator is only for land with a home on it.',
    reason_useUnknown: 'You do not know whether the land has a residential use.',
    reason_periodEnded: 'The end date of the buy-off period is before the conversion date.',
    reason_yearsBelowMin: '{n} years of the buy-off period are left. The table starts at {min} years.',
    reason_yearsAboveMax: '{n} years of the buy-off period are left. The table goes up to {max} years.',
    blocked_where_to_look: 'Where to find this: in the deed establishing the leasehold (akte van vestiging) or in your purchase deed (koopakte).',
    blocked_next: 'The municipality can give you a free, non-binding price indication: [[priceIndication]].',

    expired_title: 'The parameters are outdated',

    footer_unofficial: 'Independent, unofficial calculator. Not from Gemeente Zaanstad.',
    footer_sources_title: 'Sources',
    footer_verified: 'Parameter year {year}. Sources last verified on {date}.',
    footer_publisher: 'Publisher and contact: {publisher}',
    footer_privacy: 'Privacy: everything is calculated in your browser. We do not store your data and use no cookies or analytics. Only your language choice is kept in your browser.',

    link_wozLoket: 'WOZ-waardeloket',
    link_priceIndication: 'request a price indication from Gemeente Zaanstad',
    link_bkz: 'Betaalbare Koopwoningen Zaanstad',
    link_municipalPage: 'Erfpacht page on zaanstad.nl',
    link_publication: '{publicationLabel} ({year} parameters decision)',
    link_table: '{tableLabel}: {year} purchase price table for buy-off holders',
    link_example2024: '2024 council information letter (worked example)',
  },
};

/** First entry of navigator.languages starting with "nl" or "en" wins; otherwise English. */
export function detectLanguage(languages) {
  for (const l of languages ?? []) {
    const s = String(l).toLowerCase();
    if (s.startsWith('nl')) return 'nl';
    if (s.startsWith('en')) return 'en';
  }
  return 'en';
}

export function readStoredLanguage(storage) {
  try {
    const v = storage?.getItem(STORAGE_KEY);
    return LANGS.includes(v) ? v : null;
  } catch {
    return null;
  }
}

export function writeStoredLanguage(storage, lang) {
  try {
    storage?.setItem(STORAGE_KEY, lang);
    return true;
  } catch {
    return false;
  }
}

/** Stored override wins over the browser preference. */
export function resolveLanguage(storage, languages) {
  return readStoredLanguage(storage) ?? detectLanguage(languages);
}

export function t(lang, key, vars = {}) {
  const s = dict[lang]?.[key];
  if (s === undefined) throw new Error(`Missing string ${lang}.${key}`);
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function locale(lang) {
  return lang === 'nl' ? 'nl-NL' : 'en-GB';
}

export function formatEuro(lang, euros) {
  return new Intl.NumberFormat(locale(lang), {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(euros);
}

export function formatEuroCents(lang, cents) {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat(locale(lang), {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
}

/** '22.99' -> '22,99%' (nl) or '22.99%' (en), without float conversion. */
export function formatPct(lang, pct) {
  return `${lang === 'nl' ? pct.replace('.', ',') : pct}%`;
}

export function formatDate(lang, iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(locale(lang), {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
