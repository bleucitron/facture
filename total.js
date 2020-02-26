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

const total = documents.reduce((total, doc) => {
  const { type = docType.invoice } = doc;
  const factor = type === docType.invoice ? 1 : -1;
  return total + doc.priceHT * factor;
}, 0);

const entries = keys.map(key => {
  const is = documents.filter(
    i => parseDate(i.date).toFormat('MM/yyyy') === key,
  );

  const amount = is.reduce((acc, cur) => {
    const { type = docType.invoice } = cur;
    const factor = type === docType.invoice ? 1 : -1;
    return acc + cur.priceHT * factor;
  }, 0);

  return [key, amount];
});

let curQuarter;
let curYear;
let accQuarter = 0;
let accYear = 0;

entries.map(([date, value]) => {
  accQuarter += value;
  accYear += value;

  const [m, y] = date.split('/');
  const month = parseInt(m);
  const year = parseInt(y);
  curQuarter = Math.floor((month - 1) / 3) + 1;
  curYear = year;

  logAmount(date, value);

  if (month % 3 === 0) {
    logQuarter(curQuarter, year, accQuarter);
    accQuarter = 0;
  }

  if (month === 12) {
    logYear(curYear, accYear);
    accYear = 0;
  }
});

if (accQuarter !== 0) {
  logQuarter(curQuarter, curYear, accQuarter);
}

if (accYear !== 0) {
  logYear(curYear, accYear);
}

logAmount('Total', total);
