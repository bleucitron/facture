import React from 'react';
import classnames from 'classnames';

import { getFullName } from '../utils';

const Provider = ({
  description,
  email,
  phone,
  address,
  zip,
  city,
  siret,
  tva,
  da,
  da_place,
  type,
  ...names
}) => (
  <div className={classnames('provider', type)}>
    <div className='name'>
      <div>{getFullName(names)}</div>
      <div className='label'>{`{ ${description} }`}</div>
    </div>
    <div className='siret'>
      <span className='label'>SIRET</span>
      <span>{siret}</span>
    </div>
    <div className='tva'>
      <span className='label'>TVA</span>
      <span>{tva}</span>
    </div>
    <div className='formation'>
      <span className='label'>DA de formation</span>
      <span>{da}</span>
      <span className='label'>{`(${da_place})`}</span>
    </div>
    <div className='email'>{email}</div>
    <div className='phone'>{phone}</div>
    <div className='address'>{`${address} ${zip} ${city}`}</div>
  </div>
);

export default Provider;
