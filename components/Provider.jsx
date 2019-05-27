import React from 'react';

import getFullName from '../utils/getFullName';

const Provider = ({
  description, email, phone, address, zip, city, siret, da, da_place, ...names
}) => (
  <div className='provider'>
    <div className='name'>{`${getFullName(names)} \n { ${description} }`}</div>
    <div className='siret'>{`SIRET ${siret}`}</div>
    <div className='formation'>{`DA de formation ${da} (${da_place})`}</div>
    <div className='email'>{email}</div>
    <div className='phone'>{phone}</div>
    <div className='address'>{`${address} ${zip} ${city}`}</div>
  </div>
);

export default Provider;
