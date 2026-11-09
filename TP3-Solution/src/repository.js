const fs = require('fs');
const path = require('path');
const { Product } = require('./inventory');

const DEFAULT_FILE = path.join(__dirname, '..', 'data', 'stock.json');

/**
 * Charge le stock depuis un fichier JSON.
 * Fichier utilisé, par ordre de priorité : paramètre `file`, variable d'environnement STOCK_FILE, data/stock.json.
 * @param {string} [file] - Chemin du fichier de stock.
 * @returns {Product[]} Les produits lus.
 * @throws {Error} Si le fichier n'existe pas ou ne contient pas du JSON valide.
 */
function load(file) {
  var f = file || process.env.STOCK_FILE || DEFAULT_FILE;
  var raw = fs.readFileSync(f, 'utf-8');
  var data = JSON.parse(raw);
  var result = [];
  for (var i = 0; i < data.length; i++) {
    result.push(new Product(data[i].name, data[i].expiresIn, data[i].quality));
  }
  return result;
}

/**
 * Enregistre le stock dans un fichier JSON (écrase le contenu existant).
 * @param {Product[]} products - Produits à enregistrer.
 * @param {string} [file] - Chemin du fichier de stock (mêmes règles de priorité que {@link load}).
 */
function save(products, file) {
  var f = file || process.env.STOCK_FILE || DEFAULT_FILE;
  var data = [];
  for (var i = 0; i < products.length; i++) {
    data.push({ name: products[i].name, expiresIn: products[i].expiresIn, quality: products[i].quality });
  }
  fs.writeFileSync(f, JSON.stringify(data, null, 2));
}

module.exports = { load, save };

// Run with `node src/repository.js` to execute these save() tests.
if (require.main === module) {
  const assert = require('assert');
  const os = require('os');
  const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'repository-save-'));
  const originalStockFile = process.env.STOCK_FILE;

  try {
    const explicitFile = path.join(testDir, 'explicit.json');
    const environmentFile = path.join(testDir, 'environment.json');
    process.env.STOCK_FILE = environmentFile;

    save([{ name: 'Apple', expiresIn: 4, quality: 10 }], explicitFile);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(explicitFile, 'utf-8')), [
      { name: 'Apple', expiresIn: 4, quality: 10 }
    ]);
    assert.strictEqual(fs.existsSync(environmentFile), false);

    save([]);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(environmentFile, 'utf-8')), []);
  } finally {
    if (originalStockFile === undefined) delete process.env.STOCK_FILE;
    else process.env.STOCK_FILE = originalStockFile;
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}
