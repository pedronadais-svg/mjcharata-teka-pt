'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  reference: string;
  image: string;
  priceAOA: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pendente' | 'confirmada' | 'em-preparacao' | 'enviada' | 'entregue' | 'cancelada';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany?: string;
  notes?: string;
  createdAt: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  placeOrder: (customer: { name: string; email: string; phone: string; company?: string; notes?: string }) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const CART_KEY = 'teka_cart';
const ORDERS_KEY = 'teka_orders';

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setItems(JSON.parse(saved));
      const savedOrders = localStorage.getItem(ORDERS_KEY);
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.priceAOA * i.quantity, 0);

  const placeOrder = useCallback((customer: { name: string; email: string; phone: string; company?: string; notes?: string }) => {
    const order: Order = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      items: [...items],
      total,
      status: 'pendente',
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerCompany: customer.company,
      notes: customer.notes,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    clearCart();
    return order;
  }, [items, total, clearCart]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
  }, []);

  return (
    <CartContext.Provider value={{ items, itemCount, total, addItem, removeItem, updateQuantity, clearCart, orders, placeOrder, updateOrderStatus }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
