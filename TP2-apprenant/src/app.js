const express = require('express');
const { Inventory, Product } = require('./inventory');
const repo = require('./repository');

function createApp(options = {}) {
  const file = options.stockFile;
  const app = express();
  app.use(express.json());

  app.get('/products', (req, res) => {
    const products = repo.load(file);
    res.json(products);
  });

  app.post('/products', (req, res) => {
    const b = req.body;
    if (!b || !b.name || b.expiresIn == undefined || b.quality == undefined) {
      return res.status(400).json({ error: 'name, expiresIn et quality sont obligatoires' });
    }
    const products = repo.load(file);
    products.push(new Product(b.name, b.expiresIn, b.quality));
    repo.save(products, file);
    res.status(201).json(products[products.length - 1]);
  });

  app.post('/day/end', (req, res) => {
    const products = repo.load(file);
    const inv = new Inventory(products);
    inv.endOfDay();
    repo.save(inv.products, file);
    res.json(inv.products);
  });

  return app;
}

module.exports = { createApp };
