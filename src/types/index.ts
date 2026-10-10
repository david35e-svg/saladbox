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

export interface DrinkPricingTier {
  id: string;
  label: string; // e.g. 'פחית בודדת (1 יח׳)', 'זוג פחיות (2 יח׳)', 'רביעייה (4 פחיות)'
  quantity: number;
  price: number;
  badge?: string; // e.g. 'חיסכון ₪8'
}

export type PricingModel = 'flat' | 'tiered' | 'sizes';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Base reference price (usually for 500g, 1 can flat price, or package unit)
  categoryId: string;
  image: string;
  pricingModel?: PricingModel; // 'flat' (מחיר אחיד), 'tiered' (מחיר מדורג/כמויות), 'sizes' (250g/500g/1kg)
  isCustomizable?: boolean;
  isAvailable: boolean;
  sizes?: ProductSizesPricing; // Configurable prices for 250g, 500g, 1kg
  defaultSize?: SaladSize;
  isPackage?: boolean; // True for festive packages (מארז שישי, מארז אירוח, וכו')
  packageIncludesText?: string; // Summary of what the package contains
  isDrink?: boolean; // True for canned beverages
  drinkFlavors?: string[]; // Available flavors (e.g. תפוח נענע, לימונדה, תות, פירות יער)
  drinkTiers?: DrinkPricingTier[]; // Configurable tiered prices (e.g. 1 can = ₪14, 2 = ₪26, 4 = ₪48, 6 = ₪70)
  isFeatured?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  isSpicy?: boolean;
  hebrewTag?: string; // e.g. "בישול איטי 5 שעות", "לשולחן שבת", "מארז חגיגי"
  calories?: number;
  prepTimeMinutes?: number;
  order?: number;
  isSoldOut?: boolean; // סולד אאוט לשבת הנוכחית
  defaultBases?: string[];
  defaultVeggies?: string[];
  defaultProteins?: string[];
  defaultDressings?: string[];
}

export type EventType =
  | 'shabbat_chatan'
  | 'azkara'
  | 'aliyah_latora'
  | 'family_hosting'
  | 'birthday'
  | 'friends_gathering'
  | 'other';

export interface EventInquiry {
  id: string;
  eventType: EventType;
  eventTypeName: string;
  eventDate: string;
  numberOfGuests: number;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  location?: string;
  estimatedQuantity?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'approved' | 'closed';
  createdAt: string;
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
  selectedFlavor?: string; // Flavor for canned drinks (תפוח נענע, לימונדה, תות, וכו')
  selectedTier?: DrinkPricingTier; // Tiered pack selected (e.g. זוג, רביעייה, שישייה)
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

export type PaymentMethod = 'cash' | 'bit' | 'credit_card' | 'phone';

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
  receiptNumber?: string; // מספר חשבונית מס קבלה רשמי
  discountAmount?: number; // גובה הנחה מקופון או מבצע
  couponCode?: string; // קוד קופון שהוזן
  creditCardLast4?: string; // 4 ספרות אחרונות של כרטיס האשראי
  approvalCode?: string; // מספר אישור סליקה
  bitTransactionRef?: string; // אסמכתת תשלום ב-Bit
  installments?: number; // מספר תשלומים
  timing: 'asap' | 'scheduled';
  scheduledTime?: string;
  timeSlot?: string; // חלון זמנים ביום שישי
  isGift?: boolean; // מתנה לשבת
  giftMessage?: string; // ברכה אישית מודפסת
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
