// DOM wiring. All logic lives in calc.js; all strings in i18n.js; all year data in parameters.js.
import data from '../data/parameters.js';
import { evaluate, validityStatus, WOZ_MIN_EUR, WOZ_MAX_EUR } from './calc.js';
import {
  t, resolveLanguage, writeStoredLanguage, formatEuro, formatEuroCents, formatPct, formatDate,
} from './i18n.js';

const LINKS = {
  wozLoket: data.links.wozLoket,
  priceIndication: data.links.priceIndication,
  bkz: data.links.bkz,
  municipalPage: data.sources.municipalPage.url,
  publication: data.sources.publication.url,
  table: data.sources.table.url,
  example2024: data.sources.example2024.url,
};

function safeStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// Clock can be overridden by tests via Playwright's clock API; no URL parameters are read.
const now = () => new Date();

let lang = resolveLanguage(safeStorage(), navigator.languages);
let lastOutcome = null;

const $ = (sel) => document.querySelector(sel);

/** Variables available to every string, so a new parameter year needs no string changes. */
function globals() {
  return {
    year: data.year,
    prevYear: data.year - 1,
    yearStart: formatDate(lang, data.validFrom),
    publicationLabel: data.sources.publication.label,
    tableLabel: data.sources.table.label,
  };
}

/** Translate in the current language with the global variables. */
const tr = (key, vars = {}) => t(lang, key, { ...globals(), ...vars });

function link(name) {
  const a = document.createElement('a');
  a.href = LINKS[name];
  a.textContent = tr(`link_${name}`);
  return a;
}

/** Render a template with [[link]] tokens into `el`, using text nodes only (no innerHTML). */
function renderInto(el, text) {
  el.replaceChildren();
  for (const part of text.split(/(\[\[\w+\]\])/)) {
    const m = /^\[\[(\w+)\]\]$/.exec(part);
    el.append(m ? link(m[1]) : document.createTextNode(part));
  }
  return el;
}

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) renderInto(e, text);
  return e;
}

function applyStaticStrings() {
  document.documentElement.lang = lang;
  document.title = tr('meta_title');
  document.querySelector('meta[name="description"]').setAttribute('content', tr('meta_description'));

  for (const node of document.querySelectorAll('[data-i18n]')) renderInto(node, tr(node.dataset.i18n));
  for (const node of document.querySelectorAll('[data-i18n-link]')) node.replaceChildren(link(node.dataset.i18nLink));

  const group = $('#lang-group');
  group.setAttribute('aria-label', tr('lang_group_label'));
  for (const b of group.querySelectorAll('button')) {
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    b.setAttribute('aria-label', tr(b.dataset.lang === 'nl' ? 'lang_nl_aria' : 'lang_en_aria'));
  }

  const status = validityStatus(now(), data);
  $('#validity').textContent = tr(`validity_${status}`, {
    year: data.year,
    from: formatDate(lang, data.validFrom),
    until: formatDate(lang, data.validUntil),
  });
  $('#validity').classList.toggle('notice-warn', status !== 'current');

  $('#footer-verified').textContent = tr('footer_verified', {
    year: data.year, date: formatDate(lang, data.verifiedOn),
  });
  $('#footer-publisher').textContent = tr('footer_publisher', { publisher: data.publisher });
}

function readInput() {
  const form = $('#calc');
  const radio = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value ?? null;
  return {
    canon: radio('canon'),
    period: radio('period'),
    issuer: radio('issuer'),
    use: radio('use'),
    woz: $('#woz').value,
    mode: radio('mode'),
    endDate: $('#endDate').value,
    years: $('#years').value,
    conversionDate: $('#conversionDate').value,
  };
}

const ERROR_FIELDS = ['canon', 'period', 'issuer', 'use', 'woz', 'mode', 'endDate', 'years', 'conversionDate'];

function errorVars() {
  return { min: formatEuro(lang, WOZ_MIN_EUR), max: formatEuro(lang, WOZ_MAX_EUR), year: data.year };
}

function showErrors(errors) {
  let first = null;
  for (const f of ERROR_FIELDS) {
    const box = $(`#err-${f}`);
    const code = errors?.[f];
    const inputs = document.querySelectorAll(`[name="${f}"]`);
    if (code) {
      box.textContent = tr(`err_${code}`, errorVars());
      box.hidden = false;
      for (const i of inputs) i.setAttribute('aria-invalid', 'true');
      first ??= inputs[0];
    } else {
      box.textContent = '';
      box.hidden = true;
      for (const i of inputs) i.removeAttribute('aria-invalid');
    }
  }
  const summary = $('#error-summary');
  summary.hidden = !first;
  summary.textContent = first ? tr('errors_summary') : '';
  return first;
}

function dl(rows) {
  const list = el('dl', 'result-list');
  for (const [k, v, cls] of rows) {
    const wrap = el('div', cls);
    wrap.append(el('dt', null, k), el('dd', null, v));
    list.append(wrap);
  }
  return list;
}

function renderResult(o) {
  const box = el('div', 'card card-result');
  box.append(el('h2', null, tr('result_title')));
  const pct = formatPct(lang, o.pct);
  const amount = formatEuro(lang, o.amount);
  box.append(dl([
    [tr('result_amount_label'), amount, 'big'],
    [tr('result_pct_label'), pct],
    [tr('result_years_label'), tr('result_years_value', { n: o.n })],
  ]));

  if (o.scenarios.length > 1 && o.min !== o.max) {
    box.append(el('p', 'note', tr('result_range', { min: formatEuro(lang, o.min), max: formatEuro(lang, o.max) })));
  }
  if (o.outside.length) {
    box.append(el('p', 'note', tr('result_outside', { list: o.outside.join(', ') })));
  }

  const disc = el('div', 'notice notice-warn');
  disc.append(
    el('h3', null, tr('disclaimer_title')),
    el('p', null, tr('disclaimer_text')),
    el('p', null, tr('costs_text')),
  );
  box.append(disc, el('p', null, tr('next_step')));

  const how = document.createElement('details');
  how.className = 'how';
  how.append(el('summary', null, tr('how_title')));
  const steps = el('ol');
  const p = data.parameters;
  const first = el('li', null, o.mode === 'endDate'
    ? tr('how_years_endDate', { conversion: formatDate(lang, o.conversionDate), end: formatDate(lang, o.endDate) })
    : tr('how_years_direct', { n: o.n }));
  if (o.mode === 'endDate') {
    const list = el('ul');
    for (const sc of o.scenarios) {
      const line = tr('scenario_line', {
        label: tr(`scenario_${sc.basis}`), n: sc.n, pct: formatPct(lang, sc.pct), amount: formatEuro(lang, sc.amount),
      });
      list.append(el('li', sc.n === o.n ? 'chosen' : null, sc.n === o.n ? `${line} ${tr('scenario_chosen')}` : line));
    }
    first.append(list);
  }
  steps.append(first);
  if (o.mode === 'endDate') steps.append(el('li', null, tr('how_rounding')));
  steps.append(
    el('li', null, tr('how_table', { year: data.year, n: o.n, pct })),
    el('li', null, tr('how_amount', { woz: formatEuroCents(lang, o.wozCents), pct, amount })),
  );
  how.append(
    steps,
    el('p', null, tr('how_params', {
      year: data.year,
      index: formatPct(lang, p.indexationPct).slice(0, -1),
      rate: lang === 'nl' ? p.discountRatePct.replace('.', ',') : p.discountRatePct,
    })),
    el('p', null, tr('how_limits', { min: p.landValueMinPerM2, max: p.landValueMaxPerM2 })),
  );
  box.append(how);
  return box;
}

const UNKNOWN_REASONS = new Set(['canonUnknown', 'periodUnknown', 'issuerUnknown', 'useUnknown']);

function renderBlocked(o) {
  const box = el('div', 'card card-blocked');
  box.append(el('h2', null, tr('blocked_title')));
  const list = el('ul');
  for (const r of o.reasons) {
    list.append(el('li', null, tr(`reason_${r}`, { n: o.n, min: o.minN, max: o.maxN })));
  }
  box.append(list);
  if (o.reasons.some((r) => UNKNOWN_REASONS.has(r))) box.append(el('p', null, tr('blocked_where_to_look')));
  const onlyBkz = o.reasons.length === 1 && o.reasons[0] === 'issuerBkz';
  if (!onlyBkz) box.append(el('p', null, tr('blocked_next')));
  return box;
}

function renderExpired() {
  const box = el('div', 'card card-blocked');
  box.append(
    el('h2', null, tr('expired_title')),
    el('p', null, tr('validity_expired', { year: data.year })),
  );
  const p = el('p');
  p.append(link('municipalPage'));
  box.append(p);
  return box;
}

function render(outcome, { announce }) {
  const region = $('#result');
  if (!outcome || outcome.kind === 'invalid') {
    region.replaceChildren();
    return;
  }
  const node = outcome.kind === 'result' ? renderResult(outcome)
    : outcome.kind === 'blocked' ? renderBlocked(outcome)
      : renderExpired();
  region.replaceChildren(node);
  if (announce) node.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function calculate({ announce }) {
  const outcome = evaluate(readInput(), data, now());
  lastOutcome = outcome;
  const first = showErrors(outcome.kind === 'invalid' ? outcome.errors : null);
  render(outcome, { announce });
  if (announce && first) $('#error-summary').focus();
}

function syncMode() {
  const years = $('#calc').querySelector('input[name="mode"]:checked')?.value === 'years';
  $('#field-years').hidden = !years;
  $('#field-endDate').hidden = years;
}

function setLanguage(next) {
  lang = next;
  writeStoredLanguage(safeStorage(), next);
  applyStaticStrings();
  if (lastOutcome) calculate({ announce: false }); // re-render result and messages in the new language
}

function init() {
  const conv = $('#conversionDate');
  conv.min = data.validFrom;
  conv.max = data.validUntil;
  conv.value = data.validFrom;
  applyStaticStrings();
  syncMode();
  $('#calc').addEventListener('submit', (e) => {
    e.preventDefault();
    calculate({ announce: true });
  });
  for (const r of document.querySelectorAll('input[name="mode"]')) r.addEventListener('change', syncMode);
  for (const b of document.querySelectorAll('.lang-btn')) {
    b.addEventListener('click', () => setLanguage(b.dataset.lang));
  }
  if (validityStatus(now(), data) === 'expired') render({ kind: 'expired' }, { announce: false });
}

init();
