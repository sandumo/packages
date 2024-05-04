type BasketItem = { id: number, qty: number };

class Basket {
  private basket: BasketItem[] = [];

  add(productId: number, qty: number) {
    const basket = this.getItems();

    basket.push({ id: productId, qty });

    localStorage.setItem('basket', JSON.stringify(basket));
  }

  remove(productId: number) {

  }

  get() {

  }

  getItem(id: number): BasketItem | null {
    try {
      return JSON.parse(localStorage.getItem('basket') || '[]').find((item: BasketItem) => item.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  getItems(): BasketItem[] {
    try {
      return JSON.parse(localStorage.getItem('basket') || '[]');
    } catch (error) {
      return [];
    }
  }
}

const basket = new Basket();

export default basket;
