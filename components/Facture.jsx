import React from 'react';

import Provider from './Provider.jsx';
import Client from './Client.jsx';
import Items from './Items.jsx';

const Facture = ({ provider, }) => (
  <div>
    <header>
      <Provider {...provider} />
      <Info id={1} label='Prout' />
      <Client {...client} />
    </header>
    <main className='main'>
      <Items items={items} />
      <section className='payment'>
        Par virement à réception de la présente facture
      <p className='bank'></p>
        <p className='iban'></p>
        <p className='bic'></p>
      </section>
      <section className='delay'>
        Tout paiement différé entraîne l'application d'un intérêt de retard au taux de 15% annuel et d'une indemnité
        forfaitaire de 40 €. Le paiement anticipé ne donne droit à aucun escompte.
        Les acomptes facturés ne sont pas des arrhes et ne permettent pas de renoncer au marché.
    </section>
    </main>
    <footer>
      <p class='name'></p>
      <p class='siret'></p>
      <p class='address'></p>
    </footer>
  </div>
);

export default Facture;
