# TP5 — Refactoriser et améliorer le code avec GitHub Copilot

**Durée indicative : 45 min**

## Contexte

Le filet de sécurité est en place (TP4). Vous pouvez enfin assainir le code legacy, puis livrer la règle **bio** : les produits bio perdent en qualité deux fois plus vite que les produits standard.

> Règle d'or : lancez `npm run test:watch` dans un terminal dédié et gardez-le visible. **Après chaque modification, les tests doivent rester verts.** S'ils passent au rouge, annulez plutôt que de corriger à l'aveugle.

## Étape 1 — Corrections rapides sur `src/repository.js`

1. Sélectionnez la fonction `load`, puis `Ctrl+.` : repérez les actions Copilot proposées dans le menu des actions rapides.
2. Utilisez-les (ou `Ctrl+I`) pour moderniser `load` et `save` : `const` au lieu de `var`, `map` au lieu des boucles `for`, déstructuration.
3. Supprimez la duplication de `file || process.env.STOCK_FILE || DEFAULT_FILE`.

## Étape 2 — Refactoriser avec le chat en ligne : `src/app.js`

1. Les routes `/reports/expiring` et `/reports/expiring.csv` dupliquent la validation de `days`. Sélectionnez les deux routes et demandez, avec `Ctrl+I`, d'extraire un **middleware Express** `requireDays`.
2. Corrigez au passage les comparaisons `== undefined` de `POST /products`.

## Étape 3 — Refactoriser `endOfDay` avec la vue Chat

1. **Mode Ask** : demandez à Copilot d'identifier les *code smells* de `endOfDay` et de proposer un plan de refactoring **en petites étapes**, sans écrire le code complet. Choisissez une conception : une règle de vieillissement par type de produit.
2. **Mode Agent** : faites exécuter le plan étape par étape, en exigeant que `npm test` soit lancé après chaque étape. Contraintes à donner :
   - ne pas modifier les tests ;
   - conserver l'API publique (`Product`, `Inventory`, `endOfDay` qui modifie les produits en place et retourne le tableau) ;
   - nommer les constantes métier (`MAX_QUALITY`, noms de produits…).
3. Relisez le résultat : le golden master est-il **toujours vert sans avoir été mis à jour** ?

> ⚠️ Un piège à surveiller : `Math.min(50, quality + 1)` n'est **pas** équivalent au code d'origine pour un produit dont la qualité dépasse déjà 50. Vos tests le détectent-ils ?

## Étape 4 — Revue de code

1. Dans la vue *Source Control*, ou via l'action intelligente **Review** sur `src/inventory.js`, demandez une revue de code par Copilot.
2. Classez les remarques : à appliquer, à discuter, à ignorer. Appliquez au moins une remarque pertinente.

## Étape 5 — Livrer la règle bio en TDD

1. **Rouge** : dans `test/inventory.test.js`, remplacez le test « produit bio traité comme standard » par un `describe('produit bio')` : −2 par jour, −4 après la date, jamais négatif, « BIO » en majuscules reconnu, « Biscuits » **non** reconnu. Vérifiez que ces tests échouent.
2. **Vert** : implémentez la règle avec Copilot, avec le moins de code possible.
3. Le golden master échoue : c'est **attendu**, le comportement a changé volontairement. Relisez le diff de l'instantané, puis mettez-le à jour avec `npx jest -u`.
4. Mettez à jour `docs/regles-metier.md`.

## Livrable

- `src/inventory.js` refactorisé avec la règle bio, `src/app.js` avec `requireDays`, `src/repository.js` modernisé.
- Tests verts, instantané mis à jour, documentation à jour.

## Pour aller plus loin

Ce code est inspiré du kata **Gilded Rose** d'Emily Bache. Entraînez-vous sur l'original, dans le langage de votre choix : `github.com/emilybache/GildedRose-Refactoring-Kata`.
