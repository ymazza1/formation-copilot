const MIN_QUALITY = 0;
const MAX_QUALITY = 50;

const AGED_CHEESE = 'Comté affiné 24 mois';
const SOURDOUGH_STARTER = 'Levain mère de la maison';
const TASTING_TICKET_PREFIX = 'Billet dégustation';
const ORGANIC_PATTERN = /\bbio\b/i;

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
 * Augmente la qualité sans dépasser MAX_QUALITY.
 * Un produit déjà au-dessus du maximum (ex. levain mère) n'est pas modifié.
 */
function increaseQuality(product, amount) {
  if (product.quality < MAX_QUALITY) {
    product.quality = Math.min(MAX_QUALITY, product.quality + amount);
  }
}

/**
 * Diminue la qualité sans descendre sous MIN_QUALITY.
 */
function decreaseQuality(product, amount) {
  if (product.quality > MIN_QUALITY) {
    product.quality = Math.max(MIN_QUALITY, product.quality - amount);
  }
}

function isExpired(product) {
  return product.expiresIn < 0;
}

/**
 * Fait passer une journée : avance la date puis applique l'effet de la péremption.
 * @param {Product} product
 * @param {(product: Product) => void} dailyChange - Évolution quotidienne de la qualité.
 * @param {(product: Product) => void} [expiredChange=dailyChange] - Évolution supplémentaire une fois la date dépassée.
 */
function age(product, dailyChange, expiredChange = dailyChange) {
  dailyChange(product);
  product.expiresIn -= 1;
  if (isExpired(product)) {
    expiredChange(product);
  }
}

function tastingTicketIncrease(expiresIn) {
  if (expiresIn <= 5) {
    return 3;
  }
  if (expiresIn <= 10) {
    return 2;
  }
  return 1;
}

/**
 * Règles de vieillissement, de la plus spécifique à la plus générale.
 * La première règle dont `matches` est vrai s'applique.
 */
const AGING_RULES = [
  {
    matches: (name) => name === SOURDOUGH_STARTER,
    apply: () => {},
  },
  {
    matches: (name) => name === AGED_CHEESE,
    apply: (product) => age(product, (p) => increaseQuality(p, 1)),
  },
  {
    matches: (name) => name.startsWith(TASTING_TICKET_PREFIX),
    apply: (product) =>
      age(
        product,
        (p) => increaseQuality(p, tastingTicketIncrease(p.expiresIn)),
        (p) => {
          p.quality = MIN_QUALITY;
        }
      ),
  },
  {
    matches: (name) => ORGANIC_PATTERN.test(name),
    apply: (product) => age(product, (p) => decreaseQuality(p, 2)),
  },
  {
    matches: () => true,
    apply: (product) => age(product, (p) => decreaseQuality(p, 1)),
  },
];

function findRule(product) {
  return AGING_RULES.find((rule) => rule.matches(product.name));
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
   * Applique à chaque produit sa règle de vieillissement (voir docs/regles-metier.md).
   * @returns {Product[]} Les produits mis à jour (même tableau que celui passé au constructeur).
   */
  endOfDay() {
    this.products.forEach((product) => findRule(product).apply(product));
    return this.products;
  }
}

module.exports = {
  Product,
  Inventory,
};
