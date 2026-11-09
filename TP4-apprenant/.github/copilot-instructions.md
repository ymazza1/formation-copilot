# Instructions Copilot pour le projet epicerie-stock

## Contexte
- API Node.js (CommonJS) + Express de gestion de stock d'une épicerie fine.
- Le cœur métier est `src/inventory.js` : c'est du code legacy, ne le modifie pas sans tests qui couvrent son comportement.

## Conventions de code
- Code (noms de variables, fonctions, classes) en anglais ; commentaires, documentation et messages d'erreur en français.
- Utilise `const` / `let`, jamais `var`.
- Préfère des fonctions courtes et pures ; isole les effets de bord (fichiers, HTTP) aux bords de l'application.
- N'ajoute pas de nouvelle dépendance npm sans le signaler explicitement.

## Tests
- Framework : Jest. Les tests sont dans `test/` et se nomment `*.test.js`.
- Un test = un comportement. Nom du test en français, sous la forme « devrait ... quand ... ».
- Structure Arrange / Act / Assert.

## Réponses
- Réponds en français.
- Quand tu proposes une modification, explique brièvement pourquoi.
