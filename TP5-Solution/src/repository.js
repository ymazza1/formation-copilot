const fs = require('fs');
const path = require('path');
const { Product } = require('./inventory');

const DEFAULT_FILE = path.join(__dirname, '..', 'data', 'stock.json');

/**
 * Détermine le fichier de stock : paramètre `file`, puis variable STOCK_FILE, puis data/stock.json.
 * @param {string} [file]
 * @returns {string}
 */
function resolveFile(file) {
  return file || process.env.STOCK_FILE || DEFAULT_FILE;
}

/**
 * Charge le stock depuis un fichier JSON.
 * @param {string} [file] - Chemin du fichier de stock (voir {@link resolveFile}).
 * @returns {Product[]} Les produits lus.
 * @throws {Error} Si le fichier n'existe pas ou ne contient pas du JSON valide.
 */
function load(file) {
  const data = JSON.parse(fs.readFileSync(resolveFile(file), 'utf-8'));
  return data.map(({ name, expiresIn, quality }) => new Product(name, expiresIn, quality));
}

/**
 * Enregistre le stock dans un fichier JSON (écrase le contenu existant).
 * @param {Product[]} products - Produits à enregistrer.
 * @param {string} [file] - Chemin du fichier de stock (voir {@link resolveFile}).
 */
function save(products, file) {
  const data = products.map(({ name, expiresIn, quality }) => ({ name, expiresIn, quality }));
  fs.writeFileSync(resolveFile(file), JSON.stringify(data, null, 2));
}

module.exports = { load, save };
