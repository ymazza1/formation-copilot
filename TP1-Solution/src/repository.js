const fs = require('fs');
const path = require('path');
const { Product } = require('./inventory');

const DEFAULT_FILE = path.join(__dirname, '..', 'data', 'stock.json');

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

function save(products, file) {
  var f = file || process.env.STOCK_FILE || DEFAULT_FILE;
  var data = [];
  for (var i = 0; i < products.length; i++) {
    data.push({ name: products[i].name, expiresIn: products[i].expiresIn, quality: products[i].quality });
  }
  fs.writeFileSync(f, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
