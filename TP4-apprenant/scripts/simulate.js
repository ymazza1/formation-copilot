const { Inventory, Product } = require('../src/inventory');

const products = [
  new Product('Baguette tradition', 10, 20),
  new Product('Comté affiné 24 mois', 2, 0),
  new Product('Yaourt fermier', 5, 7),
  new Product('Levain mère de la maison', 0, 80),
  new Product('Levain mère de la maison', -1, 80),
  new Product('Billet dégustation - Vins de Loire', 15, 20),
  new Product('Billet dégustation - Vins de Loire', 10, 49),
  new Product('Billet dégustation - Vins de Loire', 5, 49),
  new Product('Jus de pomme bio', 3, 6),
];

const days = Number(process.argv[2]) || 2;
const inventory = new Inventory(products);

for (let day = 0; day < days; day++) {
  console.log(`-------- jour ${day} --------`);
  console.log('nom, expiresIn, quality');
  products.forEach((p) => console.log(`${p.name}, ${p.expiresIn}, ${p.quality}`));
  console.log();
  inventory.endOfDay();
}
