const express = require('express');
const { Inventory, Product } = require('./inventory');
const repo = require('./repository');
const { findExpiringProducts, toCsv, parseDays } = require('./reports/expiringReport');

/**
 * Crée l'application Express de l'API de stock.
 * @param {object} [options]
 * @param {string} [options.stockFile] - Fichier de stock à utiliser (utile pour les tests).
 * @returns {import('express').Express} L'application, prête à être démarrée avec `listen`.
 */
function createApp(options = {}) {
  const file = options.stockFile;
  const app = express();
  app.use(express.json());

  // Liste tous les produits en stock.
  app.get('/products', (req, res) => {
    const products = repo.load(file);
    res.json(products);
  });

  // Ajoute un produit ; name, expiresIn et quality sont obligatoires.
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

  // Déclenche le vieillissement de fin de journée et enregistre le résultat.
  app.post('/day/end', (req, res) => {
    const products = repo.load(file);
    const inv = new Inventory(products);
    inv.endOfDay();
    repo.save(inv.products, file);
    res.json(inv.products);
  });

  // Rapport des produits qui arrivent à péremption dans les `days` prochains jours (3 par défaut).
  app.get('/reports/expiring', (req, res) => {
    const days = parseDays(req.query.days);
    if (days === null) {
      return res.status(400).json({ error: 'days doit être un entier positif ou nul' });
    }
    res.json(findExpiringProducts(repo.load(file), days));
  });

  // Même rapport, au format CSV.
  app.get('/reports/expiring.csv', (req, res) => {
    const days = parseDays(req.query.days);
    if (days === null) {
      return res.status(400).json({ error: 'days doit être un entier positif ou nul' });
    }
    res
      .type('text/csv; charset=utf-8')
      .attachment(`produits-a-peremption-${days}j.csv`)
      .send(toCsv(findExpiringProducts(repo.load(file), days)));
  });

  return app;
}

module.exports = { createApp };
