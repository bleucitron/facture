import React from 'react';
import { DateTime } from 'luxon';

const Infos = ({ id, label, date }) => {
  return (
    <section className='info'>
      <div className='date'>
        <span>Date</span>
        {date}
      </div>
      <div className='id'>
        <span>Facture nº</span>
        {id}
      </div>
      <div className='label'>
        <span>Label</span>
        {label}
      </div>
    </section>
  )
};

export default Infos;
