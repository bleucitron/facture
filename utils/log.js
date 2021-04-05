import chalk from 'chalk';
import {
  parseDate,
  makeDateKeys,
  docType,
  calculateRates,
  formatPrice,
} from '.';

export function logAmount(text, value, vat) {
  const { cotisation, impots, tva } = calculateRates(value, vat);
  const amount = chalk.blue(`${formatPrice(value)}`);

  console.log(`${text}: ${amount} / ${cotisation} / ${impots} / ${tva}`);
}

export function logQuarter(quarter, year, value, vat) {
  const { cotisation, impots, tva } = calculateRates(value, vat, chalk.bold);
  const amount = chalk.bold.green(`${formatPrice(value)}`);

  console.log(
    `${year} Q${quarter}: ${amount} / ${cotisation} / ${impots} / ${tva}`,
  );
  console.log();
}

export function logYear(year, value, vat) {
  const { cotisation, impots, tva } = calculateRates(
    value,
    vat,
    chalk.bold.underline,
  );
  const amount = chalk.bold.underline.green(`${formatPrice(value)}`);

  console.log(`${year}: ${amount} / ${cotisation} / ${impots} / ${tva}`);
  console.log();
}

let curQuarter;
let curYear;
let accQuarterValue = 0;
let accQuarterVat = 0;
let accYearValue = 0;
let accYearVat = 0;

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

export function logSummary(documents) {
  console.log('TODO');
}

export function logValues(documents, year = undefined) {
  if (year)
    documents = documents.filter(d => {
      return parseDate(d.date).year === year;
    });

  if (!documents.length) {
    console.log(year ? `${year}:` : '', chalk.bold.red('No documents'));
    return;
  }

  const keys = year
    ? makeDateKeys(documents[0].date, `31/12/${year}`)
    : makeDateKeys(documents[0].date, documents[documents.length - 1].date);

  const total = documents.reduce(reducer, { value: 0, vat: 0 });

  const entries = keys.map(key => {
    const is = documents.filter(
      i => parseDate(i.date).toFormat('MM/yyyy') === key,
    );

    const amountByType = is.reduce(reducer, { value: 0, vat: 0 });

    return [key, amountByType];
  });

  entries.forEach(([date, valueByType]) => {
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

    if (!year && month === 12) {
      logYear(curYear, accYearValue, accYearVat);
      accYearValue = 0;
      accYearVat = 0;
    }
  });

  if (year) {
    logYear(curYear, accYearValue, accYearVat);
  } else {
    if (accQuarterValue !== 0) {
      logQuarter(curQuarter, curYear, accQuarterValue, accQuarterVat);
    }

    if (accYearValue !== 0) {
      logYear(curYear, accYearValue, accYearVat);
    }

    logAmount('Total', total.value, total.vat);
  }
}
