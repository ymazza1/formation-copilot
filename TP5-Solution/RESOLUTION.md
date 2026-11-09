# TP5 — Résolution

Résultat final : **44 tests verts**, instantané du golden master mis à jour uniquement lors de l'ajout de la règle bio.

## Étape 1 — `src/repository.js`

`Ctrl+.` sur une sélection affiche, en plus des corrections classiques de VS Code, des actions Copilot (*Modify using Copilot*, *Explain*, *Review*… selon la version). Prompt utilisé :

```text
Modernise load et save : const, map au lieu des boucles, déstructuration.
Extrais la résolution du fichier (paramètre, STOCK_FILE, défaut) dans une fonction resolveFile.
```

Nouveau contenu de **`src/repository.js`** (les JSDoc sont conservées) :

```js
function resolveFile(file) {
  return file || process.env.STOCK_FILE || DEFAULT_FILE;
}

function load(file) {
  const data = JSON.parse(fs.readFileSync(resolveFile(file), 'utf-8'));
  return data.map(({ name, expiresIn, quality }) => new Product(name, expiresIn, quality));
}

function save(products, file) {
  const data = products.map(({ name, expiresIn, quality }) => ({ name, expiresIn, quality }));
  fs.writeFileSync(resolveFile(file), JSON.stringify(data, null, 2));
}
```

Les tests d'API (`test/app.test.js`) couvrent `load` et `save` : ils restent verts.

## Étape 2 — Middleware `requireDays` dans `src/app.js`

Prompt (`Ctrl+I` sur les deux routes sélectionnées) :

```text
Ces deux routes dupliquent la validation de days. Extrais un middleware Express requireDays
qui place la valeur dans req.days ou répond 400.
```

Ajouté dans **`src/app.js`**, avant `createApp` :

```js
function requireDays(req, res, next) {
  const days = parseDays(req.query.days);
  if (days === null) {
    return res.status(400).json({ error: 'days doit être un entier positif ou nul' });
  }
  req.days = days;
  next();
}
```

Routes simplifiées :

```js
app.get('/reports/expiring', requireDays, (req, res) => {
  res.json(findExpiringProducts(repo.load(file), req.days));
});

app.get('/reports/expiring.csv', requireDays, (req, res) => {
  res
    .type('text/csv; charset=utf-8')
    .attachment(`produits-a-peremption-${req.days}j.csv`)
    .send(toCsv(findExpiringProducts(repo.load(file), req.days)));
});
```

Et dans `POST /products` : `b.expiresIn == undefined` → `b.expiresIn === undefined` (même chose pour `quality`). Attention : `==` acceptait aussi `null`. Ce changement de comportement est mineur et accepté ici, mais il faut **le décider**, pas le subir.

## Étape 3 — Refactoring de `endOfDay`

Prompt Ask :

```text
#file:src/inventory.js Liste les code smells de endOfDay, puis propose un plan de refactoring
en petites étapes sûres (chaque étape garde les tests verts). N'écris pas encore le code.
```

Smells attendus : conditions imbriquées profondes, `this.products[i]` répété, nombres magiques (50, 11, 6), chaînes de noms dupliquées, une seule méthode qui mélange toutes les règles, double négation (`!= … && !…startsWith`).

Plan retenu :

1. Remplacer `this.products[i]` par une variable locale `product`.
2. Extraire les constantes (`MAX_QUALITY`, `AGED_CHEESE`, `SOURDOUGH_STARTER`, `TASTING_TICKET_PREFIX`).
3. Extraire `increaseQuality` / `decreaseQuality` (bornes 0 et 50).
4. Extraire une fonction par type de produit.
5. Remplacer les `if` par une table de règles parcourue dans l'ordre.

Prompt Agent :

```text
Applique ce plan étape par étape sur src/inventory.js. Après chaque étape, lance npm test
et arrête-toi si un test échoue. Ne modifie aucun fichier de test. Garde l'API publique :
Product, Inventory, endOfDay modifie les produits en place et retourne this.products.
```

Cœur du nouveau **`src/inventory.js`** :

```js
const MIN_QUALITY = 0;
const MAX_QUALITY = 50;
const AGED_CHEESE = 'Comté affiné 24 mois';
const SOURDOUGH_STARTER = 'Levain mère de la maison';
const TASTING_TICKET_PREFIX = 'Billet dégustation';

function increaseQuality(product, amount) {
  if (product.quality < MAX_QUALITY) {
    product.quality = Math.min(MAX_QUALITY, product.quality + amount);
  }
}

function decreaseQuality(product, amount) {
  if (product.quality > MIN_QUALITY) {
    product.quality = Math.max(MIN_QUALITY, product.quality - amount);
  }
}

// Fait passer une journée : évolution du jour, date -1, puis effet de la péremption.
function age(product, dailyChange, expiredChange = dailyChange) {
  dailyChange(product);
  product.expiresIn -= 1;
  if (isExpired(product)) {
    expiredChange(product);
  }
}

const AGING_RULES = [
  { matches: (name) => name === SOURDOUGH_STARTER, apply: () => {} },
  { matches: (name) => name === AGED_CHEESE, apply: (product) => age(product, (p) => increaseQuality(p, 1)) },
  {
    matches: (name) => name.startsWith(TASTING_TICKET_PREFIX),
    apply: (product) => age(
      product,
      (p) => increaseQuality(p, tastingTicketIncrease(p.expiresIn)),
      (p) => { p.quality = MIN_QUALITY; }
    ),
  },
  { matches: () => true, apply: (product) => age(product, (p) => decreaseQuality(p, 1)) },
];

class Inventory {
  // ...
  endOfDay() {
    this.products.forEach((product) => findRule(product).apply(product));
    return this.products;
  }
}
```

Le piège `Math.min` : sans la garde `if (product.quality < MAX_QUALITY)`, un Comté créé avec une qualité de 60 passerait à 50 au lieu de rester à 60. Les tests unitaires ne couvrent pas ce cas, et le golden master non plus. **C'est la relecture humaine qui le repère.** C'est l'occasion d'ajouter un test, ou de faire confirmer le comportement par le métier.

Vérification de la conception : `age` rend explicite l'ordre « évolution du jour → date − 1 → effet de la péremption », qui était caché dans les `if` de l'original.

## Étape 4 — Revue de code

Remarques typiques de Copilot et décision :

| Remarque | Décision |
|---|---|
| `findRule` pourrait retourner `undefined` | Ignorer : la dernière règle (`() => true`) garantit un résultat. Un commentaire suffit |
| Les règles mutent le produit | À discuter : immutabilité plus sûre, mais l'API actuelle (modification en place) est utilisée par `simulate.js` |
| Ajouter une JSDoc à `age` | Appliqué |

Selon le plan Copilot, la revue des changements non commités dans *Source Control* peut ne pas être disponible : l'action **Review** sur une sélection fonctionne dans tous les cas.

## Étape 5 — Règle bio en TDD

**Rouge** — dans **`test/inventory.test.js`**, le test de caractérisation « produit bio traité comme standard » est remplacé par :

```js
describe('produit bio', () => {
  it('devrait perdre 2 en qualité quand la date n\'est pas dépassée', () => {
    expect(endOfDay('Jus de pomme bio', 3, 6).quality).toBe(4);
  });

  it('devrait perdre 4 en qualité quand la date est dépassée', () => {
    expect(endOfDay('Jus de pomme bio', 0, 10).quality).toBe(6);
  });

  it('ne devrait jamais rendre la qualité négative', () => {
    expect(endOfDay('Jus de pomme bio', 3, 1).quality).toBe(0);
    expect(endOfDay('Jus de pomme bio', -1, 3).quality).toBe(0);
  });

  it('devrait reconnaître « bio » quelle que soit la casse', () => {
    expect(endOfDay('Farine BIO de sarrasin', 3, 10).quality).toBe(8);
  });

  it('ne devrait pas confondre un mot contenant « bio » avec un produit bio', () => {
    expect(endOfDay('Biscuits au beurre', 3, 10).quality).toBe(9);
  });
});
```

4 tests échouent (celui sur « Biscuits » passe déjà, c'est normal : il protège d'une implémentation trop naïve).

**Vert** — ajouts dans **`src/inventory.js`** :

```js
const ORGANIC_PATTERN = /\bbio\b/i;

// dans AGING_RULES, juste avant la règle par défaut :
{
  matches: (name) => ORGANIC_PATTERN.test(name),
  apply: (product) => age(product, (p) => decreaseQuality(p, 2)),
},
```

`\b` (limite de mot) évite que « Biscuits » soit considéré comme bio ; une implémentation `name.includes('bio')` proposée par Copilot ferait échouer le dernier test. Grâce au refactoring, la nouvelle règle tient en **4 lignes** sans toucher aux autres.

**Golden master** — il échoue, car `Jus de pomme bio` est dans la simulation. Le diff montre uniquement les lignes du jus de pomme : changement voulu → `npx jest -u` met à jour `test/__snapshots__/inventory.golden-master.test.js.snap`.

**Documentation** — **`docs/regles-metier.md`** : ajout de la ligne bio au tableau, d'une section « Priorité des règles » et d'un historique.

## Le mot de la fin

Ce projet est le kata **Gilded Rose** (Emily Bache) habillé autrement : Item → Product, `sellIn` → `expiresIn`, Aged Brie → Comté affiné, Sulfuras → levain mère, Backstage passes → billets dégustation, Conjured → bio. On l'a renommé pour que Copilot ne puisse pas reconnaître le kata et réciter une solution apprise.
