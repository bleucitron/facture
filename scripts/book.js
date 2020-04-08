import { join } from 'path';
import rc from 'rc';
import stringify from 'csv-stringify';
import { readFileSync, writeFileSync } from 'fs';
import { safeLoad } from 'js-yaml';

import { parseDate, round } from '../utils';

const dir = rc('facture').outputDir;
const dataDir = join(__dirname, '../data');

const invoices =
  safeLoad(readFileSync(join(dataDir, 'invoices.yaml')), 'utf8') || [];
const credits =
  safeLoad(readFileSync(join(dataDir, 'credits.yaml')), 'utf8') || [];

const documents = [...invoices, ...credits]
  .sort((d1, d2) => {
    const output = parseDate(d2.date) - parseDate(d1.date);

    if (output === 0) return d2.id - d1.id;
    return output;
  })
  .map((d) => ({ ...d, priceTTC: round(d.priceHT * (1 + d.vat)) }));

let headers = new Set(Object.keys(documents[documents.length - 1]));

headers.delete('type');
headers.delete('date');
headers = ['date', 'type', ...headers];

stringify(
  documents,
  {
    header: true,
    columns: headers,
  },
  (err, data) => writeFileSync(join(dir, 'livre.csv'), data),
);
