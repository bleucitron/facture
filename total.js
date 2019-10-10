import { readFileSync } from 'fs';
import { safeLoad } from 'js-yaml';

const all = safeLoad(readFileSync('./data/invoices.yaml'), 'utf8');

const total = all.reduce((total, invoice) => total + invoice.priceHT, 0);

function evaluate(rate) {
  return Math.round((total * rate) / 100);
}

console.log(`TOTAL ${total}€`);
console.log(`Cotisations 5,5%: ${evaluate(5.5)}€`);
console.log(`Impôt sur le revenu: ${evaluate(2.2)}€`);
console.log('---');
console.log(`Cotisations 11%: ${evaluate(11)}€`);
console.log(`Cotisations 16,5%: ${evaluate(16.5)}€`);
console.log(`Cotisations 22%: ${evaluate(22)}€`);
