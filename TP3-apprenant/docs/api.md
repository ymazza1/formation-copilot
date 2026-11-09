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

## Limites connues

- Pas de validation des types (une qualité `"abc"` est acceptée).
- Le stock est stocké dans un fichier JSON : pas de gestion des accès concurrents.
