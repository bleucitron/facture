import React from 'react';
import { DateTime } from 'luxon';

const Infos = ({ id, label }) => {
  const date = DateTime.local().toISO().split('T')[0].split('-').reverse().join('/');
  return (
    <section className='info'>
      <div className='date'>{date}</div>
      <div className='id'>
        <span>Facture n:</span>
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
