const NEVER_EXPIRES = ['Levain mère de la maison'];

const CSV_SEPARATOR = ';';
const CSV_HEADER = ['name', 'expiresIn', 'quality'].join(CSV_SEPARATOR);

/**
 * Sélectionne les produits qui arrivent à péremption dans les `days` prochains jours.
 * Les produits déjà périmés et ceux qui ne périment jamais sont exclus.
 * @param {Product[]} products - Produits du stock.
 * @param {number} days - Horizon en jours (0 = périme aujourd'hui).
 * @returns {Product[]} Les produits concernés, triés par expiresIn croissant puis par nom.
 */
function findExpiringProducts(products, days) {
  return products
    .filter((product) => !NEVER_EXPIRES.includes(product.name))
    .filter((product) => product.expiresIn >= 0 && product.expiresIn <= days)
    .sort((a, b) => a.expiresIn - b.expiresIn || a.name.localeCompare(b.name, 'fr'));
}

/**
 * Échappe une valeur pour un fichier CSV : entoure de guillemets si elle contient
 * le séparateur, un guillemet ou un retour à la ligne, et double les guillemets.
 * @param {string|number} value
 * @returns {string}
 */
function escapeCsvValue(value) {
  const text = String(value);
  if (/[;"\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Convertit une liste de produits en CSV (séparateur « ; », compatible Excel en français).
 * @param {Product[]} products
 * @returns {string} Le contenu CSV, ligne d'en-tête comprise.
 */
function toCsv(products) {
  const lines = products.map((product) =>
    [product.name, product.expiresIn, product.quality].map(escapeCsvValue).join(CSV_SEPARATOR)
  );
  return [CSV_HEADER, ...lines].join('\n') + '\n';
}

/**
 * Lit et valide le paramètre `days` d'une requête.
 * @param {string|undefined} raw - Valeur brute du paramètre.
 * @param {number} [defaultDays=3]
 * @returns {number|null} Le nombre de jours, ou null s'il est invalide.
 */
function parseDays(raw, defaultDays = 3) {
  if (raw === undefined) {
    return defaultDays;
  }
  if (!/^\d+$/.test(raw)) {
    return null;
  }
  return Number(raw);
}

module.exports = { findExpiringProducts, toCsv, parseDays };
