import { readFileSync, writeFileSync } from 'fs';
import program from 'commander';
import { safeLoad, safeDump } from 'js-yaml';
import { JSDOM } from 'jsdom';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { DateTime } from 'luxon';
import 'colors';
import pdf from 'html-pdf';

import rc from 'rc';

import { docType, prompt, round } from '../utils';
import Doc from './Doc';

function fromYaml(file) {
  return safeLoad(readFileSync(file), 'utf8');
}

const provider = fromYaml('./data/provider.yaml');
const clients = fromYaml('./data/clients.yaml');
const { items, expenses } = fromYaml('./data/items.yaml');
const invoices = fromYaml('./data/invoices.yaml') || [];
const credits = fromYaml('./data/credits.yaml') || [];
const quotes = fromYaml('./data/quotes.yaml') || [];

program
  .version('0.1.0')
  .option('-d, --debug', 'Debug mode')
  .parse(process.argv);

const defaultOptions = {
  type: docType.invoice,
  client: clients['HUM'],
  vat: 20 / 100,
  ok: true,
};

const init = program.debug
  ? Promise.resolve(defaultOptions)
  : prompt(clients, items, expenses);

init.then(({ type, client, vat, ok }) => {
  if (!ok) return;

  let docs = invoices;
  let key = 'F';
  let typePath = 'invoices';

  if (type === docType.credit) {
    docs = credits;
    key = 'A';
    typePath = 'credits';
  } else if (type === docType.quote) {
    docs = quotes;
    key = 'D';
    typePath = 'quotes';
  }

  const dateArray = DateTime.local().toISO().split('T')[0].split('-');

  const id = docs.length + 1;
  const number = docs.reduce((acc, doc) => {
    if (doc.clientCode === client.code) return acc + 1;
    return acc;
  }, 1);

  const label = [...dateArray.slice(0, 2), client.code, `${key}${number}`].join(
    '_',
  );

  console.log();
  console.log(`Generating ${type} #${id}, ${label.bold}...`);

  const html = readFileSync('./base.html');

  const priceHT = round(
    items.reduce(
      (acc, { unitPrice, quantity }) => acc + unitPrice * quantity,
      0,
    ),
  );

  const doc = {
    id,
    label,
    date: dateArray.reverse().join('/'),
    clientCode: client.code,
    priceHT,
    vat,
    type,
  };

  docs.push(doc);

  const dom = new JSDOM(html, { resources: 'usable' });
  const document = dom.window.document;

  document.body.innerHTML = ReactDOMServer.renderToStaticMarkup(
    <Doc
      provider={provider}
      items={items}
      expenses={expenses}
      client={client}
      doc={doc}
      type={type}
      vat={vat}
    />,
  );

  var options = {
    format: 'A4',
    // footer: {
    //   contents: {
    //     height: '10px',z
    //     default: ReactDOMServer.renderToStaticMarkup(<Footer provider={provider} invoice={invoice} />),
    //   }
    // },
  };

  writeFileSync('./build/index.html', dom.serialize());

  const outputPath = `./data/${typePath}.yaml`;
  if (!program.debug) writeFileSync(outputPath, safeDump(docs));

  const dir = program.debug ? '.' : rc('facture').outputDir;

  pdf
    .create(dom.serialize(), options)
    .toFile(`${dir}/${label}.pdf`, function (err, res) {
      if (err) return console.log(err);
      console.log(res.filename.green);
    });
});
