import React from 'react';
import classnames from 'classnames';
import Markdown from 'markdown-to-jsx';

import { formatPrice, round } from '../utils';

const Items = ({ items, type, vat }) => {
  const Headers = () => (
    <h2 className={classnames('headers', type)}>
      <div className='description'>Description</div>
      <div className='price'>Prix unitaire</div>
      <div className='quantity'>Quantité</div>
      <div className='price'>Prix</div>
    </h2>
  );

  const myItems = items.map(({ description, unitPrice, quantity }, i) => (
    <div className='item' key={i}>
      <Markdown className='description'>{description}</Markdown>
      <div className='price'>{formatPrice(unitPrice)}</div>
      <div className='quantity'>{quantity}</div>
      <div className='price'>{formatPrice(unitPrice * quantity)}</div>
    </div>
  ));

  const totalHT = round(
    items.reduce(
      (acc, { unitPrice, quantity }) => acc + unitPrice * quantity,
      0,
    ),
  );
  const totalVAT = round(totalHT * vat);
  const totalTTC = round(totalHT * (1 + vat));

  const Totals = () => (
    <div className='totals'>
      <div className='ht'>
        <div>Total HT</div>
        <div className='price'>{formatPrice(totalHT)}</div>
      </div>
      <div className={`taxes ${!vat && 'zero'}`}>
        <div>TVA {vat ? `${vat * 100}%` : ''}</div>
        <div className='vat'>{vat ? formatPrice(totalVAT) : 'Exonérée'}</div>
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
