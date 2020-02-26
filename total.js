import { readFileSync } from 'fs';
import { safeLoad } from 'js-yaml';

import {
  parseDate,
  logAmount,
  logQuarter,
  logYear,
  makeDateKeys,
} from './utils';

const invoices = safeLoad(readFileSync('./data/invoices.yaml'), 'utf8');
const keys = makeDateKeys(invoices);

invoices.sort((i1, i2) => {
  return -1 * (parseDate(i2.date) - parseDate(i1.date));
});

const total = invoices.reduce((total, invoice) => total + invoice.priceHT, 0);

const entries = keys.map(key => {
  const is = invoices.filter(
    i => parseDate(i.date).toFormat('MM/yyyy') === key,
  );

  const amount = is.reduce((acc, cur) => acc + cur.priceHT, 0);

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
