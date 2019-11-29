import { readFileSync } from 'fs';
import { safeLoad } from 'js-yaml';
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

// function logAmounts(amount) {
//   console.log();
//   console.log('--- TOTAL ---');
//   console.log(`CA: ${amount}€`);
//   console.log(`Cotisations 5,5%: ${evaluate(amount, 5.5)}€`);
//   console.log(`Impôt sur le revenu: ${evaluate(amount, 2.2)}€`);
//   console.log('---');
//   console.log(`Cotisations 11%: ${evaluate(amount, 11)}€`);
//   console.log(`Cotisations 16,5%: ${evaluate(amount, 16.5)}€`);
//   console.log(`Cotisations 22%: ${evaluate(amount, 22)}€`);
// }

const all = safeLoad(readFileSync('./data/invoices.yaml'), 'utf8');

const total = all.reduce((total, invoice) => total + invoice.priceHT, 0);

const byMonth = all.reduce((monthToAmount, invoice) => {
  const [d, m, y] = invoice.date.split('/');

  const key = `${m}/${y}`;

  const amount = monthToAmount[key] || 0;
  monthToAmount[key] = amount + invoice.priceHT;

  return monthToAmount;
}, {});

const byYear = all.reduce((yearToAmount, invoice) => {
  const [d, m, y] = invoice.date.split('/');

  const amount = yearToAmount[y] || 0;
  yearToAmount[y] = amount + invoice.priceHT;

  return yearToAmount;
}, {});

Object.entries(byMonth).map(([date, value]) => {
  logAmount(date, value);
});

console.log();
logAmount('2019', byYear['2019']);

console.log();
logAmount('Total', total);
