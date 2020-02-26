import inquirer from 'inquirer';
import { DateTime } from 'luxon';
import chalk from 'chalk';
import { formatDefaultLocale } from 'd3-format';
import locale from 'd3-format/locale/fr-FR';

export function getFullName({ firstName, familyName }) {
  return `${firstName} ${familyName}`;
}

function displayItems(items) {
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
  const qty = items.length.toString().bold;
  const price = `${total.toString()}€`.bold;
  console.log();
  console.log(`This invoice has ${qty} items, for a total of ${price}.`);
}

const format = formatDefaultLocale(locale).format;

export function prompt(clients, items) {
  return inquirer.prompt([
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
      type: 'confirm',
      name: 'ok',
      message: () => {
        displayItems(items);
        return 'Is this ok?';
      },
      default: true,
      filter: code => clients[code],
    },
  ]);
}

function formatPrice(price) {
  return format('($,.2f')(price);
}

function evaluate(amount, rate) {
  return Math.round((amount * rate) / 100);
}

function calculateRates(value, _chalk = chalk) {
  // const cotisation = chalk.grey(`5,5%: ${evaluate(value, 5.5)}€`);
  const cotisation = _chalk.grey(`16,5%: ${evaluate(value, 16.5)}€`);
  const impots = _chalk.grey(`2,2%: ${evaluate(value, 2.2)}€`);
  const tva = _chalk.yellow(`20%: ${evaluate(value, 20)}€`);

  return {
    cotisation,
    impots,
    tva,
  };
}

export function parseDate(date) {
  return DateTime.fromFormat(date, 'dd/MM/yyyy');
}

export function logAmount(text, value) {
  const { cotisation, impots, tva } = calculateRates(value);
  const amount = chalk.blue(`${formatPrice(value)}`);

  console.log(`${text}: ${amount} / ${cotisation} / ${impots} / ${tva}`);
}

export function logQuarter(quarter, year, value) {
  const { cotisation, impots, tva } = calculateRates(value, chalk.bold);
  const amount = chalk.bold.green(`${formatPrice(value)}`);

  console.log(
    `${year} Q${quarter}: ${amount} / ${cotisation} / ${impots} / ${tva}`,
  );
  console.log();
}

export function logYear(year, value) {
  const { cotisation, impots, tva } = calculateRates(
    value,
    chalk.bold.underline,
  );
  const amount = chalk.bold.underline.green(`${formatPrice(value)}`);

  console.log(`${year}: ${amount} / ${cotisation} / ${impots} / ${tva}`);
  console.log();
}

export function makeDateKeys(all) {
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
