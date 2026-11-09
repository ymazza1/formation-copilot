# epicerie-stock

API de gestion de stock d'une épicerie fine. Chaque fin de journée, le stock « vieillit » : les dates de péremption avancent et la qualité des produits évolue selon des règles métier propres à chaque type de produit.

## Prérequis

- Node.js 20 ou plus
- npm

## Installation

```bash
npm install
```

## Utilisation

| Commande | Rôle |
|---|---|
| `npm start` | Démarre l'API sur `http://localhost:3000` (port modifiable avec `PORT`) |
| `npm run simulate -- 10` | Affiche l'évolution d'un stock d'exemple sur 10 jours |
| `npm test` | Lance les tests Jest |

Le stock est lu et écrit dans `data/stock.json`. La variable d'environnement `STOCK_FILE` permet d'utiliser un autre fichier.

## Structure

```
src/
  inventory.js    Cœur métier : Product, Inventory et les règles de fin de journée (legacy)
  repository.js   Lecture / écriture du stock dans un fichier JSON
  app.js          Routes Express
  server.js       Point d'entrée
scripts/
  simulate.js     Simulation du vieillissement sur N jours
data/
  stock.json      Stock courant
docs/
  api.md          Description des routes
  regles-metier.md  Règles de vieillissement des produits
```

## Documentation

- [Routes de l'API](docs/api.md)
- [Règles métier](docs/regles-metier.md)

## Avertissement

`src/inventory.js` est du code legacy sans tests. Ne le modifiez pas avant d'avoir posé des tests qui couvrent son comportement actuel.
