# API — epicerie-stock

URL de base : `http://localhost:3000`. Tous les corps de requête et de réponse sont en JSON.

## Modèle `Product`

```json
{ "name": "Yaourt fermier", "expiresIn": 7, "quality": 20 }
```

## `GET /products`

Liste les produits en stock.

- **200** : tableau de `Product`.

```bash
curl http://localhost:3000/products
```

## `POST /products`

Ajoute un produit au stock.

- Corps : un `Product` (les trois champs sont obligatoires).
- **201** : le produit créé.
- **400** : `{ "error": "name, expiresIn et quality sont obligatoires" }` si un champ manque.

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Beurre demi-sel","expiresIn":20,"quality":30}'
```

## `POST /day/end`

Applique les règles de fin de journée (voir [règles métier](regles-metier.md)) et enregistre le stock.

- **200** : tableau des produits mis à jour.

```bash
curl -X POST http://localhost:3000/day/end
```

## `GET /reports/expiring?days=N`

Liste les produits qui arrivent à péremption dans les `N` prochains jours (`expiresIn` entre 0 et `N`), triés par date puis par nom. Les produits déjà périmés et le levain mère sont exclus.

- `days` : entier ≥ 0, **3 par défaut**.
- **200** : tableau de `Product`.
- **400** : `{ "error": "days doit être un entier positif ou nul" }`.

```bash
curl "http://localhost:3000/reports/expiring?days=7"
```

## `GET /reports/expiring.csv?days=N`

Même rapport au format CSV (séparateur `;`, en-tête `name;expiresIn;quality`), téléchargé sous le nom `produits-a-peremption-Nj.csv`.

```bash
curl -OJ "http://localhost:3000/reports/expiring.csv?days=7"
```

## Limites connues

- Pas de validation des types (une qualité `"abc"` est acceptée).
- Le stock est stocké dans un fichier JSON : pas de gestion des accès concurrents.
