import React from 'react';

import Header from './Header';
import Client from './Client';
import Infos from './Infos';
import Items from './Items';
import Payment from './Payment';
import Footer from './Footer';

const Doc = ({ provider, client, items, doc, vat, isInvoice }) => (
  <>
    <Header {...provider} />
    <main className='main'>
      <Client {...client} />
      <Infos {...doc} isInvoice={isInvoice} />
      <Items items={items} vat={vat} isInvoice={isInvoice} />
      {isInvoice && <Payment {...provider.bankDetails} />}
    </main>
    <Footer provider={provider} doc={doc} isInvoice={isInvoice} />
  </>
);

export default Doc;
