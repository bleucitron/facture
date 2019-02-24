import React from 'react';

const Provider = ({ firstName, familyName, description }) => (
  <section className='provider'>
    <div>{`${firstName} ${familyName}`}</div>
    <div>{description}</div>
  </section>
);

export default Provider;
