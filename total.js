import { readFileSync } from 'fs';
import { safeLoad } from 'js-yaml';
import { DateTime } from 'luxon';
import chalk from 'chalk';

import { formatPrice } from './utils';

function evaluate(amount, rate) {
  return Math.round((amount * rate) / 100);
}

function logAmount(text, value) {
  const amount = chalk.blue(`${formatPrice(value)}`);
  const cotisation = chalk.grey(`5,5%: ${evaluate(value, 5.5)}€`);
  const impots = chalk.grey(`2,2%: ${evaluate(value, 2.2)}€`);

  console.log(`${text}: ${amount} / ${cotisation} / ${impots}`);
}

function logQuarter(quarter, year, value) {
  const amount = chalk.green(`${formatPrice(value)}`);

  console.log(`${year} Q${quarter}: ${amount}`);
  console.log();
}

function logYear(year, value) {
  const amount = chalk.green(`${formatPrice(value)}`);

  console.log(`${year}: ${amount}`);
  console.log();
}

function parseDate(date) {
  return DateTime.fromFormat(date, 'dd/MM/yyyy');
}

function makeDateKeys(all) {
  const first = parseDate(all[0].date);
  const last = parseDate(all[all.length - 1].date);

  let current = first;
  let currentKey = first.toFormat('yyyy/MM');
  const lastKey = last.toFormat('yyyy/MM');

  const keys = [];

  while (currentKey <= lastKey) {
    keys.push(current.toFormat('MM/yyyy'));
    current = current.plus({ months: 1 });
    currentKey = current.toFormat('yyyy/MM');
  }

  return keys;
}

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

// console.log('All by month', Object.fromEntries(entries));

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
