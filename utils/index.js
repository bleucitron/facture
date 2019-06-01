export function getFullName ({ firstName, familyName }) {
  return `${firstName} ${familyName}`;
}

export function displayItems(items) {
  items.forEach((item, i) => {
    const { description, quantity, unitPrice } = item

    console.log();
    const title = `--- Item ${i + 1} ---`;
    const qty = quantity.toString().bold;
    const price = `${unitPrice.toString()}€`.bold;
    console.log(`${title.bold} qty: ${qty} price: ${price}`);
    console.log();
    console.log(description.replace('\n\n', '\n'));
  });

  const total = items.reduce((acc, { unitPrice, quantity }) => acc + unitPrice * quantity, 0);
  const qty = items.length.toString().bold;
  const price = `${total.toString()}€`.bold;
  console.log(`This invoice has ${qty} items, for a total of ${price}.`)
}
