const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { createApp } = require('../src/app');

describe('API epicerie-stock', () => {
  let stockFile;
  let app;

  beforeEach(() => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'epicerie-'));
    stockFile = path.join(dir, 'stock.json');
    fs.writeFileSync(
      stockFile,
      JSON.stringify([
        { name: 'Yaourt fermier', expiresIn: 2, quality: 10 },
        { name: 'Levain mère de la maison', expiresIn: 0, quality: 80 },
      ])
    );
    app = createApp({ stockFile });
  });

  const readStock = () => JSON.parse(fs.readFileSync(stockFile, 'utf-8'));

  it('GET /products devrait lister le stock', async () => {
    const res = await request(app).get('/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('POST /products devrait ajouter un produit et le persister', async () => {
    const res = await request(app)
      .post('/products')
      .send({ name: 'Beurre demi-sel', expiresIn: 20, quality: 30 });

    expect(res.status).toBe(201);
    expect(readStock()).toHaveLength(3);
  });

  it('POST /products devrait répondre 400 quand un champ manque', async () => {
    const res = await request(app).post('/products').send({ name: 'Beurre' });

    expect(res.status).toBe(400);
    expect(readStock()).toHaveLength(2);
  });

  it('POST /day/end devrait faire vieillir et persister le stock', async () => {
    const res = await request(app).post('/day/end');

    expect(res.status).toBe(200);
    expect(readStock()[0]).toEqual({ name: 'Yaourt fermier', expiresIn: 1, quality: 9 });
  });

  it('GET /reports/expiring devrait retourner les produits proches de la péremption', async () => {
    const res = await request(app).get('/reports/expiring?days=2');

    expect(res.status).toBe(200);
    expect(res.body.map((p) => p.name)).toEqual(['Yaourt fermier']);
  });

  it('GET /reports/expiring devrait répondre 400 quand days est invalide', async () => {
    const res = await request(app).get('/reports/expiring?days=abc');

    expect(res.status).toBe(400);
  });

  it('GET /reports/expiring.csv devrait renvoyer un fichier CSV à télécharger', async () => {
    const res = await request(app).get('/reports/expiring.csv?days=2');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toContain('produits-a-peremption-2j.csv');
    expect(res.text).toBe('name;expiresIn;quality\nYaourt fermier;2;10\n');
  });
});
