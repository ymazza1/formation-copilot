# TP3 — Développer une fonctionnalité avec GitHub Copilot

**Durée indicative : 40 min**

## Contexte

Chaque matin, le responsable veut savoir quels produits arrivent à péremption pour les mettre en promotion. Il veut les consulter dans l'API **et** les ouvrir dans Excel.

> 🛑 Règle d'équipe : `src/inventory.js` n'est pas encore testé, on **n'y touche pas**. La nouvelle fonctionnalité est développée dans un module séparé.

## Spécification

**`GET /reports/expiring?days=N`**
- Retourne les produits dont `expiresIn` est compris entre `0` et `N` (inclus).
- Exclut les produits déjà périmés (`expiresIn < 0`) et le `Levain mère de la maison` (il ne périme jamais).
- Tri : `expiresIn` croissant, puis nom alphabétique.
- `days` vaut **3 par défaut** ; s'il n'est pas un entier ≥ 0, répondre **400** avec un message d'erreur.

**`GET /reports/expiring.csv?days=N`**
- Même contenu au format CSV : séparateur `;`, ligne d'en-tête `name;expiresIn;quality`.
- Une valeur contenant `;`, `"` ou un retour à la ligne est entourée de guillemets (les `"` sont doublés).
- Le navigateur doit proposer de télécharger le fichier `produits-a-peremption-<N>j.csv`.

## Étape 1 — Préparer le contexte (bonnes pratiques)

1. Créez le fichier vide `src/reports/expiringReport.js`.
2. Ouvrez dans des onglets **seulement** les fichiers utiles : `src/inventory.js`, `src/app.js`, `src/reports/expiringReport.js`. Fermez les autres.
3. Écrivez en haut du nouveau fichier un commentaire qui résume la spécification de `findExpiringProducts` (entrées, sortie, exclusions, tri).

## Étape 2 — Générer du code avec les complétions

1. Sous le commentaire, tapez la signature `function findExpiringProducts(products, days) {` et laissez Copilot compléter. Acceptez avec `Tab`, ou mot par mot avec `Ctrl+→`.
2. Utilisez `Alt+]` / `Alt+[` (ou le survol de la suggestion) pour comparer plusieurs propositions.
3. Relisez : les produits périmés et le levain sont-ils exclus ? Le tri est-il complet ?

## Étape 3 — Générer du code avec le chat en ligne

1. Dans le même fichier, utilisez `Ctrl+I` pour générer `toCsv(products)` en respectant la spécification CSV (y compris l'échappement).
2. Générez de la même façon `parseDays(raw)` qui retourne la valeur par défaut, un nombre, ou `null` si la valeur est invalide.
3. Exportez les trois fonctions.

## Étape 4 — Brancher les routes avec la vue Chat

1. Vue Chat, mode **Ask** : demandez comment ajouter les deux routes dans `src/app.js` en réutilisant `repo.load(file)` et les fonctions du module. Appliquez la proposition avec le bouton *Apply*.
2. Relisez le diff avant d'accepter.

## Étape 5 — Faire compléter la documentation par le mode Agent

Vue Chat, mode **Agent** : demandez d'ajouter les deux nouvelles routes à `docs/api.md`, dans le même format que les routes existantes. Observez les fichiers lus et modifiés par l'agent, puis acceptez ou refusez (*Keep* / *Undo*).

## Étape 6 — Tester manuellement

```bash
npm start
curl "http://localhost:3000/reports/expiring?days=7"
curl "http://localhost:3000/reports/expiring?days=abc"     # 400 attendu
curl -OJ "http://localhost:3000/reports/expiring.csv?days=7"
```

Avec le stock fourni, `days=7` doit renvoyer 5 produits, de la baguette (1 jour) au yaourt (7 jours). Si vous avez appelé `POST /day/end` entre-temps, le stock a vieilli : restaurez-le avec `git checkout data/stock.json`.

## Livrable

- `src/reports/expiringReport.js` (`findExpiringProducts`, `toCsv`, `parseDays`).
- Deux nouvelles routes dans `src/app.js`, `docs/api.md` à jour.
- `npm run simulate` produit toujours la même sortie (le cœur métier n'a pas bougé).
