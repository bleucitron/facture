import React from 'react';

const Client = ({ name, address, zip, city }) => (
  <section className='client'>
    <div className='name'>{name}</div>
    <div className='address'>{address}</div>
    <div className='city'>{`${zip} ${city}`}</div>
  </section>
);

export default Client;
