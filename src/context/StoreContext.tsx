import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Category,
  FavoriteItem,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  SaladIngredient,
  StoreSettings,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_INGREDIENTS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
} from '../data/seedData';
import { useAuth } from './AuthContext';

interface StoreContextType {
  categories: Category[];
  products: Product[];
  ingredients: SaladIngredient[];
  orders: Order[];
  favorites: FavoriteItem[];
  settings: StoreSettings;
  isLoading: boolean;
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => Promise<void>;
  confirmPayment: (orderId: string) => Promise<void>;
  toggleFavorite: (productId: string, productName: string, productPrice: number) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  // Admin Operations
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleProductAvailability: (productId: string, isAvailable: boolean) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  saveIngredient: (ingredient: SaladIngredient) => Promise<void>;
  deleteIngredient: (ingredientId: string) => Promise<void>;
  toggleIngredientAvailability: (ingredientId: string, isAvailable: boolean) => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  resetToSampleData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [ingredients, setIngredients] = useState<SaladIngredient[]>(INITIAL_INGREDIENTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Subscribe to Categories
  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Category[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Category);
          });
          setCategories(list);
        } else {
          setCategories(INITIAL_CATEGORIES);
          if (isAdmin) {
            seedInitialCollection('categories', INITIAL_CATEGORIES);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'categories');
      }
    );
    return () => unsub();
  }, [isAdmin]);

  // 2. Subscribe to Products
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('order', 'asc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Product[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Product);
          });
          setProducts(list);
        } else {
          setProducts(INITIAL_PRODUCTS);
          if (isAdmin) {
            seedInitialCollection('products', INITIAL_PRODUCTS);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    );
    return () => unsub();
  }, [isAdmin]);

  // 3. Subscribe to Ingredients
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'saladIngredients'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: SaladIngredient[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as SaladIngredient);
          });
          setIngredients(list);
        } else {
          setIngredients(INITIAL_INGREDIENTS);
          if (isAdmin) {
            seedInitialCollection('saladIngredients', INITIAL_INGREDIENTS);
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'saladIngredients');
      }
    );
    return () => unsub();
  }, [isAdmin]);

  // 4. Subscribe to Store Settings
  useEffect(() => {
    const docRef = doc(db, 'settings', 'business_config');
    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as StoreSettings);
        } else {
          setSettings(INITIAL_SETTINGS);
          if (isAdmin) {
            setDoc(docRef, INITIAL_SETTINGS).catch((err) => {
              console.warn('Initial settings seed note:', err);
            });
          }
        }
        setIsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/business_config');
        setIsLoading(false);
      }
    );
    return () => unsub();
  }, [isAdmin]);

  // 5. Subscribe to Orders
  useEffect(() => {
    // Admins see all orders, customers see only their own orders
    const ordersCol = collection(db, 'orders');
    const unsub = onSnapshot(
      ordersCol,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((docSnap) => {
          const item = docSnap.data() as Order;
          if (isAdmin) {
            list.push(item);
          } else if (user && item.userId === user.uid) {
            list.push(item);
          } else if (!user && item.userId === 'guest') {
            // Check local guest order cache
            const guestOrders = JSON.parse(localStorage.getItem('sb_guest_orders') || '[]');
            if (guestOrders.includes(item.id)) {
              list.push(item);
            }
          }
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(list);
      },
      (error) => {
        // If not authenticated or permission restricted, keep existing orders
        console.warn('Orders listener notice:', error);
      }
    );
    return () => unsub();
  }, [user, isAdmin]);

  // 6. Subscribe to Favorites (if signed in)
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    const unsub = onSnapshot(
      collection(db, 'favorites'),
      (snapshot) => {
        const list: FavoriteItem[] = [];
        snapshot.forEach((docSnap) => {
          const fav = docSnap.data() as FavoriteItem;
          if (fav.userId === user.uid) {
            list.push(fav);
          }
        });
        setFavorites(list);
      },
      (error) => {
        console.warn('Favorites listener notice:', error);
      }
    );
    return () => unsub();
  }, [user]);

  // Helper to batch seed initial data
  const seedInitialCollection = async (collectionName: string, items: any[]) => {
    try {
      if (!isAdmin) return;
      for (const item of items) {
        await setDoc(doc(db, collectionName, item.id), item);
      }
    } catch (err) {
      console.warn(`Could not seed ${collectionName}:`, err);
    }
  };

  // Reset to sample data helper
  const resetToSampleData = async () => {
    await seedInitialCollection('categories', INITIAL_CATEGORIES);
    await seedInitialCollection('products', INITIAL_PRODUCTS);
    await seedInitialCollection('saladIngredients', INITIAL_INGREDIENTS);
    await setDoc(doc(db, 'settings', 'business_config'), INITIAL_SETTINGS);
  };

  // Order creation
  const createOrder = async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Order> => {
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `#SB-${randomDigits}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderNumber,
      status: 'received',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);

      // Track guest order in local storage if not signed in
      if (!user) {
        const guestOrders = JSON.parse(localStorage.getItem('sb_guest_orders') || '[]');
        guestOrders.push(orderId);
        localStorage.setItem('sb_guest_orders', JSON.stringify(guestOrders));
      }

      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `orders/${orderId}`);
      throw error;
    }
  };

  // Update order status (Admin)
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date().toISOString(),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o))
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // Update payment status (Admin)
  const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const now = new Date().toISOString();
      const updates: Partial<Order> = {
        paymentStatus,
        updatedAt: now,
      };
      if (paymentStatus === 'paid') {
        updates.paymentConfirmedAt = now;
      }
      await updateDoc(orderRef, updates);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  // Manually confirm payment (Admin: "התשלום התקבל")
  const confirmPayment = async (orderId: string) => {
    await updatePaymentStatus(orderId, 'paid');
  };

  // Favorites
  const toggleFavorite = async (productId: string, productName: string, productPrice: number) => {
    if (!user) return;
    const existing = favorites.find((f) => f.productId === productId && f.userId === user.uid);
    if (existing) {
      try {
        await deleteDoc(doc(db, 'favorites', existing.id));
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `favorites/${existing.id}`);
      }
    } else {
      const favId = `fav_${user.uid}_${productId}`;
      const newFav: FavoriteItem = {
        id: favId,
        userId: user.uid,
        productId,
        productName,
        productPrice,
        createdAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'favorites', favId), newFav);
        setFavorites((prev) => [...prev, newFav]);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `favorites/${favId}`);
      }
    }
  };

  const isFavorite = (productId: string) => {
    if (!user) return false;
    return favorites.some((f) => f.productId === productId && f.userId === user.uid);
  };

  // Admin Product Actions
  const saveProduct = async (product: Product) => {
    try {
      await setDoc(doc(db, 'products', product.id), product);
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === product.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = product;
          return updated;
        }
        return [...prev, product];
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
  };

  const toggleProductAvailability = async (productId: string, isAvailable: boolean) => {
    try {
      await updateDoc(doc(db, 'products', productId), { isAvailable });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isAvailable } : p))
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${productId}`);
    }
  };

  // Admin Category Actions
  const saveCategory = async (category: Category) => {
    try {
      await setDoc(doc(db, 'categories', category.id), category);
      setCategories((prev) => {
        const idx = prev.findIndex((c) => c.id === category.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = category;
          return updated.sort((a, b) => a.order - b.order);
        }
        return [...prev, category].sort((a, b) => a.order - b.order);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${category.id}`);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
    }
  };

  // Admin Ingredients Actions
  const saveIngredient = async (ingredient: SaladIngredient) => {
    try {
      await setDoc(doc(db, 'saladIngredients', ingredient.id), ingredient);
      setIngredients((prev) => {
        const idx = prev.findIndex((i) => i.id === ingredient.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = ingredient;
          return updated;
        }
        return [...prev, ingredient];
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `saladIngredients/${ingredient.id}`);
    }
  };

  const deleteIngredient = async (ingredientId: string) => {
    try {
      await deleteDoc(doc(db, 'saladIngredients', ingredientId));
      setIngredients((prev) => prev.filter((i) => i.id !== ingredientId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `saladIngredients/${ingredientId}`);
    }
  };

  const toggleIngredientAvailability = async (ingredientId: string, isAvailable: boolean) => {
    try {
      await updateDoc(doc(db, 'saladIngredients', ingredientId), { isAvailable });
      setIngredients((prev) =>
        prev.map((i) => (i.id === ingredientId ? { ...i, isAvailable } : i))
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `saladIngredients/${ingredientId}`);
    }
  };

  // Admin Settings
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const merged = { ...settings, ...newSettings };
      await setDoc(doc(db, 'settings', 'business_config'), merged);
      setSettings(merged);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/business_config');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        categories,
        products,
        ingredients,
        orders,
        favorites,
        settings,
        isLoading,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        confirmPayment,
        toggleFavorite,
        isFavorite,
        saveProduct,
        deleteProduct,
        toggleProductAvailability,
        saveCategory,
        deleteCategory,
        saveIngredient,
        deleteIngredient,
        toggleIngredientAvailability,
        updateSettings,
        resetToSampleData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
