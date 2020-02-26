import React from 'react';

const Infos = ({ id, label, date, isInvoice }) => {
  const type = isInvoice ? 'Facture' : 'Avoir';

  return (
    <section className='info'>
      <div className='date'>
        <span>Date</span>
        {date}
      </div>
      <div className='id'>
        <span>{type} nº</span>
        {id}
      </div>
      <div className='label'>
        <span>Label</span>
        {label}
      </div>
    </section>
  );
};

export default Infos;
