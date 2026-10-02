export type IngredientCategory = 'base' | 'veggie' | 'protein' | 'addon' | 'dressing';

export type SaladSize = '250g' | '500g' | '1kg';

export const SALAD_SIZE_LABELS: Record<SaladSize, { short: string; full: string }> = {
  '250g': { short: '250 גרם', full: '250 גרם (רבע קילו)' },
  '500g': { short: '500 גרם', full: '500 גרם (חצי קילו)' },
  '1kg': { short: '1 ק"ג', full: '1 ק"ג (קילו)' },
};

export interface SaladIngredient {
  id: string;
  name: string;
  category: IngredientCategory;
  price: number;
  isAvailable: boolean;
  calories: number;
  isDefault?: boolean;
  isPremium?: boolean;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface ProductSizesPricing {
  '250g': number;
  '500g': number;
  '1kg': number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Base reference price (usually 250g or unit)
  categoryId: string;
  image: string;
  isCustomizable: boolean;
  isAvailable: boolean;
  sizes?: ProductSizesPricing; // Configurable prices for 250g, 500g, 1kg
  defaultSize?: SaladSize;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  isSpicy?: boolean;
  calories?: number;
  prepTimeMinutes?: number;
  order?: number;
  defaultBases?: string[];
  defaultVeggies?: string[];
  defaultProteins?: string[];
  defaultDressings?: string[];
}

export interface SaladCustomization {
  bases: string[];
  veggies: string[];
  proteins: string[];
  addons: string[];
  dressings: string[];
  dressingOption: 'mixed' | 'on_side';
  breadOption: 'white_ciabatta' | 'whole_wheat' | 'gluten_free' | 'none';
  specialInstructions: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  basePrice: number;
  extraPrice: number;
  unitPrice: number;
  quantity: number;
  selectedSize?: SaladSize;
  selectedSizeLabel?: string;
  customDetails?: SaladCustomization;
  customSummaryText?: string[];
}

export type OrderStatus =
  | 'received'
  | 'in_review'
  | 'preparing'
  | 'on_the_way'
  | 'completed'
  | 'cancelled';

export type DeliveryType = 'delivery' | 'pickup';

export type PaymentMethod = 'cash' | 'bit' | 'credit_card';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryType: DeliveryType;
  deliveryAddress?: {
    city: string;
    street: string;
    houseNumber: string;
    apartment?: string;
    floor?: string;
    notes?: string;
  };
  deliveryFee: number;
  itemsTotal: number;
  grandTotal: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentConfirmedAt?: string;
  transactionId?: string;
  timing: 'asap' | 'scheduled';
  scheduledTime?: string;
  specialNotes?: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productPrice: number;
  customDetails?: SaladCustomization;
  createdAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  cities: string[];
  fee: number;
  minOrder: number;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  phone: string;
  address: string;
  isOpen: boolean;
  openingHoursText: string;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  baseDeliveryFee: number;
  estimatedDeliveryMinutes: number;
  estimatedPickupMinutes: number;
  allowedDeliveryCity: string; // "נוף הגליל"
  orderCutoffDay: number; // 2 = Tuesday
  orderCutoffTime: string; // "23:59"
  cutoffOverrideOpen?: boolean;
  deliveryZones: DeliveryZone[];
}
