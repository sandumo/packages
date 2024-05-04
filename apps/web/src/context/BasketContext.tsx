import { Product } from 'api-client';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type CallbackType = () => (Promise<void> | void);

type BasketItemType = {
  id: number,
  qty: number
};

type ValuesType = {
  addItemToBasket: (product: Product, qty: number) => void
  removeItemFromBasket: (product: Product) => void
  updateItemInBasket: (product: Product, qty: number) => void
  getItemFromBasket: (id: number) => BasketItemType | null
  getBasketItems: () => BasketItemType[]
}

const defaultProvider: ValuesType = {
  addItemToBasket: () => {},
  removeItemFromBasket: () => {},
  updateItemInBasket: () => {},
  getItemFromBasket: () => null,
  getBasketItems: () => [],
};

const BasketContext = createContext(defaultProvider);

type Props = {
  children: ReactNode
}

const BasketProvider = ({ children }: Props) => {
  const [items, setItems] = useState<BasketItemType[]>([]);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [callback, setCallback] = useState<CallbackType>();

  useEffect(() => {
    const basket = localStorage.getItem('basket');
    if (basket) {
      setItems(JSON.parse(basket));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('basket', JSON.stringify(items));
  }, [items]);

  const addItemToBasket = (product: Product, qty: number) => {
    setItems([...items, { id: product.id, qty }]);
  };

  const updateItemInBasket = (product: Product, qty: number) => {
    setItems(items.map(item => item.id === product.id ? { ...item, qty } : item));
  };

  const removeItemFromBasket = (product: Product) => {
    setItems(items.filter(item => item.id !== product.id));
  };

  return (
    <BasketContext.Provider value={{
      addItemToBasket,
      updateItemInBasket,
      removeItemFromBasket,
      getItemFromBasket: (id: number) => items.find((item) => item.id === id) || null,
      getBasketItems: () => items,
    }}>
      {children}
    </BasketContext.Provider>
  );
};

const useBasketContext = () => useContext(BasketContext);

export { BasketContext, BasketProvider, useBasketContext };

