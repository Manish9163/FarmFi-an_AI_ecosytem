import { createContext, useState, useCallback } from 'react';
import { marketService } from '../services/marketService';
import toast from 'react-hot-toast';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart,    setCart]    = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await marketService.getCart();
      setCart(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId, qty = 1) => {
    const existing = cart.find(i => i.id === productId);
    const newQty = (existing?.quantity ?? 0) + qty;
    try {
      await marketService.updateCart({ product_id: productId, quantity: newQty });
      await fetchCart();
      toast.success('Added to cart 🛒');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not add to cart');
    }
  }, [cart, fetchCart]);

  // Update quantity
  const updateCart = useCallback(async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        await marketService.removeFromCart(productId);
      } else {
        await marketService.updateCart({ product_id: productId, quantity });
      }
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update cart');
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      await marketService.removeFromCart(productId);
      await fetchCart();
      toast.success('Item removed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not remove item');
    }
  }, [fetchCart]);

  const cartTotal  = cart.reduce((s, i) => s + parseFloat(i.subtotal || 0), 0);
  const cartCount  = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, cartTotal, cartCount, fetchCart, addToCart, updateCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}
