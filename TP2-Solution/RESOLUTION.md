# TP2 — Résolution

## Étape 1 — Vue d'ensemble

Prompt proposé (vue Chat, mode Ask) :

```text
#codebase Donne une vue d'ensemble de ce projet : rôle de chaque fichier de src/ et scripts/,
puis décris pas à pas ce qui se passe lors d'un appel à POST /day/end.
```

Réponse attendue (à vérifier) : `server.js` démarre l'app → `app.js` reçoit la requête → `repository.load()` lit `data/stock.json` → `Inventory.endOfDay()` applique les règles → `repository.save()` réécrit le fichier → la réponse contient les produits mis à jour.

Pourquoi `#codebase` : sans lui, Copilot ne voit que le fichier ouvert et risque d'inventer la structure du projet.

## Étape 2 — Expliquer et extraire les règles

1. Sélection de `endOfDay` → clic droit → *Copilot* → *Explain*. Équivalent : `Ctrl+I` puis `/explain`.
2. Prompt d'extraction :

```text
#file:src/inventory.js Extrais les règles métier de endOfDay sous forme de tableau Markdown :
une ligne par type de produit, colonnes « avant la date » et « date dépassée ».
Précise pour chaque seuil s'il s'applique avant ou après la décrémentation de expiresIn.
```

3. Vérification avec `npm run simulate -- 15`. Imprécisions fréquentes de Copilot :

| Affirmation fréquente | Réalité observée dans le code |
|---|---|
| « La qualité ne dépasse jamais 50 » | Faux pour le levain mère (80) ; et seules les **augmentations** sont plafonnées |
| « Les billets prennent +2 à moins de 10 jours » | +2 dès **10 jours** (`expiresIn < 11` avant décrémentation) |
| « Les produits bio se dégradent deux fois plus vite » | Faux : aucune règle bio dans le code (Copilot extrapole depuis le nom) |
| « Après la date, la qualité baisse de 2 » | Vrai pour les produits standard, mais le Comté **augmente** de 2 |

C'est le message clé du module : **Copilot explique de façon plausible, pas forcément exacte**. La simulation (et plus tard les tests) fait foi.

## Étape 3 — `docs/regles-metier.md` (nouveau fichier)

Voir le fichier `docs/regles-metier.md` de ce dossier. Prompt utilisé :

```text
À partir du tableau de règles vérifié ci-dessus, rédige docs/regles-metier.md avec :
un vocabulaire (expiresIn, quality, endOfDay), les règles générales, un tableau par produit,
et une section « Demande métier en attente » pour les produits bio (non implémentée).
```

## Étape 4 — JSDoc

Pour chaque élément : sélection → `Ctrl+I` → `/doc`, puis relecture.

Modifications dans **`src/inventory.js`** (commentaires uniquement) :

```js
/**
 * Produit en stock dans l'épicerie.
 */
class Product {
  /**
   * @param {string} name - Nom du produit. Certaines règles métier dépendent du nom exact ou de son préfixe.
   * @param {number} expiresIn - Nombre de jours restant avant la date de péremption (négatif si dépassée).
   * @param {number} quality - Qualité du produit, entre 0 et 50 (80 pour le levain mère).
   */
```

et une JSDoc sur `Inventory`, son constructeur et `endOfDay` (résumé des règles + `@returns`).

Dans **`src/repository.js`** : JSDoc de `load` (ordre de priorité du fichier, `@throws` si fichier absent ou JSON invalide) et de `save`.

Dans **`src/app.js`** : JSDoc de `createApp` (`@param options.stockFile`, `@returns`) et un commentaire d'une ligne par route.

Vérification : `git diff` ne montre que des lignes de commentaires, et `npm run simulate` produit la même sortie qu'avant.

Point de vigilance : Copilot génère souvent `@throws` ou des types optimistes ; ici `load` lève bien une exception (`readFileSync` / `JSON.parse`), mais il n'y a **aucune validation** des types dans `POST /products`.

## Étape 5 — `README.md` et `docs/api.md`

Prompt utilisé (vue Chat) :

```text
#codebase Remplace README.md par une vraie documentation : description, prérequis, installation,
commandes npm (lis package.json), variable STOCK_FILE, structure des dossiers, liens vers docs/.
```

puis :

```text
#file:src/app.js Rédige docs/api.md : pour chaque route, méthode, URL, corps, codes de réponse
et un exemple curl. Ajoute une section « Limites connues ».
```

Voir `README.md` et `docs/api.md` de ce dossier. Les exemples `curl` ont été testés avec `npm start`.

Astuce : en mode **Agent**, un seul prompt peut créer les deux fichiers ; en mode **Ask**, on copie la réponse ou on utilise le bouton *Apply* / *Insert into new file*.
