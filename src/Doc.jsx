import React from 'react';

import Header from './Header';
import Client from './Client';
import Infos from './Infos';
import Items from './Items';
import Payment from './Payment';
import Footer from './Footer';

import { docType } from '../utils';

const Doc = ({ provider, client, items, doc, vat, type }) => (
  <>
    <Header {...provider} />
    <main className='main'>
      <Client {...client} />
      <Infos {...doc} type={type} />
      <Items items={items} vat={vat} type={type} />
      {type !== docType.credit ? (
        <Payment {...provider.bankDetails} type={type} />
      ) : null}
    </main>
    <Footer provider={provider} doc={doc} type={type} />
  </>
);

export default Doc;
