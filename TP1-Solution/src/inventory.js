class Product {
  constructor(name, expiresIn, quality) {
    this.name = name;
    this.expiresIn = expiresIn;
    this.quality = quality;
  }
}

class Inventory {
  constructor(products = []) {
    this.products = products;
  }

  endOfDay() {
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].name != 'Comté affiné 24 mois' && !this.products[i].name.startsWith('Billet dégustation')) {
        if (this.products[i].quality > 0) {
          if (this.products[i].name != 'Levain mère de la maison') {
            this.products[i].quality = this.products[i].quality - 1;
          }
        }
      } else {
        if (this.products[i].quality < 50) {
          this.products[i].quality = this.products[i].quality + 1;
          if (this.products[i].name.startsWith('Billet dégustation')) {
            if (this.products[i].expiresIn < 11) {
              if (this.products[i].quality < 50) {
                this.products[i].quality = this.products[i].quality + 1;
              }
            }
            if (this.products[i].expiresIn < 6) {
              if (this.products[i].quality < 50) {
                this.products[i].quality = this.products[i].quality + 1;
              }
            }
          }
        }
      }
      if (this.products[i].name != 'Levain mère de la maison') {
        this.products[i].expiresIn = this.products[i].expiresIn - 1;
      }
      if (this.products[i].expiresIn < 0) {
        if (this.products[i].name != 'Comté affiné 24 mois') {
          if (!this.products[i].name.startsWith('Billet dégustation')) {
            if (this.products[i].quality > 0) {
              if (this.products[i].name != 'Levain mère de la maison') {
                this.products[i].quality = this.products[i].quality - 1;
              }
            }
          } else {
            this.products[i].quality = this.products[i].quality - this.products[i].quality;
          }
        } else {
          if (this.products[i].quality < 50) {
            this.products[i].quality = this.products[i].quality + 1;
          }
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
