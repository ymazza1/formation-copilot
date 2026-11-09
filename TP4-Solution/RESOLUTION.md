# TP4 — Résolution

Résultat final : **4 fichiers de test, 40 tests**, tous verts. Couverture des lignes : 100 % sur `inventory.js` et `expiringReport.js`.

## Étape 1 — Configuration de Jest

Modifications de **`package.json`** :

```json
"scripts": {
  "start": "node src/server.js",
  "simulate": "node scripts/simulate.js",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
},
"jest": {
  "testEnvironment": "node"
}
```

- `testEnvironment: node` : pas de DOM simulé, inutile pour une API.
- On retire `--passWithNoTests` : désormais, l'absence de tests doit être une erreur.
- Selon la version, la commande `/setupTests` du chat peut proposer cette configuration automatiquement.

## Étape 2 — « Generate Tests » sur `findExpiringProducts`

L'action crée (ou propose) `test/expiringReport.test.js`. Points à corriger fréquemment :

- import avec `import … from` (ESM) alors que le projet est en CommonJS → remplacer par `require` ;
- objets littéraux `{ name, expiresIn, quality }` au lieu de `new Product(...)` : ça marche, mais on préfère le vrai modèle ;
- noms de tests en anglais malgré les instructions → le préciser à nouveau dans le prompt.

Tests retenus (extrait du fichier **`test/expiringReport.test.js`**) :

```js
const { Product } = require('../src/inventory');
const { findExpiringProducts, toCsv, parseDays } = require('../src/reports/expiringReport');

describe('findExpiringProducts', () => {
  it('devrait garder les produits dont la date est entre 0 et days inclus', () => {
    const products = [new Product('A', 0, 1), new Product('B', 3, 1), new Product('C', 4, 1)];

    const result = findExpiringProducts(products, 3);

    expect(result.map((p) => p.name)).toEqual(['A', 'B']);
  });
  // + périmés exclus, levain exclu, tri date puis nom, tableau d'origine non modifié
});

describe('toCsv', () => {
  it('devrait doubler les guillemets d\'une valeur', () => {
    expect(toCsv([new Product('Le "vrai" beurre', 2, 10)])).toContain('"Le ""vrai"" beurre";2;10');
  });
  // + liste vide, une ligne, valeur avec ;
});
```

Le test « ne devrait pas modifier le tableau d'origine » protège contre une régression classique : un futur `products.sort(...)` sans `filter` préalable.

## Étape 3 — `parseDays` avec `it.each`

Prompt (`Ctrl+I` en bas du fichier de test) :

```text
Ajoute un describe parseDays : défaut 3 si undefined, valeur personnalisée,
'0' et '12' convertis, et null pour '', 'abc', '-1', '2.5', '3abc' avec it.each.
```

```js
describe('parseDays', () => {
  it('devrait retourner la valeur par défaut quand le paramètre est absent', () => {
    expect(parseDays(undefined)).toBe(3);
    expect(parseDays(undefined, 7)).toBe(7);
  });

  it('devrait convertir un entier positif ou nul', () => {
    expect(parseDays('0')).toBe(0);
    expect(parseDays('12')).toBe(12);
  });

  it.each(['', 'abc', '-1', '2.5', '3abc'])('devrait retourner null pour « %s »', (raw) => {
    expect(parseDays(raw)).toBeNull();
  });
});
```

`it.each` évite de copier-coller cinq tests identiques : un cas = une ligne de données.

## Étape 4 — Caractérisation de `endOfDay`

Prompt 1 (Ask, `#file:src/inventory.js #file:docs/regles-metier.md`) :

```text
Liste, sans écrire de code, les cas de test nécessaires pour couvrir toutes les branches
de endOfDay, en incluant les valeurs limites (qualité 0 et 50, billets à 11, 10, 6, 5, 1 et 0 jours).
```

Prompt 2 :

```text
Écris test/inventory.test.js à partir de cette liste. Utilise un helper endOfDay(name, expiresIn, quality)
qui retourne le produit vieilli d'un jour. Un describe par type de produit.
```

Fichier **`test/inventory.test.js`** (nouveau, 17 tests) — structure :

```js
function endOfDay(name, expiresIn, quality) {
  const inventory = new Inventory([new Product(name, expiresIn, quality)]);
  return inventory.endOfDay()[0];
}

describe('Inventory.endOfDay', () => {
  describe('produit standard', () => { /* -1, -2 après la date, jamais < 0, bio = standard */ });
  describe('Comté affiné 24 mois', () => { /* +1, +2 après la date, plafond 50 */ });
  describe('Levain mère de la maison', () => { /* rien ne change, même périmé */ });
  describe('Billet dégustation', () => { /* +1 (11 j), +2 (10 et 6 j), +3 (5 et 1 j), 0 après, plafond 50, préfixe */ });
  it('devrait faire vieillir tous les produits du stock', () => { /* ... */ });
});
```

Le test « devrait traiter un produit bio comme un produit standard » documente le **comportement actuel**. Au TP5, il sera remplacé par la nouvelle règle : c'est normal qu'un test de caractérisation change quand le besoin change.

Fichier **`test/inventory.golden-master.test.js`** (nouveau) :

```js
const { execFileSync } = require('child_process');
const path = require('path');

describe('Golden master de la simulation', () => {
  it('devrait produire la même sortie sur 30 jours', () => {
    const script = path.join(__dirname, '..', 'scripts', 'simulate.js');

    const output = execFileSync('node', [script, '30'], { encoding: 'utf-8' });

    expect(output).toMatchSnapshot();
  });
});
```

Le premier `npm test` crée `test/__snapshots__/inventory.golden-master.test.js.snap` : **il faut le versionner**. Les tests unitaires disent *pourquoi* un comportement a changé ; le golden master garantit que *rien* n'a changé.

## Étape 5 — Tests d'API en mode Agent

Prompt (mode Agent) :

```text
Crée test/app.test.js avec supertest pour toutes les routes de src/app.js.
Chaque test utilise un fichier de stock temporaire créé dans os.tmpdir() et passé à createApp({ stockFile }).
Ne touche jamais à data/stock.json. Lance npm test et corrige jusqu'à ce que tout passe.
```

L'agent demande l'autorisation d'exécuter `npm test` dans le terminal, lit l'erreur éventuelle et corrige. Fichier obtenu : **`test/app.test.js`** (7 tests), dont :

```js
beforeEach(() => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'epicerie-'));
  stockFile = path.join(dir, 'stock.json');
  fs.writeFileSync(stockFile, JSON.stringify([
    { name: 'Yaourt fermier', expiresIn: 2, quality: 10 },
    { name: 'Levain mère de la maison', expiresIn: 0, quality: 80 },
  ]));
  app = createApp({ stockFile });
});

it('POST /day/end devrait faire vieillir et persister le stock', async () => {
  const res = await request(app).post('/day/end');

  expect(res.status).toBe(200);
  expect(readStock()[0]).toEqual({ name: 'Yaourt fermier', expiresIn: 1, quality: 9 });
});
```

C'est l'option `stockFile` de `createApp` (présente depuis le début) qui rend l'API testable sans toucher aux vraies données : une **injection de dépendance** minimale.

Mode Édition : il apparaît encore dans le programme officiel mais a été déprécié dans VS Code 1.111. Le mode Agent couvre ses usages.

## Étape 6 — Vérification

```text
npm run test:coverage
inventory.js      | 100 | 97.14 | 100 | 100
expiringReport.js | 100 |   100 | 100 | 100
```

Mutation manuelle : remplacer `expiresIn < 11` par `expiresIn < 10` fait échouer « devrait gagner 2 en qualité entre 10 et 6 jours » **et** le golden master. Le filet est en place : on peut refactoriser.

Ce réflexe s'appelle le **test de mutation** ; des outils comme Stryker l'automatisent.
