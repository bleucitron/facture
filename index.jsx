import fs from 'fs';
import program from 'commander';
import yaml from 'js-yaml';
import path from 'path';
import { JSDOM } from 'jsdom';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { DateTime } from 'luxon';
import pdf from 'html-pdf';

import { format, formatDefaultLocale } from 'd3-format';
import locale from 'd3-format/locale/fr-FR';
import Markdown from 'markdown-to-jsx';

formatDefaultLocale(locale);

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

const sprites = fs.readdirSync('./images/sprites/').filter(path => path.endsWith('.png'));
const randomId = Math.floor(Math.random() * (sprites.length - 1));

const pathImage = path.join(__dirname, '..', `images/sprites/${ sprites[randomId]}`);
const randomSprite = `file://${pathImage}`;

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

function getFullName({ firstName, familyName }) {
  return `${firstName} ${familyName}`;
}

const Client = ({ name, address, zip, city }) => (
  <section className='client'>
    <div className='name'>{ name }</div>
    <div className='address'>{ address }</div>
    <div className='city'>{ `${zip} ${city}` }</div>
  </section>
);

const Invoice = ({ id, label, date }) => {
  return (
    <section className='invoice'>
      <div className='date'>
        <span>Date</span>
        {date}
      </div>
      <div className='id'>
        <span>Facture nº</span>
        { id }
      </div>
      <div className='label'>
        <span>Label</span>
        { label }
      </div>
    </section>
  )
};

const Header = ({ description, ... rest}) => (
  <header>
    <div>{ getFullName(rest) }</div>
    <div className='description'>{ `{ ${description} }` }</div>
  </header>
);

function formatPrice(price) {
  return format("($,.2f")(price);
}

const Items = ({ items }) => {
  const Headers = () => (
    <h2 className='headers'>
      <div className='description'>Description</div>
      <div className='price'>Prix unitaire</div>
      <div className='quantity'>Quantité</div>
      <div className='price'>Prix</div>
    </h2>
  );

  const myItems = items.map(({ description, unitPrice, quantity }, i) => (
    <div className='item' key={ i }>
      <Markdown className='description'>
        { description }
      </Markdown>
      <div className='price'>{ formatPrice(unitPrice) }</div>
      <div className='quantity'>{ quantity }</div>
      <div className='price'>{ formatPrice(unitPrice * quantity) }</div>
    </div>
  ));

  const totalHT = items.reduce((acc, { unitPrice, quantity }) => acc + unitPrice * quantity, 0);
  const vat = 0;
  const totalTTC = totalHT * (1 + vat);

  const Totals = () => (
    <div className='totals'>
      <div className='ht'>
        <div>Total HT</div>
        <div className='price'>{ formatPrice(totalHT) }</div>
      </div>
      <div className={`taxes ${!vat && 'zero'}`}>
        <div>TVA</div>
        <div className='vat'>{ vat || 'Exonérée' }</div>
      </div>
      <div className='ttc'>
        <div>Total TTC</div>
        <div className='price'>{ formatPrice(totalTTC) }</div>
      </div>
    </div>
  );

  return (
    <section className='items'>
      <Headers />
      { myItems }
      <Totals />
    </section>
  );
};

const Payment = ({ bank, iban, bic}) => (
  <section className='payment'>
    <h2>Conditions de paiement</h2>
    <div className='conditions'>
      À réception de la présente facture, par virement aux coordonnées bancaires suivantes:
    </div>
    <div className='bankDetails'>
      <div className='name'>{ bank }</div>
      <div className='iban'><span>IBAN</span>{ iban }</div>
      <div className='bic'><span>BIC</span>{ bic }</div>
    </div>
    <div className='delay'>
      Tout paiement différé entraîne l'application d'un intérêt de retard au taux de 15% annuel et d'une indemnité
      forfaitaire de 40 €. Le paiement anticipé ne donne droit à aucun escompte.
      Les acomptes facturés ne sont pas des arrhes et ne permettent pas de renoncer au marché.
    </div>
  </section>
);

const Provider = ({
  description, email, phone, address, zip, city, siret, da, da_place, ...names
}) => (
  <div className='provider'>
    <div className='name'>{ `${getFullName(names)} \n { ${ description } }` }</div>
    <div className='siret'>{ `SIRET ${ siret }` }</div>
    <div className='formation'>{ `DA de formation ${ da } (${ da_place })` }</div>
    <div className='email'>{ email }</div>
    <div className='phone'>{ phone }</div>
    <div className='address'>{ `${address} ${zip} ${city}` }</div>
  </div>
);

const Footer = ({ provider, invoice }) => (
  <div>
    <div className='image'>
      <img src={randomSprite} alt='pokemon' />
    </div>
    <Provider {...provider} />
    <footer>
      <div>{ getFullName(provider) }</div>
      <div>{invoice.label}</div>
      <div>{`Facture nº ${invoice.id}`}</div>
    </footer>
  </div>
);

const Facture = ({ provider, client, items, invoice }) => (
  <>
    <Header { ...provider } />
    <main className='main'>
      <Client { ...client } />
      <Invoice { ...invoice } />
      <Items items={ items } />
      <Payment { ...provider.bankDetails } />
    </main>
    <Footer provider={provider} invoice={invoice} />
  </>
);


const dom = new JSDOM(html, { resources: 'usable'});
const document = dom.window.document;

document.body.innerHTML = ReactDOMServer.renderToStaticMarkup(
  <Facture provider={provider} items={items} client={client} invoice={invoice} />
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
