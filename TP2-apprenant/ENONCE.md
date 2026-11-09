# TP2 — Analyser et documenter du code avec GitHub Copilot

**Durée indicative : 40 min**

## Contexte

Le responsable de l'épicerie vous demande : « Quelles sont exactement les règles de vieillissement des produits ? ». Personne ne sait répondre sans lire le code. Votre mission : comprendre le projet et le documenter, **sans modifier son comportement**.

## Étape 1 — Comprendre le projet dans son ensemble

1. Vue Chat, mode **Ask**. Demandez une vue d'ensemble du projet en utilisant `#codebase` : rôle de chaque fichier, flux d'une requête `POST /day/end`.
2. Comparez la réponse avec le code : tous les fichiers cités existent-ils ? Les routes sont-elles correctes ?

## Étape 2 — Expliquer le cœur métier

1. Sélectionnez la méthode `endOfDay` dans `src/inventory.js` et utilisez l'action intelligente **Explain** (ou `/explain`).
2. Demandez ensuite, dans la vue Chat, d'extraire les règles métier sous forme de **tableau par type de produit**.
3. **Vérifiez chaque règle** avec la simulation : `npm run simulate -- 15`. Notez au moins une affirmation de Copilot qui était imprécise ou fausse.

> 💡 Pistes de vérification : la qualité peut-elle dépasser 50 ? Que se passe-t-il exactement à 10 jours d'un événement ? Le jus de pomme bio a-t-il un traitement particulier ?

## Étape 3 — Documenter les règles métier

Créez `docs/regles-metier.md` avec l'aide de Copilot : vocabulaire, règles générales, tableau par produit. N'y mettez que des règles que vous avez **vérifiées**.

Information du métier à ajouter : *« Les produits bio doivent perdre en qualité deux fois plus vite. Ce n'est pas encore développé. »*

## Étape 4 — Documenter le code (documentation en ligne)

1. Avec l'action **Generate Docs** (ou `/doc` dans le chat en ligne), ajoutez une JSDoc à `Product`, `Inventory`, `endOfDay`, `load`, `save` et `createApp`.
2. Relisez chaque commentaire : type des paramètres, valeur de retour, cas d'erreur (`load` sur un fichier absent ?).
3. Vérifiez que **seuls des commentaires** ont été ajoutés : `git diff` ou la vue *Source Control*.

## Étape 5 — Documenter le projet

1. Remplacez le `README.md` (actuellement « TODO ») : description, prérequis, installation, commandes, structure, liens vers la documentation.
2. Créez `docs/api.md` décrivant chaque route : méthode, URL, corps attendu, codes de réponse, exemple `curl`.

> Testez vos exemples `curl` avec `npm start` dans un terminal.

## Livrable

- `README.md`, `docs/regles-metier.md`, `docs/api.md`.
- JSDoc dans `src/inventory.js`, `src/repository.js`, `src/app.js`.
- `npm run simulate` produit **exactement** la même sortie qu'avant le TP.
