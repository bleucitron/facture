import React from 'react';

import Header from './Header';
import Client from './Client';
import Infos from './Infos';
import Items from './Items';
import Expenses from './Expenses';
import Payment from './Payment';
import Footer from './Footer';

import { docType } from '../utils';

const Doc = ({ provider, client, items, expenses, doc, vat, type }) => (
  <>
    <Header {...provider} />
    <main className="main">
      <Client {...client} />
      <Infos {...doc} type={type} />
      <Items items={items} vat={vat} type={type} />
      {expenses && <Expenses items={expenses} type={type} />}
      {type !== docType.credit ? (
        <Payment {...provider.bankDetails} type={type} />
      ) : null}
    </main>
    <Footer provider={provider} doc={doc} type={type} />
  </>
);

export default Doc;
