import fs from 'fs';
import program from 'commander';
import yaml from 'js-yaml';
import { JSDOM } from 'jsdom';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { DateTime } from 'luxon';
import pdf from 'html-pdf';

import Invoice from './Invoice';

program
  .version('0.1.0')
  .option('-o, --output-dir <output-dir>', 'Output Directory')
  .option('-c, --client <client>', 'Customer')
  .option('-d, --debug', 'Debug mode')
  .parse(process.argv);

if (!program.client)
  program.client = 'HUM';

const html = fs.readFileSync('./base.html');
const provider = yaml.safeLoad(fs.readFileSync('./data/provider.yaml'), 'utf8');
const clients = yaml.safeLoad(fs.readFileSync('./data/clients.yaml'), 'utf8');
const items = yaml.safeLoad(fs.readFileSync('./data/items.yaml'), 'utf8');
const invoices = yaml.safeLoad(fs.readFileSync('./data/invoices.yaml'), 'utf8') || [];

const dateArray = DateTime.local().toISO().split('T')[0].split('-');

const client = clients[program.client];

const id = invoices.length + 1;
const number = invoices.reduce((acc, invoice) => {
  if (invoice.clientCode === client.code)
    return acc + 1;
  return acc;
}, 1);

const label = [...dateArray.slice(0, 2), client.code, `F${number}`].join('_');

const invoice = {
  id,
  label,
  date: dateArray.reverse().join('/'),
  clientCode: client.code,
  priceHT: items.reduce((acc, { unitPrice, quantity }) => acc + unitPrice * quantity, 0)
};

invoices.push(invoice);

const dom = new JSDOM(html, { resources: 'usable'});
const document = dom.window.document;

document.body.innerHTML = ReactDOMServer.renderToStaticMarkup(
  <Invoice provider={provider} items={items} client={client} invoice={invoice} />
);

var options = {
  format: 'A4',
  // footer: {
  //   contents: {
  //     height: '10px',
  //     default: ReactDOMServer.renderToStaticMarkup(<Footer provider={provider} invoice={invoice} />),
  //   }
  // },
};

fs.writeFileSync('./build/index.html', dom.serialize());

if (!program.debug)
  fs.writeFileSync('./data/invoices.yaml', yaml.safeDump(invoices));

const outputDir = program.outputDir || '.';

pdf.create(dom.serialize(), options).toFile(`${outputDir}/${label}.pdf`, function (err, res) {
  if (err) return console.log(err);
  console.log(res);
});
