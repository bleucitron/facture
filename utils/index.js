import { formatDefaultLocale } from 'd3-format';
import locale from 'd3-format/locale/fr-FR';

export function getFullName({ firstName, familyName }) {
  return `${firstName} ${familyName}`;
}

function displayItems(items) {
  items.forEach((item, i) => {
    const { description, quantity, unitPrice } = item;

    console.log();
    const title = `--- Item ${i + 1} ---`;
    const qty = quantity.toString().bold;
    const price = `${unitPrice.toString()}€`.bold;
    console.log(`${title.bold} qty: ${qty} price: ${price}`);
    console.log(description.replace('\n\n', '\n'));
  });

  const total = items.reduce(
    (acc, { unitPrice, quantity }) => acc + unitPrice * quantity,
    0,
  );
  const qty = items.length.toString().bold;
  const price = `${total.toString()}€`.bold;
  console.log();
  console.log(`This invoice has ${qty} items, for a total of ${price}.`);
}

const format = formatDefaultLocale(locale).format;

export function prompt(clients) {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'client',
      message: 'What is the client?',
      choices: Object.values(clients).map(client => ({
        name: client.name,
        value: client.code,
      })),
      filter: code => clients[code],
    },
    {
      type: 'confirm',
      name: 'ok',
      message: () => {
        displayItems(items);
        return 'Is this ok?';
      },
      default: true,
      filter: code => clients[code],
    },
  ]);
}

export function formatPrice(price) {
  return format('($,.2f')(price);
}
