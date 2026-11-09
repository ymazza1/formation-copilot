const { Product } = require('../src/inventory');
const { findExpiringProducts, toCsv, parseDays } = require('../src/reports/expiringReport');

describe('findExpiringProducts', () => {
  it('devrait garder les produits dont la date est entre 0 et days inclus', () => {
    const products = [
      new Product('A', 0, 1),
      new Product('B', 3, 1),
      new Product('C', 4, 1),
    ];

    const result = findExpiringProducts(products, 3);

    expect(result.map((p) => p.name)).toEqual(['A', 'B']);
  });

  it('devrait exclure les produits déjà périmés', () => {
    expect(findExpiringProducts([new Product('A', -1, 1)], 3)).toEqual([]);
  });

  it('devrait exclure le levain mère qui ne périme jamais', () => {
    expect(findExpiringProducts([new Product('Levain mère de la maison', 0, 80)], 3)).toEqual([]);
  });

  it('devrait trier par date croissante puis par nom', () => {
    const products = [
      new Product('Yaourt', 2, 1),
      new Product('Beurre', 2, 1),
      new Product('Pain', 1, 1),
    ];

    const result = findExpiringProducts(products, 3);

    expect(result.map((p) => p.name)).toEqual(['Pain', 'Beurre', 'Yaourt']);
  });

  it('ne devrait pas modifier le tableau d\'origine', () => {
    const products = [new Product('B', 2, 1), new Product('A', 1, 1)];

    findExpiringProducts(products, 3);

    expect(products.map((p) => p.name)).toEqual(['B', 'A']);
  });
});

describe('toCsv', () => {
  it('devrait produire seulement l\'en-tête quand la liste est vide', () => {
    expect(toCsv([])).toBe('name;expiresIn;quality\n');
  });

  it('devrait produire une ligne par produit séparée par des points-virgules', () => {
    expect(toCsv([new Product('Yaourt', 2, 10)])).toBe('name;expiresIn;quality\nYaourt;2;10\n');
  });

  it('devrait entourer de guillemets une valeur contenant le séparateur', () => {
    expect(toCsv([new Product('Sel; poivre', 2, 10)])).toContain('"Sel; poivre";2;10');
  });

  it('devrait doubler les guillemets d\'une valeur', () => {
    expect(toCsv([new Product('Le "vrai" beurre', 2, 10)])).toContain('"Le ""vrai"" beurre";2;10');
  });
});

describe('parseDays', () => {
  it('devrait retourner la valeur par défaut quand le paramètre est absent', () => {
    expect(parseDays(undefined)).toBe(3);
    expect(parseDays(undefined, 7)).toBe(7);
  });

  it('devrait convertir un entier positif ou nul', () => {
    expect(parseDays('0')).toBe(0);
    expect(parseDays('12')).toBe(12);
  });

  it.each(['', 'abc', '-1', '2.5', '3abc'])('devrait retourner null pour « %s »', (raw) => {
    expect(parseDays(raw)).toBeNull();
  });
});
