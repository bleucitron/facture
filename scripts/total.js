import program from 'commander';
import { join } from 'path';
import { readFileSync } from 'fs';
import { safeLoad } from 'js-yaml';

import { parseDate } from '../utils';

import { logSummary, logValues } from '../utils/log';

const dataDir = join(__dirname, '../data');

const invoices =
  safeLoad(readFileSync(join(dataDir, 'invoices.yaml')), 'utf8') || [];
const credits =
  safeLoad(readFileSync(join(dataDir, 'credits.yaml')), 'utf8') || [];

const documents = [...invoices, ...credits];

documents.sort((d1, d2) => {
  return -1 * (parseDate(d2.date) - parseDate(d1.date));
});

program
  .version('0.1.0')
  .option('-s, --summary', 'Log only year summary')
  .option('-y, --year <year>', 'Log only for specified year')
  .parse(process.argv);

if (program.summary) {
  logSummary(documents);
} else if (program.year) {
  const year = parseInt(program.year);
  logValues(documents, year);
} else logValues(documents);
