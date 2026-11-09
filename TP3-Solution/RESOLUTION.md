# TP3 — Résolution

## Étape 1 — Préparer le contexte

Les complétions s'appuient principalement sur le fichier courant et les **onglets ouverts**. Garder ouverts `inventory.js` (modèle `Product`) et `app.js` (style du code) améliore la pertinence ; laisser 15 onglets ouverts la dégrade.

Commentaire d'en-tête écrit dans **`src/reports/expiringReport.js`** (nouveau fichier) :

```js
// Rapport des produits qui arrivent à péremption.
// findExpiringProducts(products, days) : garde les produits dont expiresIn est entre 0 et days inclus,
// exclut 'Levain mère de la maison' (ne périme jamais), trie par expiresIn croissant puis par nom.
```

Bonnes pratiques illustrées : **contexte** (onglets), **intention explicite** (commentaire), **petits pas** (une fonction à la fois).

## Étape 2 — `findExpiringProducts` par complétion

Code obtenu après relecture (le commentaire d'en-tête a été transformé en JSDoc) :

```js
const NEVER_EXPIRES = ['Levain mère de la maison'];

function findExpiringProducts(products, days) {
  return products
    .filter((product) => !NEVER_EXPIRES.includes(product.name))
    .filter((product) => product.expiresIn >= 0 && product.expiresIn <= days)
    .sort((a, b) => a.expiresIn - b.expiresIn || a.name.localeCompare(b.name, 'fr'));
}
```

Erreurs fréquentes dans les suggestions :
- `expiresIn < days` au lieu de `<=` (borne exclue) ;
- oubli de l'exclusion des produits périmés ;
- tri sur un seul critère ;
- `sort` appelé directement sur `products` : il **modifie le tableau d'origine**. Ici, `filter` crée d'abord une copie, donc pas de problème.

`NEVER_EXPIRES` est une constante nommée plutôt qu'une chaîne en dur : le nom exprime la règle métier.

## Étape 3 — `toCsv` et `parseDays` avec le chat en ligne

Prompt (`Ctrl+I`, curseur sous `findExpiringProducts`) :

```text
Crée toCsv(products) : séparateur ';', en-tête name;expiresIn;quality, une ligne par produit.
Entoure de guillemets une valeur qui contient ; " ou un retour à la ligne, en doublant les ".
Extrais l'échappement dans une fonction escapeCsvValue.
```

Code ajouté dans **`src/reports/expiringReport.js`** :

```js
const CSV_SEPARATOR = ';';
const CSV_HEADER = ['name', 'expiresIn', 'quality'].join(CSV_SEPARATOR);

function escapeCsvValue(value) {
  const text = String(value);
  if (/[;"\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(products) {
  const lines = products.map((product) =>
    [product.name, product.expiresIn, product.quality].map(escapeCsvValue).join(CSV_SEPARATOR)
  );
  return [CSV_HEADER, ...lines].join('\n') + '\n';
}
```

Prompt pour `parseDays` :

```text
Crée parseDays(raw, defaultDays = 3) : retourne defaultDays si raw est undefined,
le nombre si raw ne contient que des chiffres, sinon null.
```

```js
function parseDays(raw, defaultDays = 3) {
  if (raw === undefined) {
    return defaultDays;
  }
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  return Number(raw);
}

module.exports = { findExpiringProducts, toCsv, parseDays };
```

Piège classique : `parseInt('3abc')` vaut `3` et `Number('')` vaut `0`. L'expression régulière évite ces conversions silencieuses.

## Étape 4 — Routes dans `src/app.js`

Prompt (vue Chat, Ask, avec `#file:src/app.js #file:src/reports/expiringReport.js`) :

```text
Ajoute dans createApp les routes GET /reports/expiring et GET /reports/expiring.csv.
Utilise parseDays (400 si null), repo.load(file) et findExpiringProducts.
Pour le CSV, utilise toCsv, le type text/csv et le nom de fichier produits-a-peremption-<days>j.csv.
```

Modifications de **`src/app.js`** :

```js
// en haut du fichier
const { findExpiringProducts, toCsv, parseDays } = require('./reports/expiringReport');

// dans createApp, avant `return app;`
app.get('/reports/expiring', (req, res) => {
  const days = parseDays(req.query.days);
  if (days === null) {
    return res.status(400).json({ error: 'days doit être un entier positif ou nul' });
  }
  res.json(findExpiringProducts(repo.load(file), days));
});

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
```

`res.attachment()` positionne l'en-tête `Content-Disposition` qui déclenche le téléchargement. La duplication de la validation entre les deux routes est volontairement laissée : elle servira au TP5.

## Étape 5 — Documentation en mode Agent

Prompt (mode Agent) :

```text
Ajoute GET /reports/expiring et GET /reports/expiring.csv à docs/api.md,
dans le même format que les routes existantes, avant la section « Limites connues ».
```

L'agent lit `app.js` et `api.md`, propose la modification, et on la garde avec *Keep*. Voir `docs/api.md` de ce dossier.

Ce qui distingue l'agent : il **choisit lui-même** les fichiers à lire et à modifier. C'est puissant mais il faut relire chaque fichier modifié.

## Étape 6 — Résultat attendu

```text
GET /reports/expiring?days=7
[{"name":"Baguette tradition","expiresIn":1,"quality":10},
 {"name":"Comté affiné 24 mois","expiresIn":2,"quality":0},
 {"name":"Jus de pomme bio","expiresIn":3,"quality":6},
 {"name":"Billet dégustation - Chocolats grands crus","expiresIn":5,"quality":49},
 {"name":"Yaourt fermier","expiresIn":7,"quality":20}]
```

Le levain mère (`expiresIn: 0`) est bien exclu malgré sa date dans l'intervalle.
