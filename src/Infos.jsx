import React from 'react';

import { docType, docTypeText } from '../utils';

const Infos = ({ id, label, date, type }) => {
  const typeText = docTypeText[type];

  const duration =
    type === docType.quote ? (
      <div className='duration'>
        <span>Validité</span>30 jours
      </div>
    ) : null;

  return (
    <section className='info'>
      <div className='date'>
        <span>Date</span>
        {date}
      </div>
      <div className='id'>
        <span>{typeText} nº</span>
        {id}
      </div>
      <div className='label'>
        <span>Label</span>
        {label}
      </div>
      {duration}
    </section>
  );
};

export default Infos;
