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
  MapPin,
  Package,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Sliders,
  Scale,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  Category,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  SaladIngredient,
  StoreSettings,
  SALAD_SIZE_LABELS,
} from '../types';

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
    'orders' | 'reports' | 'products' | 'ingredients' | 'categories' | 'customers' | 'settings'
  >('orders');

  // Filter orders by order status, payment method, payment status, and search
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Selected Order for print/slip view
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Product modal edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

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

                          <div className="flex items-center gap-2">
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
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
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

          {/* TAB: PRODUCTS & SALAD SIZES */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    ניהול סלטים ומחירי גדלים (250 גרם, 500 גרם, 1 ק"ג)
                  </h3>
                  <p className="text-xs text-stone-500">
                    הגדרת מחירים דינמית לכל גודל סלט ישירות במסד הנתונים
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      id: `prod_${Date.now()}`,
                      name: '',
                      description: '',
                      price: 45,
                      categoryId: 'salads',
                      image:
                        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
                      isCustomizable: true,
                      isAvailable: true,
                      order: products.length + 1,
                      sizes: {
                        '250g': 25,
                        '500g': 45,
                        '1kg': 79,
                      },
                      defaultSize: '500g',
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>הוסף סלט חדש</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between gap-3 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-stone-900 leading-snug line-clamp-1">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    {/* Sizes Pricing Breakdown on Card */}
                    {prod.sizes ? (
                      <div className="bg-stone-50 p-2 rounded-xl border border-stone-200/60 text-[11px]">
                        <span className="font-bold text-stone-600 block mb-1">מחירי גדלים:</span>
                        <div className="grid grid-cols-3 gap-1 text-center font-bold">
                          <div className="bg-white p-1 rounded-md border border-stone-200">
                            <span className="text-stone-500 block text-[9px]">250 גרם</span>
                            <span className="text-emerald-800">₪{prod.sizes['250g']}</span>
                          </div>
                          <div className="bg-white p-1 rounded-md border border-stone-200">
                            <span className="text-stone-500 block text-[9px]">500 גרם</span>
                            <span className="text-emerald-800">₪{prod.sizes['500g']}</span>
                          </div>
                          <div className="bg-white p-1 rounded-md border border-stone-200">
                            <span className="text-stone-500 block text-[9px]">1 ק"ג</span>
                            <span className="text-emerald-800">₪{prod.sizes['1kg']}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-black text-emerald-800">
                        מחיר בסיס: ₪{prod.price}
                      </div>
                    )}

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
                          className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="ערוך מחירי גדלים"
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
                    </div>
                  </div>
                ))}
              </div>
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

                {/* SIZES PRICING SECTION - 250g, 500g, 1kg */}
                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                    <Scale className="w-4 h-4 text-emerald-700" />
                    <span>הגדרת מחירים לפי גדלים (נשמר במסד הנתונים):</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                        250 גרם (רבע קילו) ₪
                      </label>
                      <input
                        type="number"
                        value={editingProduct.sizes?.['250g'] ?? Math.round(editingProduct.price * 0.6)}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditingProduct({
                            ...editingProduct,
                            sizes: {
                              '250g': val,
                              '500g': editingProduct.sizes?.['500g'] ?? editingProduct.price,
                              '1kg': editingProduct.sizes?.['1kg'] ?? Math.round(editingProduct.price * 1.8),
                            },
                          });
                        }}
                        className="w-full p-2 bg-white border border-stone-200 rounded-xl font-bold text-emerald-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                        500 גרם (חצי קילו) ₪
                      </label>
                      <input
                        type="number"
                        value={editingProduct.sizes?.['500g'] ?? editingProduct.price}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditingProduct({
                            ...editingProduct,
                            price: val,
                            sizes: {
                              '250g': editingProduct.sizes?.['250g'] ?? Math.round(val * 0.6),
                              '500g': val,
                              '1kg': editingProduct.sizes?.['1kg'] ?? Math.round(val * 1.8),
                            },
                          });
                        }}
                        className="w-full p-2 bg-white border border-stone-200 rounded-xl font-bold text-emerald-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                        1 ק"ג (קילו) ₪
                      </label>
                      <input
                        type="number"
                        value={editingProduct.sizes?.['1kg'] ?? Math.round(editingProduct.price * 1.8)}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditingProduct({
                            ...editingProduct,
                            sizes: {
                              '250g': editingProduct.sizes?.['250g'] ?? Math.round(editingProduct.price * 0.6),
                              '500g': editingProduct.sizes?.['500g'] ?? editingProduct.price,
                              '1kg': val,
                            },
                          });
                        }}
                        className="w-full p-2 bg-white border border-stone-200 rounded-xl font-bold text-emerald-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">קטגוריה</label>
                    <select
                      value={editingProduct.categoryId}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, categoryId: e.target.value })
                      }
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
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
                      className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Flags checkboxes */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
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

                  <label className="flex items-center gap-2 cursor-pointer">
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
                    await saveProduct(editingProduct);
                    setIsProductModalOpen(false);
                  }}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  שמור סלט ומחירים
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
      </div>
    </div>
  );
};
