import inquirer from 'inquirer';
import { DateTime } from 'luxon';
import chalk from 'chalk';
import { formatDefaultLocale } from 'd3-format';
import locale from 'd3-format/locale/fr-FR';

export function getFullName({ firstName, familyName }) {
  return `${firstName} ${familyName}`;
}

export const docType = {
  invoice: 'invoice',
  credit: 'credit',
  quote: 'quote',
};

export const docTypeText = {
  invoice: 'Facture',
  credit: 'Avoir',
  quote: 'Devis',
};

function displayItems(answers, items, expenses) {
  const { type, client, vat } = answers;

  items.forEach((item, i) => {
    const { description, quantity, unitPrice } = item;

    console.log();
    const title = `--- Item ${i + 1} ---`;
    const qty = quantity.toString().bold;
    const price = `${unitPrice.toString()}€`.bold;
    console.log(`${title.bold} qty: ${qty} price: ${price}`);
    console.log(description.replace('\n\n', '\n'));
  });

  const total = items.reduce(
    (acc, { unitPrice, quantity }) => acc + unitPrice * quantity,
    0,
  );

  const totalExpenses = expenses.reduce(
    (acc, { unitPrice, quantity }) => acc + unitPrice * quantity,
    0,
  );

  const qty = items.length.toString().bold;
  const price = `${round(total).toString()}€`.bold;
  const qtyExp = expenses.length.toString().bold;
  const priceExp = `${round(totalExpenses).toString()}€`.bold;
  console.log();
  console.log(`The client is ${client.name}.`);
  console.log();
  console.log(`This ${type} has ${qty} items, for a total of ${price}.`);
  console.log(`The VAT is ${vat * 100}%.`);
  console.log();
  if (expenses) {
    console.log(
      `There are ${qtyExp} expenses items, for a total of ${priceExp}.`,
    );
    console.log();
  }
}

const format = formatDefaultLocale(locale).format;

export function prompt(clients, items, expenses = []) {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Invoice or Credit ?',
      choices: Object.values(docType).map(type => ({
        name: type,
        value: type,
      })),
      default: 0,
    },
    {
      type: 'list',
      name: 'client',
      message: 'What is the client?',
      choices: Object.values(clients).map(client => ({
        name: client.name,
        value: client.code,
      })),
      filter: code => clients[code],
    },
    {
      type: 'list',
      name: 'vat',
      message: 'TVA ?',
      choices: [0, 20].map(value => ({
        name: value,
        value: value,
      })),
      default: 1,
      filter: vat => vat / 100,
    },
    {
      type: 'confirm',
      name: 'ok',
      message: answers => {
        displayItems(answers, items, expenses);
        return 'Is this ok?';
      },
      default: true,
    },
  ]);
}

export function formatPrice(price) {
  return format('($,.2f')(price);
}

export function round(value, exp = 2) {
  const factor = 10 ** exp;
  return Math.round(value * factor) / factor;
}

function evaluate(amount, rate) {
  return Math.round((amount * rate) / 100);
}

export function calculateRates(value, vat, _chalk = chalk) {
  // const cotisation = chalk.grey(`5,5%: ${evaluate(value, 5.5)}€`);
  const cotisation = _chalk.grey(`16,5%: ${evaluate(value, 16.5)}€`);
  const impots = _chalk.grey(`2,2%: ${evaluate(value, 2.2)}€`);
  const tva = _chalk.yellow(`TVA: ${evaluate(vat, 100)}€`);

  return {
    cotisation,
    impots,
    tva,
  };
}

export function parseDate(date) {
  return DateTime.fromFormat(date, 'dd/MM/yyyy');
}

export function makeDateKeys(from, to = undefined) {
  const { year, month } = parseDate(from);
  const first = DateTime.fromObject({ year, month });
  const now = DateTime.now();
  const last = to ? parseDate(to) : now;

  let current = first;
  let currentKey = first.toFormat('yyyy/MM');
  const lastKey = last.toFormat('yyyy/MM');

  const keys = [];

  while (currentKey <= lastKey) {
    keys.push(current.toFormat('MM/yyyy'));
    current = current.plus({ months: 1 });
    currentKey = current.toFormat('yyyy/MM');

    if (current > now) break;
  }

  return keys;
}
