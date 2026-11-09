# Règles métier — vieillissement du stock

Ces règles ont été **déduites du code** de `src/inventory.js` (méthode `endOfDay`) puis **vérifiées** avec `npm run simulate`.

## Vocabulaire

| Terme | Champ | Définition |
|---|---|---|
| Jours avant péremption | `expiresIn` | Nombre de jours avant la date limite. Diminue de 1 chaque soir. Négatif quand la date est dépassée. |
| Qualité | `quality` | Note de 0 à 50 qui reflète l'état du produit. |
| Fin de journée | `endOfDay()` | Traitement qui applique les règles ci-dessous à tous les produits. |

## Règles générales

1. Chaque soir, `expiresIn` diminue de 1 (sauf levain mère).
2. La qualité ne devient **jamais négative**.
3. Une **augmentation** de qualité ne fait jamais dépasser **50**. Attention : un produit créé avec une qualité supérieure à 50 n'est pas ramené à 50.
4. « Date dépassée » signifie : `expiresIn` est négatif **après** la diminution du soir.

## Règles par produit

| Produit | Avant la date | Date dépassée |
|---|---|---|
| Produit standard | qualité −1 | qualité −2 |
| `Comté affiné 24 mois` (nom exact) | qualité +1 | qualité +2 |
| `Levain mère de la maison` (nom exact) | aucun changement (date et qualité) | aucun changement |
| Nom commençant par `Billet dégustation` | +1 si plus de 10 jours ; +2 de 10 à 6 jours ; +3 de 5 à 1 jour(s)* | qualité = 0 |

\* Les seuils s'appliquent sur `expiresIn` **avant** la diminution du soir : `< 11` et `< 6`.

Le levain mère a une qualité de 80 : c'est le seul produit au-dessus de 50.

## Demande métier en attente

Les produits **bio** (nom contenant « bio ») perdent en qualité **deux fois plus vite** que les produits standard. Cette règle **n'est pas encore implémentée** : aujourd'hui, `Jus de pomme bio` est traité comme un produit standard.
