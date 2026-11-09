const { Inventory, Product } = require('../src/inventory');

/**
 * Fait vieillir un seul produit d'une journée et le retourne.
 */
function endOfDay(name, expiresIn, quality) {
  const inventory = new Inventory([new Product(name, expiresIn, quality)]);
  return inventory.endOfDay()[0];
}

describe('Inventory.endOfDay', () => {
  describe('produit standard', () => {
    it('devrait diminuer la date et la qualité de 1 quand la date n\'est pas dépassée', () => {
      const product = endOfDay('Yaourt fermier', 5, 10);

      expect(product.expiresIn).toBe(4);
      expect(product.quality).toBe(9);
    });

    it('devrait diminuer la qualité de 2 quand la date est dépassée', () => {
      const product = endOfDay('Yaourt fermier', 0, 10);

      expect(product.expiresIn).toBe(-1);
      expect(product.quality).toBe(8);
    });

    it('ne devrait jamais rendre la qualité négative', () => {
      expect(endOfDay('Yaourt fermier', 5, 0).quality).toBe(0);
      expect(endOfDay('Yaourt fermier', -1, 1).quality).toBe(0);
    });

  });

  describe('produit bio', () => {
    it('devrait perdre 2 en qualité quand la date n\'est pas dépassée', () => {
      expect(endOfDay('Jus de pomme bio', 3, 6).quality).toBe(4);
    });

    it('devrait perdre 4 en qualité quand la date est dépassée', () => {
      expect(endOfDay('Jus de pomme bio', 0, 10).quality).toBe(6);
    });

    it('ne devrait jamais rendre la qualité négative', () => {
      expect(endOfDay('Jus de pomme bio', 3, 1).quality).toBe(0);
      expect(endOfDay('Jus de pomme bio', -1, 3).quality).toBe(0);
    });

    it('devrait reconnaître « bio » quelle que soit la casse', () => {
      expect(endOfDay('Farine BIO de sarrasin', 3, 10).quality).toBe(8);
    });

    it('ne devrait pas confondre un mot contenant « bio » avec un produit bio', () => {
      expect(endOfDay('Biscuits au beurre', 3, 10).quality).toBe(9);
    });
  });

  describe('Comté affiné 24 mois', () => {
    it('devrait gagner 1 en qualité quand la date n\'est pas dépassée', () => {
      expect(endOfDay('Comté affiné 24 mois', 2, 0).quality).toBe(1);
    });

    it('devrait gagner 2 en qualité quand la date est dépassée', () => {
      expect(endOfDay('Comté affiné 24 mois', 0, 10).quality).toBe(12);
    });

    it('ne devrait pas dépasser une qualité de 50', () => {
      expect(endOfDay('Comté affiné 24 mois', 5, 50).quality).toBe(50);
      expect(endOfDay('Comté affiné 24 mois', -1, 49).quality).toBe(50);
    });
  });

  describe('Levain mère de la maison', () => {
    it('ne devrait changer ni la date ni la qualité', () => {
      const product = endOfDay('Levain mère de la maison', 0, 80);

      expect(product.expiresIn).toBe(0);
      expect(product.quality).toBe(80);
    });

    it('ne devrait rien changer même quand la date est dépassée', () => {
      const product = endOfDay('Levain mère de la maison', -1, 80);

      expect(product.expiresIn).toBe(-1);
      expect(product.quality).toBe(80);
    });
  });

  describe('Billet dégustation', () => {
    const ticket = 'Billet dégustation - Vins de Loire';

    it('devrait gagner 1 en qualité à plus de 10 jours de l\'événement', () => {
      expect(endOfDay(ticket, 11, 20).quality).toBe(21);
    });

    it('devrait gagner 2 en qualité entre 10 et 6 jours de l\'événement', () => {
      expect(endOfDay(ticket, 10, 20).quality).toBe(22);
      expect(endOfDay(ticket, 6, 20).quality).toBe(22);
    });

    it('devrait gagner 3 en qualité à 5 jours ou moins de l\'événement', () => {
      expect(endOfDay(ticket, 5, 20).quality).toBe(23);
      expect(endOfDay(ticket, 1, 20).quality).toBe(23);
    });

    it('devrait tomber à 0 une fois l\'événement passé', () => {
      expect(endOfDay(ticket, 0, 20).quality).toBe(0);
    });

    it('ne devrait pas dépasser une qualité de 50', () => {
      expect(endOfDay(ticket, 5, 49).quality).toBe(50);
    });

    it('devrait reconnaître tout produit dont le nom commence par « Billet dégustation »', () => {
      expect(endOfDay('Billet dégustation - Chocolats', 3, 10).quality).toBe(13);
    });
  });

  it('devrait faire vieillir tous les produits du stock', () => {
    const inventory = new Inventory([
      new Product('Yaourt fermier', 5, 10),
      new Product('Comté affiné 24 mois', 5, 10),
    ]);

    const products = inventory.endOfDay();

    expect(products.map((p) => p.quality)).toEqual([9, 11]);
  });
});
