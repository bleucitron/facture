import React from 'react';
import Markdown from 'markdown-to-jsx';

import { format, formatDefaultLocale } from 'd3-format';
import locale from 'd3-format/locale/fr-FR';

formatDefaultLocale(locale);

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
    <div className='item' key={i}>
      <Markdown className='description'>
        {description}
      </Markdown>
      <div className='price'>{formatPrice(unitPrice)}</div>
      <div className='quantity'>{quantity}</div>
      <div className='price'>{formatPrice(unitPrice * quantity)}</div>
    </div>
  ));

  const totalHT = items.reduce((acc, { unitPrice, quantity }) => acc + unitPrice * quantity, 0);
  const vat = 0;
  const totalTTC = totalHT * (1 + vat);

  const Totals = () => (
    <div className='totals'>
      <div className='ht'>
        <div>Total HT</div>
        <div className='price'>{formatPrice(totalHT)}</div>
      </div>
      <div className={`taxes ${!vat && 'zero'}`}>
        <div>TVA</div>
        <div className='vat'>{vat || 'Exonérée'}</div>
      </div>
      <div className='ttc'>
        <div>Total TTC</div>
        <div className='price'>{formatPrice(totalTTC)}</div>
      </div>
    </div>
  );

  return (
    <section className='items'>
      <Headers />
      {myItems}
      <Totals />
    </section>
  );
};

export default Items;
