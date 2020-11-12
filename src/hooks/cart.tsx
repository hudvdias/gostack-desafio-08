import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem('@GoMarketplace:products');
      console.log(storagedProducts);
      if (storagedProducts) setProducts(JSON.parse(storagedProducts));
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const alreadyInCart = products.find(item => item.id === product.id);
    console.log(alreadyInCart);
    if (alreadyInCart) {
      const newProducts = products.map(item => {
        if (item.id === product.id) item.quantity++;
        return item;
      });
      await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products));
      setProducts(newProducts);
    } else {
      const newProducts = [...products, { ...product, quantity: 1 }];
      await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(newProducts));
      setProducts(newProducts);
    }
  }, [products]);

  const increment = useCallback(async id => {
    const newProducts = products.map(product => {
      if (product.id === id) product.quantity++;
      return product;
    });
    setProducts(newProducts);
    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(newProducts));
  }, [products]);

  const decrement = useCallback(async id => {
    const newProducts = products.map(product => {
      if (product.id === id) {
        if (product.quantity > 1 ) product.quantity--;
        else {};
      }
      return product;
    });
    setProducts(newProducts);
    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(newProducts));
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

function useCart(): CartContext {
  const context = useContext(CartContext);
  if (!context) throw new Error(`useCart must be used within a CartProvider`);
  return context;
}

export { CartProvider, useCart };
