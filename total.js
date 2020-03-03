import { readFileSync } from 'fs';
import { safeLoad } from 'js-yaml';

import {
  parseDate,
  logAmount,
  logQuarter,
  logYear,
  makeDateKeys,
  docType,
} from './utils';

const invoices = safeLoad(readFileSync('./data/invoices.yaml'), 'utf8') || [];
const credits = safeLoad(readFileSync('./data/credits.yaml'), 'utf8') || [];

const documents = [...invoices, ...credits];

const keys = makeDateKeys(documents);

documents.sort((d1, d2) => {
  return -1 * (parseDate(d2.date) - parseDate(d1.date));
});

function reducer(acc, cur) {
  const { value: accValue, vat: accVat } = acc;
  const { priceHT, vat, type = docType.invoice } = cur;

  const factor = type === docType.invoice ? 1 : -1;

  const value = priceHT * factor;
  const tva = vat ? value * vat : 0;

  return {
    value: accValue + value,
    vat: accVat + tva,
  };
}

const total = documents.reduce(reducer, { value: 0, vat: 0 });

const entries = keys.map(key => {
  const is = documents.filter(
    i => parseDate(i.date).toFormat('MM/yyyy') === key,
  );

  const amountByType = is.reduce(reducer, { value: 0, vat: 0 });

  return [key, amountByType];
});

let curQuarter;
let curYear;
let accQuarterValue = 0;
let accQuarterVat = 0;
let accYearValue = 0;
let accYearVat = 0;

entries.map(([date, valueByType]) => {
  const { value, vat } = valueByType;

  accQuarterValue += value;
  accYearValue += value;
  accQuarterVat += vat;
  accYearVat += vat;

  const [m, y] = date.split('/');
  const month = parseInt(m);
  const year = parseInt(y);
  curQuarter = Math.floor((month - 1) / 3) + 1;
  curYear = year;

  logAmount(date, value, vat);

  if (month % 3 === 0) {
    logQuarter(curQuarter, year, accQuarterValue, accQuarterVat);
    accQuarterValue = 0;
    accQuarterVat = 0;
  }

  if (month === 12) {
    logYear(curYear, accYearValue, accYearVat);
    accYearValue = 0;
    accYearVat = 0;
  }
});

if (accQuarterValue !== 0) {
  logQuarter(curQuarter, curYear, accQuarterValue, accQuarterVat);
}

if (accYearValue !== 0) {
  logYear(curYear, accYearValue, accYearVat);
}

logAmount('Total', total.value, total.vat);
