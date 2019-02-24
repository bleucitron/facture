import React from 'react';

const Items = ({ items }) => {
  const myItems = items.map(({ description, unitPrice, quantity }, i) => (
    <div className='item' key={i}>
      <div className='description'>{description}</div>
      <div className='unit-price'>{unitPrice}</div>
      <div className='quantity'>{quantity}</div>
      <div className='quantity'>{unitPrice * quantity}</div>
    </div>
  ));

  return (
    <section className='items'>
      <div className='headers'>
        <div>Description</div>
        <div>Prix unitaire HT</div>
        <div>Quantité</div>
        <div>Prix</div>
      </div>
      <div>{myItems}</div>
      <div className='total-ht'>
        <div>Total HT</div>
        <div className='price'></div>
      </div>
      <div className='taxes'>
        <div>TVA Exonérée</div>
        <div></div>
      </div>
      <div className='total-ttc'>
        <div>Total TTC</div>
        <div className='price'></div>
      </div>
    </section>
  );
}

export default Items;
