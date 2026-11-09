/**
 * Produit en stock dans l'épicerie.
 */
class Product {
  /**
   * @param {string} name - Nom du produit. Certaines règles métier dépendent du nom exact ou de son préfixe.
   * @param {number} expiresIn - Nombre de jours restant avant la date de péremption (négatif si dépassée).
   * @param {number} quality - Qualité du produit, entre 0 et 50 (80 pour le levain mère).
   */
  constructor(name, expiresIn, quality) {
    this.name = name;
    this.expiresIn = expiresIn;
    this.quality = quality;
  }
}

/**
 * Stock de l'épicerie, fait vieillir les produits à chaque fin de journée.
 */
class Inventory {
  /**
   * @param {Product[]} [products=[]] - Produits en stock. Ils sont modifiés en place par {@link Inventory#endOfDay}.
   */
  constructor(products = []) {
    this.products = products;
  }

  /**
   * Applique les règles de vieillissement de fin de journée à chaque produit.
   *
   * Règles (voir docs/regles-metier.md) :
   * - produit standard : qualité -1 par jour, -2 une fois la date dépassée ;
   * - « Comté affiné 24 mois » : qualité +1 par jour, +2 une fois la date dépassée ;
   * - « Levain mère de la maison » : ni la date ni la qualité ne changent ;
   * - « Billet dégustation… » : +1, +2 à 10 jours ou moins, +3 à 5 jours ou moins, 0 après l'événement ;
   * - la qualité ne descend jamais sous 0 et n'est jamais augmentée au-delà de 50.
   *
   * @returns {Product[]} Les produits mis à jour (même tableau que celui passé au constructeur).
   */
  endOfDay() {
    for (const product of this.products) {
      const isCheese = product.name === 'Comté affiné 24 mois';
      const isSourdough = product.name === 'Levain mère de la maison';
      const isTastingTicket = product.name.startsWith('Billet dégustation');

      if (isCheese || isTastingTicket) {
        if (product.quality < 50) {
          product.quality += 1;

          if (isTastingTicket && product.expiresIn < 11 && product.quality < 50) {
            product.quality += 1;
          }
          if (isTastingTicket && product.expiresIn < 6 && product.quality < 50) {
            product.quality += 1;
          }
        }
      } else if (!isSourdough && product.quality > 0) {
        product.quality -= 1;
      }

      if (!isSourdough) {
        product.expiresIn -= 1;
      }

      if (product.expiresIn < 0) {
        if (isCheese) {
          if (product.quality < 50) {
            product.quality += 1;
          }
        } else if (isTastingTicket) {
          product.quality -= product.quality;
        } else if (!isSourdough && product.quality > 0) {
          product.quality -= 1;
        }
      }
    }

    return this.products;
  }
}

module.exports = {
  Product,
  Inventory,
};
