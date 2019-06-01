import React from 'react';

import Header from './Header';
import Client from './Client';
import Infos from './Infos';
import Items from './Items';
import Payment from './Payment';
import Footer from './Footer';

const Invoice = ({ provider, client, items, invoice }) => (
  <>
    <Header {...provider} />
    <main className='main'>
      <Client {...client} />
      <Infos {...invoice} />
      <Items items={items} />
      <Payment {...provider.bankDetails} />
    </main>
    <Footer provider={provider} invoice={invoice} />
  </>
);

export default Invoice;
