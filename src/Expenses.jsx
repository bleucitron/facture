import React from 'react';
import classnames from 'classnames';
import Markdown from 'markdown-to-jsx';

import { formatPrice, round } from '../utils';

const Expenses = ({ items, type }) => {
  const Headers = () => (
    <h2 className={classnames('headers', type)}>
      <div className="description">Débours</div>
      <div className="price">Prix unitaire</div>
      <div className="quantity">Quantité</div>
      <div className="price">Prix</div>
    </h2>
  );

  const myItems = items.map(({ description, unitPrice, quantity }, i) => (
    <div className="item" key={i}>
      <Markdown className="description">{description}</Markdown>
      <div className="price">{formatPrice(unitPrice)}</div>
      <div className="quantity">{quantity}</div>
      <div className="price">{formatPrice(unitPrice * quantity)}</div>
    </div>
  ));

  const totalExp = round(
    items.reduce(
      (acc, { unitPrice, quantity }) => acc + unitPrice * quantity,
      0,
    ),
  );

  const Totals = () => (
    <div className="totals">
      <div className="ttc">
        <div>Total Débours</div>
        <div className="price">{formatPrice(totalExp)}</div>
      </div>
    </div>
  );

  return (
    <section className="expenses">
      <Headers />
      {myItems}
      <Totals />
    </section>
  );
};

export default Expenses;
