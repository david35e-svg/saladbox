import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, DeliveryType, Product, SaladCustomization, SaladSize, SALAD_SIZE_LABELS } from '../types';
import { useStore } from './StoreContext';

interface CartContextType {
  items: CartItem[];
  itemsCount: number;
  itemsTotal: number;
  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  deliveryFee: number;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    quantity?: number,
    customDetails?: SaladCustomization,
    customSummaryText?: string[],
    extraPrice?: number,
    size?: SaladSize
  ) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  reorderItems: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'saladbox_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useStore();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [selectedCity, setSelectedCity] = useState<string>('נוף הגליל');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not persist cart:', e);
    }
  }, [items]);

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsTotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Calculate delivery fee
  const calculateDeliveryFee = (): number => {
    if (deliveryType === 'pickup') return 0;
    if (itemsTotal === 0) return 0;

    // Check free delivery threshold
    if (settings.freeDeliveryThreshold && itemsTotal >= settings.freeDeliveryThreshold) {
      return 0;
    }

    return settings.baseDeliveryFee || 15;
  };

  const deliveryFee = calculateDeliveryFee();
  const grandTotal = itemsTotal + deliveryFee;

  const addToCart = (
    product: Product,
    quantity: number = 1,
    customDetails?: SaladCustomization,
    customSummaryText?: string[],
    extraPrice: number = 0,
    size?: SaladSize
  ) => {
    // Determine size and price
    const resolvedSize = size || product.defaultSize || (product.sizes ? '500g' : undefined);
    const basePrice = resolvedSize && product.sizes?.[resolvedSize]
      ? product.sizes[resolvedSize]
      : product.price;

    const unitPrice = basePrice + extraPrice;
    const sizeSuffix = resolvedSize ? `_${resolvedSize}` : '';
    const uniqueId = customDetails
      ? `${product.id}${sizeSuffix}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      : `${product.id}${sizeSuffix}_standard`;

    const sizeLabel = resolvedSize ? SALAD_SIZE_LABELS[resolvedSize]?.full : undefined;

    setItems((prevItems) => {
      // If it's a standard non-customized product with the same size, stack quantity
      if (!customDetails) {
        const existingIndex = prevItems.findIndex((it) => it.id === uniqueId);
        if (existingIndex >= 0) {
          const updated = [...prevItems];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }
      }

      const newItem: CartItem = {
        id: uniqueId,
        productId: product.id,
        name: product.name,
        image: product.image,
        basePrice,
        extraPrice,
        unitPrice,
        quantity,
        selectedSize: resolvedSize,
        selectedSizeLabel: sizeLabel,
        customDetails,
        customSummaryText,
      };

      return [...prevItems, newItem];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.id === itemId) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter((it): it is CartItem => it !== null)
    );
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const reorderItems = (orderItems: CartItem[]) => {
    // Regenerate unique IDs for re-ordered items
    const freshItems: CartItem[] = orderItems.map((item) => ({
      ...item,
      id: `${item.productId}_${item.selectedSize || 'std'}_reorder_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    }));

    setItems((prev) => [...prev, ...freshItems]);
    setIsCartOpen(true);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemsCount,
        itemsTotal,
        deliveryType,
        setDeliveryType,
        selectedCity,
        setSelectedCity,
        deliveryFee,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        reorderItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
