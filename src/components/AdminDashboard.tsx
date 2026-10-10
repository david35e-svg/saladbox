import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  Eye,
  EyeOff,
  Filter,
  Layers,
  LayoutGrid,
  MapPin,
  Package,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Table,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Sliders,
  Scale,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ReceiptModal } from './ReceiptModal';
import {
  Category,
  DrinkPricingTier,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PricingModel,
  Product,
  ProductSizesPricing,
  SaladIngredient,
  StoreSettings,
  SALAD_SIZE_LABELS,
} from '../types';
import {
  biDrinkCansImage,
  fullShabbatTableImage,
  garlicConfitImage,
  cabbageCarrotImage,
} from '../data/seedData';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const {
    products,
    categories,
    ingredients,
    orders,
    settings,
    updateOrderStatus,
    updatePaymentStatus,
    confirmPayment,
    saveProduct,
    updateProductSizes,
    deleteProduct,
    toggleProductAvailability,
    saveCategory,
    deleteCategory,
    saveIngredient,
    deleteIngredient,
    toggleIngredientAvailability,
    updateSettings,
    resetToSampleData,
  } = useStore();

  const { profile, user } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'kitchen' | 'reports' | 'products' | 'ingredients' | 'categories' | 'customers' | 'settings'
  >('orders');

  // Filter orders by order status, payment method, payment status, and search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Selected Order for print/slip view
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);

  // Product modal edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Product sizes management UI state
  const [productViewMode, setProductViewMode] = useState<'grid' | 'table'>('grid');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState<string>('');
  const [inlineEditingProductId, setInlineEditingProductId] = useState<string | null>(null);
  const [quickSizesEdits, setQuickSizesEdits] = useState<Record<string, ProductSizesPricing>>({});
  const [savedSizesToast, setSavedSizesToast] = useState<Record<string, boolean>>({});
  const [isUpdatingSizeId, setIsUpdatingSizeId] = useState<string | null>(null);

  // Helper to read current or staged sizes for a product
  const getProductSizes = (prod: Product): ProductSizesPricing => {
    if (quickSizesEdits[prod.id]) {
      return quickSizesEdits[prod.id];
    }
    if (prod.sizes) {
      return prod.sizes;
    }
    const base = prod.price || 45;
    return {
      '250g': Math.round(base * 0.6),
      '500g': base,
      '1kg': Math.round(base * 1.75),
    };
  };

  const handleUpdateQuickSizeInput = (
    productId: string,
    sizeKey: '250g' | '500g' | '1kg',
    value: number
  ) => {
    const prod = products.find((p) => p.id === productId);
    const current = getProductSizes(prod || ({ id: productId, price: 45 } as Product));
    setQuickSizesEdits((prev) => ({
      ...prev,
      [productId]: {
        ...current,
        [sizeKey]: Math.max(0, value),
      },
    }));
  };

  const handleAutoRatioSizes = (productId: string, basePrice?: number) => {
    const prod = products.find((p) => p.id === productId);
    const current = getProductSizes(prod || ({ id: productId, price: 45 } as Product));
    const base = basePrice || current['500g'] || prod?.price || 45;
    const calculated: ProductSizesPricing = {
      '250g': Math.round(base * 0.6),
      '500g': base,
      '1kg': Math.round(base * 1.75),
    };
    setQuickSizesEdits((prev) => ({
      ...prev,
      [productId]: calculated,
    }));
  };

  const handleSaveProductSizes = async (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const sizes = getProductSizes(prod);

    if (sizes['250g'] <= 0 || sizes['500g'] <= 0 || sizes['1kg'] <= 0) {
      alert('נא להזין מחירים חיוביים ותקינים לכל 3 הגדלים (250 גרם, 500 גרם, 1 ק"ג)');
      return;
    }

    try {
      setIsUpdatingSizeId(productId);
      await updateProductSizes(productId, sizes);
      setSavedSizesToast((prev) => ({ ...prev, [productId]: true }));
      setTimeout(() => {
        setSavedSizesToast((prev) => ({ ...prev, [productId]: false }));
      }, 2500);
      setInlineEditingProductId(null);
    } catch (err) {
      console.error('Failed to update product sizes:', err);
      alert('שגיאה בשמירת מחירי הגדלים במסד הנתונים');
    } finally {
      setIsUpdatingSizeId(null);
    }
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = productCategoryFilter === 'all' || p.categoryId === productCategoryFilter;
      const matchSearch =
        !productSearch.trim() ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(productSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, productCategoryFilter, productSearch]);

  // Ingredient modal edit state
  const [editingIngredient, setEditingIngredient] = useState<SaladIngredient | null>(null);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);

  // Category modal edit state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchOrderStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      const matchPaymentMethod =
        paymentMethodFilter === 'all' || o.paymentMethod === paymentMethodFilter;
      const matchPaymentStatus =
        paymentStatusFilter === 'all' || o.paymentStatus === paymentStatusFilter;
      const matchSearch =
        !orderSearch.trim() ||
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.includes(orderSearch);

      return matchOrderStatus && matchPaymentMethod && matchPaymentStatus && matchSearch;
    });
  }, [orders, orderStatusFilter, paymentMethodFilter, paymentStatusFilter, orderSearch]);

  // Analytics Metrics
  const analytics = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === today
    );

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const todayRevenue = todayOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const validOrdersCount = orders.filter((o) => o.status !== 'cancelled').length;
    const averageOrderValue = validOrdersCount > 0 ? totalRevenue / validOrdersCount : 0;

    // Customer spend map
    const customerMap = new Map<
      string,
      { name: string; phone: string; email?: string; count: number; spend: number; lastDate: string }
    >();
    orders.forEach((o) => {
      const key = o.customerPhone || o.userId;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: o.customerName,
          phone: o.customerPhone,
          email: o.customerEmail,
          count: 0,
          spend: 0,
          lastDate: o.createdAt,
        });
      }
      const c = customerMap.get(key)!;
      c.count += 1;
      if (o.status !== 'cancelled') c.spend += o.grandTotal;
      if (new Date(o.createdAt) > new Date(c.lastDate)) c.lastDate = o.createdAt;
    });

    const customersList = Array.from(customerMap.values()).sort((a, b) => b.spend - a.spend);

    return {
      totalRevenue,
      todayRevenue,
      todayOrdersCount: todayOrders.length,
      allOrdersCount: orders.length,
      averageOrderValue,
      customersCount: customerMap.size,
      customersList,
    };
  }, [orders]);

  // Aggregate Kitchen Prep Sheet data from active orders
  const kitchenPrep = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'cancelled');
    const saladMap = new Map<
      string,
      {
        name: string;
        totalKg: number;
        count250g: number;
        count500g: number;
        count1kg: number;
        otherCount: number;
      }
    >();
    const drinkMap = new Map<string, { name: string; flavor: string; count: number }>();
    const packageMap = new Map<string, { name: string; count: number }>();

    activeOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (item.selectedFlavor || item.selectedTier || item.productId.includes('drink')) {
          const flavorLabel = item.selectedFlavor || 'מבחר טעמים';
          const key = `${item.name} - ${flavorLabel}`;
          const current = drinkMap.get(key) || {
            name: item.name,
            flavor: flavorLabel,
            count: 0,
          };
          const multiplier = item.selectedTier ? item.selectedTier.quantity : 1;
          current.count += item.quantity * multiplier;
          drinkMap.set(key, current);
        } else if (item.productId.includes('pack') || item.name.includes('מארז')) {
          const current = packageMap.get(item.name) || { name: item.name, count: 0 };
          current.count += item.quantity;
          packageMap.set(item.name, current);
        } else {
          const current = saladMap.get(item.name) || {
            name: item.name,
            totalKg: 0,
            count250g: 0,
            count500g: 0,
            count1kg: 0,
            otherCount: 0,
          };
          if (item.selectedSize === '250g') {
            current.count250g += item.quantity;
            current.totalKg += item.quantity * 0.25;
          } else if (item.selectedSize === '1kg') {
            current.count1kg += item.quantity;
            current.totalKg += item.quantity * 1.0;
          } else if (item.selectedSize === '500g') {
            current.count500g += item.quantity;
            current.totalKg += item.quantity * 0.5;
          } else {
            current.otherCount += item.quantity;
            current.totalKg += item.quantity * 0.5;
          }
          saladMap.set(item.name, current);
        }
      });
    });

    const totalKgAll = Array.from(saladMap.values()).reduce((sum, s) => sum + s.totalKg, 0);

    return {
      salads: Array.from(saladMap.values()).sort((a, b) => b.totalKg - a.totalKg),
      drinks: Array.from(drinkMap.values()).sort((a, b) => b.count - a.count),
      packages: Array.from(packageMap.values()).sort((a, b) => b.count - a.count),
      totalKgAll,
      activeOrdersCount: activeOrders.length,
    };
  }, [orders]);

  const orderStatusOptions: { value: OrderStatus; label: string; color: string }[] = [
    { value: 'received', label: 'התקבלה', color: 'bg-amber-100 text-amber-800' },
    { value: 'in_review', label: 'בטיפול', color: 'bg-blue-100 text-blue-800' },
    { value: 'preparing', label: 'בהכנה', color: 'bg-orange-100 text-orange-800' },
    { value: 'on_the_way', label: 'בדרך', color: 'bg-purple-100 text-purple-800' },
    { value: 'completed', label: 'הושלמה', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'cancelled', label: 'בוטלה', color: 'bg-rose-100 text-rose-800' },
  ];

  const paymentMethodLabels: Record<PaymentMethod, string> = {
    cash: '💵 מזומן בעת איסוף',
    bit: '📱 Bit בעת איסוף',
    credit_card: '💳 אשראי באתר',
    phone: '📞 הזמנה טלפונית',
  };

  const paymentStatusLabels: Record<PaymentStatus, { label: string; color: string }> = {
    pending: { label: 'ממתין לתשלום', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    paid: { label: 'שולם', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    failed: { label: 'נכשל', color: 'bg-rose-100 text-rose-800 border-rose-300' },
    cancelled: { label: 'בוטל', color: 'bg-stone-100 text-stone-800 border-stone-300' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-[94vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">
                  פאנל ניהול ומטבח - SALAD BOX (נוף הגליל)
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  מחובר כמנהל
                </span>
              </div>
              <p className="text-xs text-stone-400">
                ניהול הזמנות בזמן אמת, אישור תשלומים, קטלוג סלטים וגדלים
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1 overflow-x-auto px-5 py-2.5 bg-stone-100 border-b border-stone-200 text-xs font-bold shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>הזמנות בזמן אמת ({orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('kitchen')}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'kitchen'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>👨‍🍳</span>
            <span>ריכוז למטבח (Kitchen Prep)</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>דוחות וביצועים</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>🥗</span>
            <span>מוצרים וגדלי סלטים ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'ingredients'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>מרכיבי הרכבה ({ingredients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>קטגוריות ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'customers'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>לקוחות ({analytics.customersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>הגדרות ומועדי הזמנה</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-stone-50/50">
          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Comprehensive Filter and Search Row */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="חיפוש לפי מספר הזמנה, שם, טלפון..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pr-9 pl-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
                    />
                  </div>

                  <div className="text-xs text-stone-500 font-medium">
                    מוצגות <strong>{filteredOrders.length}</strong> מתוך {orders.length} הזמנות
                  </div>
                </div>

                {/* Filter Rows */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-stone-100 text-xs">
                  {/* Status Filter */}
                  <div>
                    <span className="font-bold text-stone-700 block mb-1">סטטוס הזמנה:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                    >
                      <option value="all">כל הסטטוסים ({orders.length})</option>
                      {orderStatusOptions.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label} ({orders.filter((o) => o.status === st.value).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method Filter */}
                  <div>
                    <span className="font-bold text-stone-700 block mb-1">אמצעי תשלום:</span>
                    <select
                      value={paymentMethodFilter}
                      onChange={(e) => setPaymentMethodFilter(e.target.value)}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                    >
                      <option value="all">כל אמצעי התשלום ({orders.length})</option>
                      <option value="cash">💵 מזומן ({orders.filter((o) => o.paymentMethod === 'cash').length})</option>
                      <option value="bit">📱 Bit ({orders.filter((o) => o.paymentMethod === 'bit').length})</option>
                      <option value="credit_card">💳 אשראי ({orders.filter((o) => o.paymentMethod === 'credit_card').length})</option>
                    </select>
                  </div>

                  {/* Payment Status Filter */}
                  <div>
                    <span className="font-bold text-stone-700 block mb-1">סטטוס תשלום:</span>
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                    >
                      <option value="all">כל מצבי התשלום ({orders.length})</option>
                      <option value="pending">⏳ ממתין לתשלום ({orders.filter((o) => o.paymentStatus === 'pending').length})</option>
                      <option value="paid">✅ שולם ({orders.filter((o) => o.paymentStatus === 'paid').length})</option>
                      <option value="failed">❌ נכשל ({orders.filter((o) => o.paymentStatus === 'failed').length})</option>
                      <option value="cancelled">🚫 בוטל ({orders.filter((o) => o.paymentStatus === 'cancelled').length})</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Orders Queue Table / Cards matching the requested exact format */}
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
                    לא נמצאו הזמנות התואמות לסינון הנבחר.
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const currentStatus = orderStatusOptions.find((s) => s.value === order.status);
                    const paymentStatusInfo =
                      paymentStatusLabels[order.paymentStatus || 'pending'] ||
                      paymentStatusLabels.pending;

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-emerald-300 transition-all space-y-4"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-stone-900">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-stone-400">
                              {new Date(order.createdAt).toLocaleDateString('he-IL')} בשעה{' '}
                              {new Date(order.createdAt).toLocaleTimeString('he-IL', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span
                              className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                                currentStatus?.color || 'bg-stone-100 text-stone-800'
                              }`}
                            >
                              {currentStatus?.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* Receipt Button */}
                            <button
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-200 transition-colors shadow-2xs"
                              title="הפקת חשבונית מס קבלה דיגיטלית"
                            >
                              <span>📄</span>
                              <span>הפק קבלה</span>
                            </button>

                            {/* Slip / Print button */}
                            <button
                              onClick={() => setPrintOrder(order)}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                              title="בון מטבח והדפסה"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>בון מטבח</span>
                            </button>

                            {/* Call customer */}
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>חייג ללקוח</span>
                            </a>
                          </div>
                        </div>

                        {/* Customer & Area Block */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200/60">
                          <div>
                            <span className="text-stone-400 block font-medium">לקוח:</span>
                            <span className="font-bold text-stone-900 text-sm">{order.customerName}</span>
                            <span className="text-stone-600 block text-xs" dir="ltr">
                              {order.customerPhone}
                            </span>
                          </div>

                          <div>
                            <span className="text-stone-400 block font-medium">אזור ואופן קבלה:</span>
                            <div className="font-bold text-stone-900">
                              אזור: {order.deliveryType === 'delivery' ? 'נוף הגליל (משלוח)' : 'איסוף הסלטים מהסניף'}
                            </div>
                            {order.deliveryAddress && (
                              <span className="text-stone-700 block text-xs mt-0.5">
                                כתובת: {order.deliveryAddress.street} {order.deliveryAddress.houseNumber}
                                {order.deliveryAddress.apartment && `, דירה ${order.deliveryAddress.apartment}`},{' '}
                                {order.deliveryAddress.city}
                              </span>
                            )}
                            {order.deliveryAddress?.notes && (
                              <span className="text-stone-500 block text-[11px]">
                                הנחיות לשליח: {order.deliveryAddress.notes}
                              </span>
                            )}
                          </div>

                          {/* Payment section with manual confirmation button */}
                          <div className="space-y-1">
                            <span className="text-stone-400 block font-medium">תשלום:</span>
                            <div>
                              אמצעי תשלום:{' '}
                              <strong>
                                {order.paymentMethod === 'cash'
                                  ? 'מזומן'
                                  : order.paymentMethod === 'bit'
                                  ? 'Bit'
                                  : 'אשראי באתר'}
                              </strong>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>סטטוס:</span>
                              <span
                                className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${paymentStatusInfo.color}`}
                              >
                                {paymentStatusInfo.label}
                              </span>
                            </div>

                            {/* [ ✅ התשלום התקבל ] Button for Admin */}
                            {order.paymentStatus === 'pending' && (
                              <button
                                onClick={() => confirmPayment(order.id)}
                                className="mt-2 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>התשלום התקבל</span>
                              </button>
                            )}

                            {order.paymentStatus === 'paid' && order.paymentConfirmedAt && (
                              <div className="text-[10px] text-emerald-700 font-medium">
                                אושר בתאריך:{' '}
                                {new Date(order.paymentConfirmedAt).toLocaleString('he-IL', {
                                  day: 'numeric',
                                  month: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Products line items with exact salad sizes */}
                        <div className="space-y-1.5 text-xs">
                          <span className="font-bold text-stone-700 block">מוצרים וסלטים שהוזמנו:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {order.items.map((it, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl border border-stone-200/80 bg-stone-50/60 flex items-start justify-between"
                              >
                                <div>
                                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                    <span>🥗 {it.name}</span>
                                    {it.selectedSizeLabel && (
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black">
                                        {it.selectedSizeLabel}
                                      </span>
                                    )}
                                    <span>× {it.quantity}</span>
                                  </div>
                                  {it.customSummaryText && (
                                    <div className="text-[10px] text-stone-500 mt-0.5 space-y-0.5">
                                      {it.customSummaryText.slice(0, 2).map((t, i) => (
                                        <div key={i}>• {t}</div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <span className="font-black text-stone-900 shrink-0">
                                  ₪{(it.unitPrice * it.quantity).toFixed(0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Footer with Total & Status change buttons */}
                        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-stone-800">
                              סה"כ לתשלום:{' '}
                              <span className="text-emerald-800 text-base font-black">
                                ₪{order.grandTotal.toFixed(0)}
                              </span>
                            </span>
                            {order.deliveryFee > 0 && (
                              <span className="text-[11px] text-stone-400">
                                (כולל דמי משלוח ₪{order.deliveryFee})
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs text-stone-400 ml-1">עדכן סטטוס:</span>
                            {orderStatusOptions.map((st) => (
                              <button
                                key={st.value}
                                onClick={() => updateOrderStatus(order.id, st.value)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                  order.status === st.value
                                    ? 'bg-stone-900 text-white shadow-xs'
                                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Analytics KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
                  <div className="text-stone-400 text-xs font-medium flex items-center justify-between mb-1">
                    <span>הכנסות היום</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">
                    ₪{analytics.todayRevenue.toFixed(0)}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">
                    {analytics.todayOrdersCount} הזמנות היום
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
                  <div className="text-stone-400 text-xs font-medium flex items-center justify-between mb-1">
                    <span>הכנסות מצטברות</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">
                    ₪{analytics.totalRevenue.toFixed(0)}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    מתוך {analytics.allOrdersCount} הזמנות סה"כ
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
                  <div className="text-stone-400 text-xs font-medium flex items-center justify-between mb-1">
                    <span>ממוצע להזמנה</span>
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">
                    ₪{analytics.averageOrderValue.toFixed(0)}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">סל ממוצע ללקוח</div>
                </div>

                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
                  <div className="text-stone-400 text-xs font-medium flex items-center justify-between mb-1">
                    <span>לקוחות פעילים</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-stone-900">
                    {analytics.customersCount}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">
                    לקוחות בנוף הגליל והסביבה
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-bold text-stone-900 text-sm">התפלגות סטטוס הזמנות</h3>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                  {orderStatusOptions.map((st) => {
                    const count = orders.filter((o) => o.status === st.value).length;
                    const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                    return (
                      <div key={st.value} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-center">
                        <div className="text-xs text-stone-600 font-bold">{st.label}</div>
                        <div className="text-xl font-black text-stone-900 my-1">{count}</div>
                        <div className="text-[10px] text-stone-400">{pct}% מסך ההזמנות</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRODUCTS & DYNAMIC SIZES MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              {/* Header & Explanation Banner */}
              <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white p-5 rounded-2xl shadow-sm border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-black text-lg text-white">
                      ניהול מחירי גדלים דינמיים לסלטים (250 גרם, 500 גרם, 1 ק"ג)
                    </h3>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed max-w-2xl">
                    לכל סלט מוגדרים שלושה מחירים עצמאיים לפי גודל הנשמרים ישירות ב-Firestore.
                    ניתן לערוך ולשמור מחירים במהירות לכל סלט בנפרד, ללא תלות במחיר סטטי יחיד.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingProduct({
                        id: `prod_drink_${Date.now()}`,
                        name: 'פחית שתייה קרה B.I',
                        description: 'פחיות שתייה מרעננות ומקוררות בטעמים לבחירה מבית "B.I פיתות לאירועים". מוגש קר עם קרח!',
                        price: 14,
                        categoryId: 'drinks',
                        image: biDrinkCansImage,
                        pricingModel: 'flat',
                        isDrink: true,
                        isAvailable: true,
                        isPopular: true,
                        order: products.length + 1,
                        drinkFlavors: [
                          'תפוח עץ ונענע 🍏',
                          'לימונדה קלאסית 🍋',
                          'תות שדה מרענן 🍓',
                          'פירות יער ובלו ברי 🫐',
                        ],
                        drinkTiers: [
                          { id: 'single', label: 'פחית בודדת (1 יח׳)', quantity: 1, price: 14 },
                          { id: 'duo', label: 'זוג פחיות (2 יח׳)', quantity: 2, price: 26, badge: 'חיסכון ₪2' },
                          { id: 'quad', label: 'רביעיית פחיות (4 יח׳)', quantity: 4, price: 48, badge: 'חיסכון ₪8' },
                          { id: 'six', label: 'שישיית פחיות (6 יח׳)', quantity: 6, price: 70, badge: 'חיסכון ₪14' },
                        ],
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <span>🥤</span>
                    <span>+ הוסף פחית שתייה</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingProduct({
                        id: `prod_${Date.now()}`,
                        name: '',
                        description: '',
                        price: 45,
                        categoryId: 'shabbat-salads',
                        image:
                          'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
                        isCustomizable: false,
                        isAvailable: true,
                        order: products.length + 1,
                        pricingModel: 'sizes',
                        sizes: {
                          '250g': 26,
                          '500g': 45,
                          '1kg': 79,
                        },
                        defaultSize: '500g',
                      });
                      setIsProductModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>הוסף סלט חדש</span>
                  </button>
                </div>
              </div>

              {/* Controls Bar: Search, Category Filter, and View Mode Toggle */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="חיפוש סלט לפי שם או תיאור..."
                      className="w-full pr-9 pl-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                    {productSearch && (
                      <button
                        onClick={() => setProductSearch('')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category filter */}
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="p-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800"
                  >
                    <option value="all">כל הקטגוריות ({products.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({products.filter((p) => p.categoryId === c.id).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl self-end md:self-auto">
                  <button
                    onClick={() => setProductViewMode('grid')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                      productViewMode === 'grid'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>תצוגת כרטיסים ועריכה מהירה</span>
                  </button>

                  <button
                    onClick={() => setProductViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                      productViewMode === 'table'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>טבלת מחירי גדלים מהירה</span>
                  </button>
                </div>
              </div>

              {/* VIEW 1: CARDS GRID VIEW */}
              {productViewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((prod) => {
                    const currentSizes = getProductSizes(prod);
                    const isInlineEditing = inlineEditingProductId === prod.id;
                    const isToastVisible = savedSizesToast[prod.id];
                    const isSavingThis = isUpdatingSizeId === prod.id;

                    return (
                      <div
                        key={prod.id}
                        className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between gap-3.5 transition-all ${
                          isInlineEditing
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                            : 'border-stone-200 hover:border-emerald-300'
                        }`}
                      >
                        {/* Toast indicator */}
                        {isToastVisible && (
                          <div className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>מחירי הגדלים נשמרו בהצלחה במסד!</span>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0 shadow-xs"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                                {categories.find((c) => c.id === prod.categoryId)?.name || prod.categoryId}
                              </span>
                              {prod.isCustomizable && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  הרכבה אישית
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-stone-900 leading-snug line-clamp-1 mt-1">
                              {prod.name}
                            </h4>
                            <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {prod.description}
                            </p>
                          </div>
                        </div>

                        {/* DRINK PRICING OR SIZES PRICING BOX */}
                        {prod.isDrink || prod.categoryId === 'drinks' ? (
                          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-amber-950 flex items-center gap-1">
                                <span>🥤</span>
                                <span>
                                  {prod.pricingModel === 'tiered' || (prod.drinkTiers && prod.drinkTiers.length > 0)
                                    ? 'מחיר מדורג לפחיות שתייה:'
                                    : 'מחיר אחיד לפחית:'}
                                </span>
                              </span>

                              <button
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setIsProductModalOpen(true);
                                }}
                                className="text-amber-800 hover:text-amber-950 font-black flex items-center gap-1 hover:underline text-[10px]"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>ערוך מחיר/טעמים</span>
                              </button>
                            </div>

                            {prod.pricingModel === 'tiered' || (prod.drinkTiers && prod.drinkTiers.length > 0) ? (
                              <div className="grid grid-cols-2 gap-1 text-[10px]">
                                {(prod.drinkTiers || []).map((t) => (
                                  <div key={t.id} className="bg-white p-1.5 rounded-lg border border-amber-200 text-center font-bold">
                                    <span className="text-stone-600 block truncate">{t.label}</span>
                                    <span className="text-emerald-800 font-black text-xs">₪{t.price}</span>
                                    {t.badge && <span className="text-[9px] text-amber-700 block font-semibold">{t.badge}</span>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-white p-2 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
                                <span className="text-stone-600 font-medium">מחיר אחיד לפחית:</span>
                                <span className="text-emerald-800 font-black text-sm">₪{prod.price}</span>
                              </div>
                            )}

                            {prod.drinkFlavors && prod.drinkFlavors.length > 0 && (
                              <div className="text-[10px] text-amber-950 pt-1 border-t border-amber-200/60 flex items-center gap-1">
                                <span className="font-bold shrink-0">טעמים ({prod.drinkFlavors.length}):</span>
                                <span className="truncate text-stone-600">{prod.drinkFlavors.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* SIZES PRICING INTERACTIVE BOX */
                          <div className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/80 space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-stone-700 flex items-center gap-1">
                                <Scale className="w-3.5 h-3.5 text-emerald-700" />
                                <span>מחירי גדלים (250g / 500g / 1kg):</span>
                              </span>

                              {!isInlineEditing ? (
                                <button
                                  onClick={() => setInlineEditingProductId(prod.id)}
                                  className="text-emerald-700 hover:text-emerald-800 font-black flex items-center gap-1 hover:underline"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>ערוך מחירי גדלים</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAutoRatioSizes(prod.id)}
                                  className="text-[10px] text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 transition-colors"
                                  title="חישוב אוטומטי מ-500 גרם (60% ו-175%)"
                                >
                                  <Sparkles className="w-3 h-3 text-emerald-700" />
                                  <span>יחס מומלץ</span>
                                </button>
                              )}
                            </div>

                            {/* Editable Inputs or Badges */}
                            {isInlineEditing ? (
                              <div className="space-y-2 pt-1">
                                <div className="grid grid-cols-3 gap-1.5">
                                  <div>
                                    <label className="block text-[10px] font-bold text-stone-500 mb-0.5 text-center">
                                      250 גרם
                                    </label>
                                    <div className="relative">
                                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] font-bold">
                                        ₪
                                      </span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={currentSizes['250g']}
                                        onChange={(e) =>
                                          handleUpdateQuickSizeInput(
                                            prod.id,
                                            '250g',
                                            Number(e.target.value)
                                          )
                                        }
                                        className="w-full pl-4 pr-1 py-1 text-center bg-white border border-emerald-400 rounded-lg font-black text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-stone-500 mb-0.5 text-center">
                                      500 גרם (בסיס)
                                    </label>
                                    <div className="relative">
                                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] font-bold">
                                        ₪
                                      </span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={currentSizes['500g']}
                                        onChange={(e) =>
                                          handleUpdateQuickSizeInput(
                                            prod.id,
                                            '500g',
                                            Number(e.target.value)
                                          )
                                        }
                                        className="w-full pl-4 pr-1 py-1 text-center bg-white border border-emerald-400 rounded-lg font-black text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-stone-500 mb-0.5 text-center">
                                      1 ק"ג
                                    </label>
                                    <div className="relative">
                                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-stone-400 text-[10px] font-bold">
                                        ₪
                                      </span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={currentSizes['1kg']}
                                        onChange={(e) =>
                                          handleUpdateQuickSizeInput(
                                            prod.id,
                                            '1kg',
                                            Number(e.target.value)
                                          )
                                        }
                                        className="w-full pl-4 pr-1 py-1 text-center bg-white border border-emerald-400 rounded-lg font-black text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setInlineEditingProductId(null)}
                                    className="px-2.5 py-1 text-stone-500 hover:text-stone-700 text-xs font-semibold rounded-lg transition-colors"
                                  >
                                    בטל
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSavingThis}
                                    onClick={() => handleSaveProductSizes(prod.id)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shadow-xs flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                                  >
                                    <Save className="w-3 h-3" />
                                    <span>{isSavingThis ? 'שומר...' : 'שמור מחירים'}</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-1.5 text-center font-bold text-[11px]">
                                <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                                  <span className="text-stone-400 block text-[9px]">250 גרם</span>
                                  <span className="text-emerald-800 font-black">₪{currentSizes['250g']}</span>
                                </div>
                                <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                                  <span className="text-stone-400 block text-[9px]">500 גרם</span>
                                  <span className="text-emerald-800 font-black">₪{currentSizes['500g']}</span>
                                </div>
                                <div className="bg-white p-1.5 rounded-lg border border-stone-200">
                                  <span className="text-stone-400 block text-[9px]">1 ק"ג</span>
                                  <span className="text-emerald-800 font-black">₪{currentSizes['1kg']}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Card footer actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                          {/* Availability toggle */}
                          <button
                            onClick={() => toggleProductAvailability(prod.id, !prod.isAvailable)}
                            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                              prod.isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {prod.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{prod.isAvailable ? 'במלאי' : 'אזל'}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct(prod);
                                setIsProductModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-stone-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-bold flex items-center gap-1"
                              title="עריכה מפורטת של המוצר והגדלים"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>עריכה מלאה</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`האם למחוק את "${prod.name}"?`)) {
                                  deleteProduct(prod.id);
                                }
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="מחק מוצר"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW 2: COMPREHENSIVE SIZES PRICING TABLE VIEW */}
              {productViewMode === 'table' && (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-3.5">סלט / מוצר</th>
                          <th className="p-3.5">קטגוריה</th>
                          <th className="p-3.5 text-center">מחיר 250 גרם (רבע קילו)</th>
                          <th className="p-3.5 text-center">מחיר 500 גרם (חצי קילו)</th>
                          <th className="p-3.5 text-center">מחיר 1 ק"ג (קילו)</th>
                          <th className="p-3.5 text-center">יחס מהיר</th>
                          <th className="p-3.5 text-center">שמירה במסד</th>
                          <th className="p-3.5 text-center">סטטוס</th>
                          <th className="p-3.5 text-center">פעולות</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {filteredProducts.map((prod) => {
                          const currentSizes = getProductSizes(prod);
                          const isToastVisible = savedSizesToast[prod.id];
                          const isSavingThis = isUpdatingSizeId === prod.id;

                          return (
                            <tr key={prod.id} className="hover:bg-stone-50/80 transition-colors">
                              {/* Product info */}
                              <td className="p-3.5">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0 shadow-xs"
                                  />
                                  <div>
                                    <div className="font-bold text-stone-900 leading-tight">
                                      {prod.name}
                                    </div>
                                    <div className="text-[10px] text-stone-400">ID: {prod.id}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="p-3.5 text-stone-600 font-medium">
                                {categories.find((c) => c.id === prod.categoryId)?.name || prod.categoryId}
                              </td>

                              {prod.isDrink || prod.categoryId === 'drinks' ? (
                                <td colSpan={4} className="p-3.5 text-center">
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                        {prod.pricingModel === 'tiered' || (prod.drinkTiers && prod.drinkTiers.length > 0)
                                          ? `📊 מחיר מדורג (${prod.drinkTiers?.length || 4} מדרגות)`
                                          : `🏷️ מחיר אחיד: ₪${prod.price} לפחית`}
                                      </span>
                                      {prod.drinkFlavors && prod.drinkFlavors.length > 0 && (
                                        <span className="text-[10px] text-stone-500 font-medium">
                                          ({prod.drinkFlavors.length} טעמים)
                                        </span>
                                      )}
                                    </div>
                                    {prod.drinkFlavors && prod.drinkFlavors.length > 0 && (
                                      <div className="text-[10px] text-stone-600 truncate max-w-xs">
                                        {prod.drinkFlavors.join(' • ')}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              ) : (
                                <>
                                  {/* 250g Price Input */}
                                  <td className="p-3.5 text-center">
                                    <div className="inline-flex items-center relative w-24">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">
                                        ₪
                                      </span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={currentSizes['250g']}
                                        onChange={(e) =>
                                          handleUpdateQuickSizeInput(
                                            prod.id,
                                            '250g',
                                            Number(e.target.value)
                                          )
                                        }
                                        className="w-full pr-2 pl-5 py-1.5 text-center bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-emerald-600 rounded-lg font-black text-stone-900 focus:outline-none"
                                      />
                                    </div>
                                  </td>

                                  {/* 500g Price Input */}
                                  <td className="p-3.5 text-center">
                                    <div className="inline-flex items-center relative w-24">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">
                                        ₪
                                      </span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={currentSizes['500g']}
                                        onChange={(e) =>
                                          handleUpdateQuickSizeInput(
                                            prod.id,
                                            '500g',
                                            Number(e.target.value)
                                          )
                                        }
                                        className="w-full pr-2 pl-5 py-1.5 text-center bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-emerald-600 rounded-lg font-black text-emerald-900 focus:outline-none"
                                      />
                                    </div>
                                  </td>

                                  {/* 1kg Price Input */}
                                  <td className="p-3.5 text-center">
                                    <div className="inline-flex items-center relative w-24">
                                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">
                                        ₪
                                      </span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={currentSizes['1kg']}
                                        onChange={(e) =>
                                          handleUpdateQuickSizeInput(
                                            prod.id,
                                            '1kg',
                                            Number(e.target.value)
                                          )
                                        }
                                        className="w-full pr-2 pl-5 py-1.5 text-center bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-emerald-600 rounded-lg font-black text-stone-900 focus:outline-none"
                                      />
                                    </div>
                                  </td>

                                  {/* Auto ratio button */}
                                  <td className="p-3.5 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleAutoRatioSizes(prod.id)}
                                      className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                                      title="חישוב אוטומטי מ-500 גרם (60% ו-175%)"
                                    >
                                      <Sparkles className="w-3 h-3 text-emerald-600" />
                                      <span>חשב יחס</span>
                                    </button>
                                  </td>
                                </>
                              )}

                              {/* Save button & feedback */}
                              <td className="p-3.5 text-center">
                                {isToastVisible ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-700 font-black bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>נשמר במסד!</span>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isSavingThis}
                                    onClick={() => handleSaveProductSizes(prod.id)}
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-black text-xs shadow-xs inline-flex items-center gap-1 transition-all active:scale-95"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>{isSavingThis ? 'שומר...' : 'שמור'}</span>
                                  </button>
                                )}
                              </td>

                              {/* Availability */}
                              <td className="p-3.5 text-center">
                                <button
                                  onClick={() =>
                                    toggleProductAvailability(prod.id, !prod.isAvailable)
                                  }
                                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                    prod.isAvailable
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {prod.isAvailable ? 'במלאי' : 'אזל'}
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="p-3.5 text-center">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(prod);
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition-colors"
                                    title="עריכה מפורטת"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`האם למחוק את "${prod.name}"?`)) {
                                        deleteProduct(prod.id);
                                      }
                                    }}
                                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="מחק מוצר"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: INGREDIENTS */}
          {activeTab === 'ingredients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">מרכיבי סלטים להרכבה אישית</h3>
                  <p className="text-xs text-stone-500">
                    בסיסים, ירקות, חלבונים, תוספות קראנץ׳ ורטבים
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingIngredient({
                      id: `ing_${Date.now()}`,
                      name: '',
                      category: 'veggie',
                      price: 0,
                      isAvailable: true,
                      calories: 20,
                      icon: '🥗',
                    });
                    setIsIngredientModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>הוסף מרכיב חדש</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {ingredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="p-3 bg-white rounded-2xl border border-stone-200 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{ing.icon || '🥗'}</span>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-stone-900">{ing.name}</div>
                        <div className="text-[11px] text-stone-500">
                          {ing.category} • {ing.price > 0 ? `+₪${ing.price}` : 'כלול'} • {ing.calories} קק״ל
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleIngredientAvailability(ing.id, !ing.isAvailable)}
                        className={`p-1.5 rounded-lg text-xs font-bold ${
                          ing.isAvailable ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                        }`}
                        title={ing.isAvailable ? 'זמין' : 'אזל'}
                      >
                        {ing.isAvailable ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          setEditingIngredient(ing);
                          setIsIngredientModalOpen(true);
                        }}
                        className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`למחוק את "${ing.name}"?`)) {
                            deleteIngredient(ing.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">ניהול קטגוריות תפריט</h3>
                  <p className="text-xs text-stone-500">סלטים, מנות, שתייה, קינוחים ומאפים</p>
                </div>

                <button
                  onClick={() => {
                    setEditingCategory({
                      id: `cat_${Date.now()}`,
                      name: '',
                      icon: '🥗',
                      order: categories.length + 1,
                      isActive: true,
                    });
                    setIsCategoryModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>קטגוריה חדשה</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 bg-white rounded-2xl border border-stone-200 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <div className="font-bold text-sm text-stone-900">{cat.name}</div>
                        <div className="text-[11px] text-stone-500">סדר תצוגה: {cat.order}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-2 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`למחוק את קטגוריית "${cat.name}"?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-stone-900 text-base">לקוחות והיסטוריית הזמנות</h3>
                <p className="text-xs text-stone-500">
                  רשימת הלקוחות שהזמינו, סך רכישות מצטבר והזמנה אחרונה
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
                      <tr>
                        <th className="p-3">שם הלקוח</th>
                        <th className="p-3">טלפון</th>
                        <th className="p-3">אימייל</th>
                        <th className="p-3">מספר הזמנות</th>
                        <th className="p-3">סך קניות</th>
                        <th className="p-3">הזמנה אחרונה</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {analytics.customersList.map((cust, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                          <td className="p-3 font-bold text-stone-900">{cust.name}</td>
                          <td className="p-3 text-stone-700" dir="ltr">
                            {cust.phone}
                          </td>
                          <td className="p-3 text-stone-500" dir="ltr">
                            {cust.email || '-'}
                          </td>
                          <td className="p-3 font-semibold text-stone-800">{cust.count}</td>
                          <td className="p-3 font-black text-emerald-800">
                            ₪{cust.spend.toFixed(0)}
                          </td>
                          <td className="p-3 text-stone-500">
                            {new Date(cust.lastDate).toLocaleDateString('he-IL')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & DEADLINES */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  הגדרות הפצה, מועדי הזמנה וסניף
                </h3>
                <p className="text-xs text-stone-500">
                  הגדרת אזור ההפצה (נוף הגליל בלבד) ומועד סגירת ההזמנות השבועי (יום שלישי)
                </p>
              </div>

              {/* Weekly Cutoff configuration box */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span>מועד אחרון להזמנות שבועיות: יום שלישי בחצות</span>
                  </span>
                  <button
                    onClick={() =>
                      updateSettings({ cutoffOverrideOpen: !settings.cutoffOverrideOpen })
                    }
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      settings.cutoffOverrideOpen
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-700 text-white'
                    }`}
                  >
                    {settings.cutoffOverrideOpen ? 'מצב עקיפה פעיל (הזמנות פתוחות תמיד)' : 'מצב רגיל (סגירה בשלישי)'}
                  </button>
                </div>
                <p className="text-xs text-emerald-800">
                  הזמנות סלטים מתקבלות עבור המחזור השבועי עד יום שלישי ב-23:59. לאחר מכן המערכת מודיעה ללקוח שמועד ההזמנות למחזור הנוכחי הסתיים.
                </p>
              </div>

              {/* Distribution Zone Notice */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <span>אזור הפצה יחיד: נוף הגליל</span>
                </div>
                <p>
                  משלוחים מתבצעים אך ורק לכתובות בנוף הגליל. כל ניסיון הזמנה לכתובת אחרת נחסם מיידית עם הודעה ברורה.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">שם העסק</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => updateSettings({ storeName: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">טלפון להתקשרות</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => updateSettings({ phone: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    כתובת הסניף (לאיסוף הסלטים)
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => updateSettings({ address: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">שעות פעילות</label>
                  <input
                    type="text"
                    value={settings.openingHoursText}
                    onChange={(e) => updateSettings({ openingHoursText: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    מינימום להזמנה (₪)
                  </label>
                  <input
                    type="number"
                    value={settings.minOrderAmount}
                    onChange={(e) => updateSettings({ minOrderAmount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    משלוח חינם מעל (₪)
                  </label>
                  <input
                    type="number"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) =>
                      updateSettings({ freeDeliveryThreshold: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    דמי משלוח בנוף הגליל (₪)
                  </label>
                  <input
                    type="number"
                    value={settings.baseDeliveryFee}
                    onChange={(e) => updateSettings({ baseDeliveryFee: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Reset to sample data */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900 text-xs">שחזור נתוני דוגמה ראשוניים</div>
                  <div className="text-[11px] text-stone-500">
                    מאפס את קטלוג הסלטים והמרכיבים להגדרות ברירת המחדל
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (confirm('האם לשחזר את כל נתוני הדוגמה הראשוניים של הסלטים?')) {
                      await resetToSampleData();
                      alert('הנתונים שוחזרו בהצלחה!');
                    }
                  }}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>שחזר נתונים</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Edit / Add Product with 250g / 500g / 1kg sizes pricing */}
        {isProductModalOpen && editingProduct && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-stone-900 text-base">
                  {editingProduct.id.includes('prod_') ? 'סלט / מוצר חדש' : 'עריכת סלט ומחירי גדלים'}
                </h3>
                <button onClick={() => setIsProductModalOpen(false)}>
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">שם הסלט</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">תיאור</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">קטגוריה</label>
                    <select
                      value={editingProduct.categoryId}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        const isNowDrink = newCat === 'drinks';
                        setEditingProduct({
                          ...editingProduct,
                          categoryId: newCat,
                          isDrink: isNowDrink ? true : editingProduct.isDrink,
                          pricingModel: isNowDrink
                            ? (editingProduct.pricingModel === 'sizes' ? 'flat' : editingProduct.pricingModel || 'flat')
                            : (editingProduct.pricingModel || 'sizes'),
                          image: (isNowDrink && (!editingProduct.image || editingProduct.image.includes('unsplash')))
                            ? biDrinkCansImage
                            : editingProduct.image,
                          drinkFlavors: isNowDrink && (!editingProduct.drinkFlavors || editingProduct.drinkFlavors.length === 0)
                            ? [
                                'תפוח עץ ונענע 🍏',
                                'לימונדה קלאסית 🍋',
                                'תות שדה מרענן 🍓',
                                'פירות יער ובלו ברי 🫐',
                              ]
                            : editingProduct.drinkFlavors,
                        });
                      }}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">כתובת תמונה (URL)</label>
                    <input
                      type="text"
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-left font-mono text-[11px]"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Quick Brand Assets Image Selection Palette */}
                <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-600 block">
                    בחירת תמונה מהירה מתמונות המותג (לחץ לבחירה):
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'פחיות שתייה B.I', src: biDrinkCansImage },
                      { name: 'שולחן שישי מלא', src: fullShabbatTableImage },
                      { name: 'שום קונפי ברוזמרין', src: garlicConfitImage },
                      { name: 'סלט כרוב גזר פריך', src: cabbageCarrotImage },
                    ].map((imgItem) => {
                      const isSelected = editingProduct.image === imgItem.src;
                      return (
                        <button
                          key={imgItem.name}
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, image: imgItem.src })}
                          className={`rounded-xl overflow-hidden border p-1 transition-all text-center ${
                            isSelected
                              ? 'border-emerald-600 ring-2 ring-emerald-500/30 bg-white shadow-xs'
                              : 'border-stone-200 hover:border-emerald-400 bg-white/70'
                          }`}
                        >
                          <img
                            src={imgItem.src}
                            alt={imgItem.name}
                            className="w-full h-12 object-cover rounded-lg"
                          />
                          <span className={`text-[9px] font-bold block truncate mt-1 ${isSelected ? 'text-emerald-800' : 'text-stone-600'}`}>
                            {imgItem.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PRICING MODEL SELECTOR: Flat, Tiered, or Sizes */}
                <div className="p-3.5 bg-stone-50/90 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-emerald-700" />
                      <span>מודל תמחור: מחיר אחיד / מדורג / גדלים:</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, pricingModel: 'flat' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                        (editingProduct.pricingModel === 'flat' || (!editingProduct.pricingModel && !editingProduct.sizes && !editingProduct.drinkTiers))
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      <span>🏷️ מחיר אחיד</span>
                      <span className="text-[10px] opacity-85 font-normal">למשל ₪14 לפחית</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const defaultTiers = editingProduct.drinkTiers && editingProduct.drinkTiers.length > 0
                          ? editingProduct.drinkTiers
                          : [
                              { id: 'single', label: 'פחית בודדת (1 יח׳)', quantity: 1, price: 14 },
                              { id: 'duo', label: 'זוג פחיות (2 יח׳)', quantity: 2, price: 26, badge: 'חיסכון ₪2' },
                              { id: 'quad', label: 'רביעיית פחיות (4 יח׳)', quantity: 4, price: 48, badge: 'חיסכון ₪8' },
                              { id: 'six', label: 'שישיית פחיות (6 יח׳)', quantity: 6, price: 70, badge: 'חיסכון ₪14' },
                            ];
                        setEditingProduct({
                          ...editingProduct,
                          pricingModel: 'tiered',
                          drinkTiers: defaultTiers,
                        });
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                        editingProduct.pricingModel === 'tiered' || (editingProduct.drinkTiers && editingProduct.drinkTiers.length > 0)
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <span>📊 מחיר מדורג</span>
                      <span className="text-[10px] opacity-85 font-normal">לפי כמות ומארזים</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const base = editingProduct.sizes?.['500g'] || editingProduct.price || 45;
                        setEditingProduct({
                          ...editingProduct,
                          pricingModel: 'sizes',
                          sizes: editingProduct.sizes || {
                            '250g': Math.round(base * 0.6),
                            '500g': base,
                            '1kg': Math.round(base * 1.75),
                          },
                        });
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                        editingProduct.pricingModel === 'sizes' || (editingProduct.sizes && !editingProduct.drinkTiers && editingProduct.pricingModel !== 'flat')
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      <span>⚖️ מחירי גדלים</span>
                      <span className="text-[10px] opacity-85 font-normal">250g / 500g / 1kg</span>
                    </button>
                  </div>

                  {/* 1. Flat Price input */}
                  {(editingProduct.pricingModel === 'flat' || (!editingProduct.pricingModel && !editingProduct.sizes && !editingProduct.drinkTiers)) && (
                    <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1.5">
                      <label className="block font-bold text-stone-800 text-xs">
                        מחיר אחיד לפריט / לפחית (₪) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-stone-400">₪</span>
                        <input
                          type="number"
                          min={1}
                          required
                          value={editingProduct.price ?? 14}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          className="w-full p-2.5 pl-8 bg-stone-50 border border-stone-200 rounded-xl font-black text-emerald-950 text-base focus:bg-white focus:border-emerald-600 focus:outline-none"
                          placeholder="14"
                        />
                      </div>
                      <p className="text-[11px] text-stone-500">
                        מחיר אחיד קבוע. הלקוח יוכל לבחור טעם (אם הוגדרו טעמים) ולהוסיף כל כמות לסל.
                      </p>
                    </div>
                  )}

                  {/* 2. Tiered Pricing Manager (מחיר מדורג) */}
                  {(editingProduct.pricingModel === 'tiered' || (editingProduct.drinkTiers && editingProduct.drinkTiers.length > 0)) && (
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950 text-xs">
                          מדרגות מחיר (למשל: 1 פחית, זוג, רביעייה, שישייה):
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct({
                              ...editingProduct,
                              pricingModel: 'tiered',
                              drinkTiers: [
                                { id: 'single', label: 'פחית בודדת (1 יח׳)', quantity: 1, price: 14 },
                                { id: 'duo', label: 'זוג פחיות (2 יח׳)', quantity: 2, price: 26, badge: 'חיסכון ₪2' },
                                { id: 'quad', label: 'רביעיית פחיות (4 יח׳)', quantity: 4, price: 48, badge: 'חיסכון ₪8' },
                                { id: 'six', label: 'שישיית פחיות (6 יח׳)', quantity: 6, price: 70, badge: 'חיסכון ₪14' },
                              ],
                            });
                          }}
                          className="text-[10px] font-bold text-amber-900 bg-white hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 transition-colors shadow-2xs"
                        >
                          ✨ החל מדרגות מומלצות
                        </button>
                      </div>

                      {/* Tiers list */}
                      <div className="space-y-1.5">
                        {(editingProduct.drinkTiers || []).map((tier, idx) => (
                          <div key={tier.id || idx} className="grid grid-cols-12 gap-1.5 items-center bg-white p-2 rounded-xl border border-amber-200 text-xs">
                            <div className="col-span-5">
                              <label className="text-[10px] text-stone-500 font-bold block mb-0.5">שם המדרגה</label>
                              <input
                                type="text"
                                value={tier.label}
                                onChange={(e) => {
                                  const updated = [...(editingProduct.drinkTiers || [])];
                                  updated[idx] = { ...tier, label: e.target.value };
                                  setEditingProduct({ ...editingProduct, drinkTiers: updated });
                                }}
                                className="w-full p-1 bg-stone-50 border border-stone-200 rounded text-xs font-bold"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="text-[10px] text-stone-500 font-bold block mb-0.5 text-center">כמות</label>
                              <input
                                type="number"
                                min={1}
                                value={tier.quantity}
                                onChange={(e) => {
                                  const updated = [...(editingProduct.drinkTiers || [])];
                                  updated[idx] = { ...tier, quantity: Number(e.target.value) };
                                  setEditingProduct({ ...editingProduct, drinkTiers: updated });
                                }}
                                className="w-full p-1 bg-stone-50 border border-stone-200 rounded text-xs font-black text-center"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="text-[10px] text-stone-500 font-bold block mb-0.5 text-center">מחיר ₪</label>
                              <input
                                type="number"
                                min={1}
                                value={tier.price}
                                onChange={(e) => {
                                  const updated = [...(editingProduct.drinkTiers || [])];
                                  updated[idx] = { ...tier, price: Number(e.target.value) };
                                  setEditingProduct({ ...editingProduct, drinkTiers: updated });
                                }}
                                className="w-full p-1 bg-white border border-emerald-400 rounded text-xs font-black text-emerald-800 text-center"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="text-[10px] text-stone-500 font-bold block mb-0.5">תגית</label>
                              <input
                                type="text"
                                placeholder="חיסכון ₪8"
                                value={tier.badge || ''}
                                onChange={(e) => {
                                  const updated = [...(editingProduct.drinkTiers || [])];
                                  updated[idx] = { ...tier, badge: e.target.value };
                                  setEditingProduct({ ...editingProduct, drinkTiers: updated });
                                }}
                                className="w-full p-1 bg-stone-50 border border-stone-200 rounded text-[10px]"
                              />
                            </div>

                            <div className="col-span-1 flex justify-center pt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingProduct.drinkTiers || []).filter((_, i) => i !== idx);
                                  setEditingProduct({ ...editingProduct, drinkTiers: updated });
                                }}
                                className="text-stone-300 hover:text-rose-500 transition-colors p-1"
                                title="מחק מדרגה"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const cur = editingProduct.drinkTiers || [];
                          const nextQty = cur.length > 0 ? (cur[cur.length - 1].quantity || 1) + 2 : 1;
                          const nextPrice = cur.length > 0 ? (cur[cur.length - 1].price || 14) + 20 : 14;
                          setEditingProduct({
                            ...editingProduct,
                            drinkTiers: [
                              ...cur,
                              {
                                id: `tier_${Date.now()}`,
                                label: `מארז ${nextQty} פחיות`,
                                quantity: nextQty,
                                price: nextPrice,
                                badge: 'מבצע',
                              },
                            ],
                          });
                        }}
                        className="w-full py-1.5 bg-white hover:bg-amber-100/60 border border-dashed border-amber-300 rounded-xl text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>הוסף מדרגת מחיר נוספת</span>
                      </button>
                    </div>
                  )}

                  {/* 3. Sizes Pricing (250g, 500g, 1kg) */}
                  {(editingProduct.pricingModel === 'sizes' || (editingProduct.sizes && !editingProduct.drinkTiers && editingProduct.pricingModel !== 'flat')) && (
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                          <Scale className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>מחירי גדלים (250 גרם, 500 גרם, 1 ק"ג):</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const base = editingProduct.sizes?.['500g'] || editingProduct.price || 45;
                            setEditingProduct({
                              ...editingProduct,
                              price: base,
                              sizes: {
                                '250g': Math.round(base * 0.6),
                                '500g': base,
                                '1kg': Math.round(base * 1.75),
                              },
                            });
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                          title="חישוב אוטומטי מומלץ (250 גרם = 60%, 1 ק״ג = 175%)"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>חשב יחס מומלץ</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                            250 גרם (רבע קילו) ₪ *
                          </label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={
                              editingProduct.sizes?.['250g'] ??
                              Math.round((editingProduct.price || 45) * 0.6)
                            }
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const curSizes = editingProduct.sizes || {
                                '250g': 26,
                                '500g': editingProduct.price || 45,
                                '1kg': 79,
                              };
                              setEditingProduct({
                                ...editingProduct,
                                sizes: {
                                  ...curSizes,
                                  '250g': val,
                                },
                              });
                            }}
                            className="w-full p-2 bg-white border border-stone-200 rounded-xl font-black text-emerald-950 focus:border-emerald-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                            500 גרם (חצי קילו) ₪ *
                          </label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={
                              editingProduct.sizes?.['500g'] ?? (editingProduct.price || 45)
                            }
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const curSizes = editingProduct.sizes || {
                                '250g': Math.round(val * 0.6),
                                '500g': val,
                                '1kg': Math.round(val * 1.75),
                              };
                              setEditingProduct({
                                ...editingProduct,
                                price: val,
                                sizes: {
                                  ...curSizes,
                                  '500g': val,
                                },
                              });
                            }}
                            className="w-full p-2 bg-white border border-stone-200 rounded-xl font-black text-emerald-950 focus:border-emerald-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                            1 ק"ג (קילו) ₪ *
                          </label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={
                              editingProduct.sizes?.['1kg'] ??
                              Math.round((editingProduct.price || 45) * 1.75)
                            }
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const curSizes = editingProduct.sizes || {
                                '250g': 26,
                                '500g': editingProduct.price || 45,
                                '1kg': 79,
                              };
                              setEditingProduct({
                                ...editingProduct,
                                sizes: {
                                  ...curSizes,
                                  '1kg': val,
                                },
                              });
                            }}
                            className="w-full p-2 bg-white border border-stone-200 rounded-xl font-black text-emerald-950 focus:border-emerald-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Default size selector */}
                      <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-stone-700">גודל ברירת מחדל בעת בחירת הלקוח:</span>
                        <div className="flex items-center gap-3">
                          {(['250g', '500g', '1kg'] as const).map((sKey) => (
                            <label key={sKey} className="flex items-center gap-1 cursor-pointer font-medium text-stone-800">
                              <input
                                type="radio"
                                name="defaultSize"
                                value={sKey}
                                checked={(editingProduct.defaultSize || '500g') === sKey}
                                onChange={() => setEditingProduct({ ...editingProduct, defaultSize: sKey })}
                                className="accent-emerald-600"
                              />
                              <span>{sKey === '250g' ? '250 גרם' : sKey === '500g' ? '500 גרם' : '1 ק"ג'}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* DRINK FLAVORS INTERACTIVE MANAGER */}
                {(editingProduct.categoryId === 'drinks' || editingProduct.isDrink || (editingProduct.drinkFlavors && editingProduct.drinkFlavors.length > 0)) && (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                        <span>🥤</span>
                        <span>טעמי פחיות השתייה לבחירת הלקוח:</span>
                      </label>
                      <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                        {(editingProduct.drinkFlavors || []).length} טעמים פעילים
                      </span>
                    </div>

                    {/* Active Flavors Chips */}
                    <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-white rounded-xl border border-amber-200 items-center">
                      {(editingProduct.drinkFlavors || []).length === 0 ? (
                        <span className="text-stone-400 text-[11px] italic">טרם הוגדרו טעמים. לחץ על הטעמים המומלצים למטה להוספה מהירה.</span>
                      ) : (
                        (editingProduct.drinkFlavors || []).map((flavor, fIdx) => (
                          <span
                            key={fIdx}
                            className="inline-flex items-center gap-1.5 bg-amber-100/90 text-amber-950 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs"
                          >
                            <span>{flavor}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editingProduct.drinkFlavors || []).filter((_, i) => i !== fIdx);
                                setEditingProduct({ ...editingProduct, drinkFlavors: updated });
                              }}
                              className="text-amber-800 hover:text-rose-600 rounded-full p-0.5 transition-colors"
                              title="הסר טעם"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Add Custom Flavor input */}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        id="newFlavorInput"
                        placeholder="הקלד טעם חדש (למשל: מנגו פסיפלורה 🥭)..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const val = input.value.trim();
                            if (val && !(editingProduct.drinkFlavors || []).includes(val)) {
                              setEditingProduct({
                                ...editingProduct,
                                isDrink: true,
                                drinkFlavors: [...(editingProduct.drinkFlavors || []), val],
                              });
                              input.value = '';
                            }
                          }
                        }}
                        className="flex-1 p-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('newFlavorInput') as HTMLInputElement;
                          if (input && input.value.trim()) {
                            const val = input.value.trim();
                            if (!(editingProduct.drinkFlavors || []).includes(val)) {
                              setEditingProduct({
                                ...editingProduct,
                                isDrink: true,
                                drinkFlavors: [...(editingProduct.drinkFlavors || []), val],
                              });
                              input.value = '';
                            }
                          }
                        }}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      >
                        + הוסף
                      </button>
                    </div>

                    {/* Preset Flavor Chips */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-stone-500 block mb-1">
                        הוספה מהירה בלחיצה אחת:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {[
                          'תפוח עץ ונענע 🍏',
                          'לימונדה קלאסית 🍋',
                          'תות שדה מרענן 🍓',
                          'פירות יער ובלו ברי 🫐',
                          'מנגו פסיפלורה 🥭',
                          'תפוזים סחוט 🍊',
                          'קולה זירו 🥤',
                          'ענבים תירוש 🍇',
                          'מים מינרליים 🧊',
                        ].map((presetFlv) => {
                          const alreadyHas = (editingProduct.drinkFlavors || []).includes(presetFlv);
                          return (
                            <button
                              key={presetFlv}
                              type="button"
                              disabled={alreadyHas}
                              onClick={() => {
                                setEditingProduct({
                                  ...editingProduct,
                                  isDrink: true,
                                  drinkFlavors: [...(editingProduct.drinkFlavors || []), presetFlv],
                                });
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                                alreadyHas
                                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed line-through'
                                  : 'bg-white hover:bg-amber-200/60 text-stone-700 border border-stone-200 shadow-2xs'
                              }`}
                            >
                              + {presetFlv}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Flags checkboxes */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                    <input
                      type="checkbox"
                      checked={editingProduct.isCustomizable}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, isCustomizable: e.target.checked })
                      }
                      className="accent-emerald-600"
                    />
                    <span>מאפשר הרכבה והתאמה אישית</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                    <input
                      type="checkbox"
                      checked={editingProduct.isPopular}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, isPopular: e.target.checked })
                      }
                      className="accent-emerald-600"
                    />
                    <span>תגית "פופולרי" 🔥</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold"
                >
                  ביטול
                </button>
                <button
                  onClick={async () => {
                    const isSizes = editingProduct.pricingModel === 'sizes';
                    const isTiered = editingProduct.pricingModel === 'tiered' || (Boolean(editingProduct.drinkTiers) && editingProduct.drinkTiers!.length > 0 && !isSizes);

                    let finalPrice = Number(editingProduct.price) || 14;
                    let finalSizes = undefined;
                    let finalTiers = undefined;

                    if (isSizes) {
                      const base500 = editingProduct.sizes?.['500g'] || editingProduct.price || 45;
                      finalPrice = base500;
                      finalSizes = editingProduct.sizes || {
                        '250g': Math.round(base500 * 0.6),
                        '500g': base500,
                        '1kg': Math.round(base500 * 1.75),
                      };
                    } else if (isTiered) {
                      finalTiers = editingProduct.drinkTiers && editingProduct.drinkTiers.length > 0
                        ? editingProduct.drinkTiers
                        : [
                            { id: 'single', label: 'פחית בודדת (1 יח׳)', quantity: 1, price: 14 },
                            { id: 'duo', label: 'זוג פחיות (2 יח׳)', quantity: 2, price: 26, badge: 'חיסכון ₪2' },
                            { id: 'quad', label: 'רביעיית פחיות (4 יח׳)', quantity: 4, price: 48, badge: 'חיסכון ₪8' },
                            { id: 'six', label: 'שישיית פחיות (6 יח׳)', quantity: 6, price: 70, badge: 'חיסכון ₪14' },
                          ];
                      finalPrice = finalTiers[0].price;
                    } else {
                      finalPrice = Number(editingProduct.price) || 14;
                    }

                    const finalProduct: Product = {
                      ...editingProduct,
                      price: finalPrice,
                      sizes: finalSizes,
                      drinkTiers: finalTiers,
                      pricingModel: isSizes ? 'sizes' : isTiered ? 'tiered' : 'flat',
                      isDrink: Boolean(editingProduct.isDrink || editingProduct.categoryId === 'drinks'),
                    };

                    // Clean undefined keys for Firestore
                    const cleanProduct: any = {};
                    Object.entries(finalProduct).forEach(([k, v]) => {
                      if (v !== undefined) cleanProduct[k] = v;
                    });

                    await saveProduct(cleanProduct as Product);
                    setIsProductModalOpen(false);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  שמור מוצר ומחיר
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit / Add Ingredient */}
        {isIngredientModalOpen && editingIngredient && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-stone-900 text-base">עריכת מרכיב להרכבה</h3>
                <button onClick={() => setIsIngredientModalOpen(false)}>
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">שם המרכיב</label>
                  <input
                    type="text"
                    value={editingIngredient.name}
                    onChange={(e) =>
                      setEditingIngredient({ ...editingIngredient, name: e.target.value })
                    }
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">קטגוריה</label>
                    <select
                      value={editingIngredient.category}
                      onChange={(e) =>
                        setEditingIngredient({
                          ...editingIngredient,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                    >
                      <option value="base">בסיס (חסה, כרוב...)</option>
                      <option value="veggie">ירק</option>
                      <option value="protein">חלבון</option>
                      <option value="addon">תוספת קראנץ׳</option>
                      <option value="dressing">רוטב</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">אייקון / אימוג׳י</label>
                    <input
                      type="text"
                      value={editingIngredient.icon || ''}
                      onChange={(e) =>
                        setEditingIngredient({ ...editingIngredient, icon: e.target.value })
                      }
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-center text-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">מחיר תוספת (₪)</label>
                    <input
                      type="number"
                      value={editingIngredient.price}
                      onChange={(e) =>
                        setEditingIngredient({
                          ...editingIngredient,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">קלוריות</label>
                    <input
                      type="number"
                      value={editingIngredient.calories}
                      onChange={(e) =>
                        setEditingIngredient({
                          ...editingIngredient,
                          calories: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  onClick={() => setIsIngredientModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold"
                >
                  ביטול
                </button>
                <button
                  onClick={async () => {
                    await saveIngredient(editingIngredient);
                    setIsIngredientModalOpen(false);
                  }}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  שמור מרכיב
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit / Add Category */}
        {isCategoryModalOpen && editingCategory && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-stone-900 text-base">עריכת קטגוריה</h3>
                <button onClick={() => setIsCategoryModalOpen(false)}>
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">שם הקטגוריה</label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, name: e.target.value })
                    }
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">אימוג׳י</label>
                    <input
                      type="text"
                      value={editingCategory.icon}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, icon: e.target.value })
                      }
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-center text-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">סדר תצוגה</label>
                    <input
                      type="number"
                      value={editingCategory.order}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, order: Number(e.target.value) })
                      }
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold"
                >
                  ביטול
                </button>
                <button
                  onClick={async () => {
                    await saveCategory(editingCategory);
                    setIsCategoryModalOpen(false);
                  }}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  שמור קטגוריה
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Slip / Print Order */}
        {printOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-stone-900 text-base">בון מטבח - {printOrder.orderNumber}</h3>
                <button onClick={() => setPrintOrder(null)}>
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-dashed border-stone-300 font-mono text-xs space-y-2">
                <div className="text-center font-bold text-sm">SALAD BOX נוף הגליל</div>
                <div className="text-center text-[10px] text-stone-500">
                  {new Date(printOrder.createdAt).toLocaleString('he-IL')}
                </div>
                <div className="border-t border-dashed my-2"></div>
                <div>לקוח: {printOrder.customerName} ({printOrder.customerPhone})</div>
                <div>סוג: {printOrder.deliveryType === 'delivery' ? 'משלוח (נוף הגליל)' : 'איסוף הסלטים'}</div>
                {printOrder.deliveryAddress && (
                  <div>
                    כתובת: {printOrder.deliveryAddress.street} {printOrder.deliveryAddress.houseNumber},{' '}
                    {printOrder.deliveryAddress.city}
                  </div>
                )}
                <div>
                  תשלום: {paymentMethodLabels[printOrder.paymentMethod] || printOrder.paymentMethod} (
                  {paymentStatusLabels[printOrder.paymentStatus]?.label || printOrder.paymentStatus})
                </div>
                {printOrder.specialNotes && (
                  <div className="font-bold text-rose-700">הערות מטבח: {printOrder.specialNotes}</div>
                )}
                <div className="border-t border-dashed my-2"></div>
                <div className="space-y-1.5">
                  {printOrder.items.map((it, idx) => (
                    <div key={idx} className="pb-1 border-b border-stone-200">
                      <div className="font-bold">
                        {it.quantity}X {it.name} {it.selectedSizeLabel && `[${it.selectedSizeLabel}]`}
                      </div>
                      {it.customSummaryText?.map((s, i) => (
                        <div key={i} className="text-[10px] text-stone-600 pl-2">
                          * {s}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed my-2"></div>
                <div className="flex justify-between font-bold text-sm">
                  <span>סה"כ:</span>
                  <span>₪{printOrder.grandTotal.toFixed(0)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setPrintOrder(null)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold"
                >
                  סגור
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>הדפס</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Receipt Modal */}
        {selectedReceiptOrder && (
          <ReceiptModal
            order={selectedReceiptOrder}
            onClose={() => setSelectedReceiptOrder(null)}
          />
        )}
      </div>
    </div>
  );
};
