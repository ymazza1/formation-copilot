# TP4 — Développer des tests unitaires avec GitHub Copilot

**Durée indicative : 35 min**

## Contexte

Le métier confirme la demande du TP2 : les produits **bio** doivent se dégrader deux fois plus vite. Pour l'implémenter, il faudra toucher à `src/inventory.js`… et la règle d'équipe l'interdit tant que ce code n'est pas testé.

Objectif de ce TP : poser un **filet de sécurité** complet avant le refactoring du TP5.

## Étape 1 — Préparer l'environnement de test

1. Ouvrez `package.json` : Jest et Supertest sont déjà installés.
2. Demandez à Copilot (vue Chat, Ask) comment configurer Jest pour un projet Node, puis ajoutez :
   - la configuration `"jest": { "testEnvironment": "node" }` ;
   - les scripts `test` (sans `--passWithNoTests`), `test:watch` et `test:coverage`.
3. Créez le dossier `test/`.

## Étape 2 — Action intelligente « Generate Tests »

1. Dans `src/reports/expiringReport.js`, sélectionnez `findExpiringProducts` puis lancez l'action **Generate Tests** (clic droit → Copilot).
2. Vérifiez que le fichier généré s'appelle `test/expiringReport.test.js` et respecte les conventions de `.github/copilot-instructions.md`.
3. Lancez `npm test`. Corrigez ce qui ne passe pas **en vous demandant d'abord qui a raison : le test ou le code ?**
4. Complétez avec des tests de `toCsv` : liste vide, une ligne, valeur avec `;`, valeur avec `"`.

## Étape 3 — Chat en ligne dans le fichier de test

Dans `test/expiringReport.test.js`, utilisez `Ctrl+I` pour générer les tests de `parseDays` avec `it.each` : valeur absente, `'0'`, `'12'`, et les valeurs invalides `''`, `'abc'`, `'-1'`, `'2.5'`, `'3abc'`.

## Étape 4 — Vue Chat (Ask) : tests de caractérisation du legacy

1. Demandez d'abord à Copilot **la liste des cas de test** à écrire pour couvrir toutes les branches de `endOfDay`, sans écrire de code.
2. Comparez avec `docs/regles-metier.md` et complétez la liste si besoin (limites à 0, 50, 10 jours, 5 jours, date dépassée…).
3. Faites générer `test/inventory.test.js` : un `describe` par type de produit, un test par comportement.
4. Ajoutez un **golden master** : `test/inventory.golden-master.test.js` qui exécute `scripts/simulate.js` sur 30 jours et compare la sortie à un instantané Jest (`toMatchSnapshot`).

## Étape 5 — Mode Agent : tests de l'API

En mode **Agent**, demandez de créer `test/app.test.js` avec Supertest pour toutes les routes, en utilisant un **fichier de stock temporaire** (jamais `data/stock.json`). Laissez l'agent lancer les tests et corriger ses erreurs. Observez les commandes qu'il vous demande d'autoriser.

## Étape 6 — Vérifier le filet de sécurité

1. `npm run test:coverage` : `src/inventory.js` doit être couvert à 100 % des lignes.
2. **Testez vos tests** : dans `src/inventory.js`, remplacez temporairement `< 11` par `< 10`. Au moins un test doit échouer. Annulez la modification.

## Livrable

- `test/expiringReport.test.js`, `test/inventory.test.js`, `test/inventory.golden-master.test.js` (+ son dossier `__snapshots__`), `test/app.test.js`.
- `npm test` est vert ; `src/inventory.js` n'a pas été modifié.
