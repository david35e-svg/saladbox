import React, { useState, useMemo, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { HeroBanner } from './components/HeroBanner';
import { CategoriesBar } from './components/CategoriesBar';
import { ProductCard } from './components/ProductCard';
import { SaladBuilderModal } from './components/SaladBuilderModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrdersHistoryModal } from './components/OrdersHistoryModal';
import { FavoritesModal } from './components/FavoritesModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Order, Product } from './types';
import { checkOrderWindow } from './utils/orderCutoff';
import { Heart, Sparkles, ShieldCheck, Phone, MapPin, Clock, AlertTriangle } from 'lucide-react';

const MainApp: React.FC = () => {
  const { products, categories, settings, isLoading } = useStore();
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  // Dynamic order cutoff status
  const orderWindow = checkOrderWindow(settings);

  // Modals state
  const [activeCustomizingProduct, setActiveCustomizingProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isOrdersHistoryOpen, setIsOrdersHistoryOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Filters state
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('all');

  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Start custom salad bowl
  const handleStartCustomSalad = () => {
    const customProduct =
      products.find((p) => p.isCustomizable) || products[0];
    if (customProduct) {
      setActiveCustomizingProduct(customProduct);
    }
  };

  // Quick add standard product to cart
  const handleQuickAdd = (product: Product) => {
    addToCart(product, 1);
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category filter
      const matchCategory =
        activeCategoryId === 'all' || prod.categoryId === activeCategoryId;

      // Search query
      const matchSearch =
        !searchQuery.trim() ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter tag
      let matchTag = true;
      if (filterTag === 'popular') {
        matchTag = Boolean(prod.isPopular);
      } else if (filterTag === 'custom') {
        matchTag = Boolean(prod.isCustomizable);
      } else if (filterTag === 'new') {
        matchTag = Boolean(prod.isNew);
      }

      return matchCategory && matchSearch && matchTag;
    });
  }, [products, activeCategoryId, searchQuery, filterTag]);

  // Popular salads for the top showcase
  const popularSalads = useMemo(() => {
    return products.filter((p) => p.isPopular).slice(0, 4);
  }, [products]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20 md:pb-12 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <div>
        <Header
          onOpenAdmin={() => setIsAdminDashboardOpen(true)}
          onOpenOrders={() => setIsOrdersHistoryOpen(true)}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
        />

        {/* Order Cycle Status Banner if closed */}
        {!orderWindow.isOpen ? (
          <div className="mx-4 sm:mx-6 my-3 p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center justify-between gap-3 text-rose-900 text-xs sm:text-sm font-bold shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>מועד ההזמנות למחזור הנוכחי הסתיים. ניתן להזמין למחזור הבא.</span>
            </div>
            <span className="text-xs text-rose-700 hidden md:inline">
              הזמנות לסלטים נסגרות בכל שבוע ביום שלישי ב-23:59
            </span>
          </div>
        ) : orderWindow.daysRemaining === 0 ? (
          <div className="mx-4 sm:mx-6 my-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-amber-900 text-xs sm:text-sm font-bold shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">⏰</span>
              <span>היום יום שלישי — מועד סגירת ההזמנות למחזור הנוכחי הוא הלילה בחצות!</span>
            </div>
            <span className="text-xs text-amber-700 hidden md:inline">
              משלוחים בנוף הגליל בלבד
            </span>
          </div>
        ) : null}

        {/* Hero Banner */}
        <HeroBanner
          onStartCustomSalad={handleStartCustomSalad}
          onExploreMenu={scrollToMenu}
        />

        {/* Categories Bar */}
        <div ref={menuRef}>
          <CategoriesBar
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterTag={filterTag}
            onSelectFilterTag={setFilterTag}
          />
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
          {/* Popular Salads Section (Show only when browsing 'all' without search) */}
          {activeCategoryId === 'all' && !searchQuery.trim() && filterTag === 'all' && popularSalads.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                      הסלטים הפופולריים ביותר
                    </h2>
                    <p className="text-xs text-stone-500 font-medium">
                      הנבחרים והאהובים ביותר על לקוחות SALAD BOX
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setFilterTag('popular')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  לכל הפופולריים ←
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {popularSalads.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenCustomizer={setActiveCustomizingProduct}
                    onQuickAdd={handleQuickAdd}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Menu Catalog Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  {activeCategoryId === 'all'
                    ? 'תפריט הסלטים והמנות'
                    : categories.find((c) => c.id === activeCategoryId)?.name || 'תפריט'}
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  {filteredProducts.length} מנות מוכנות וטריות לבחירתך
                </p>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-3xl">
                  🥗
                </div>
                <h3 className="font-bold text-stone-800 text-base">לא נמצאו מנות תואמות</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  נסה לשנות את מילות החיפוש או לבחור קטגוריה אחרת
                </p>
                <button
                  onClick={() => {
                    setActiveCategoryId('all');
                    setSearchQuery('');
                    setFilterTag('all');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  הצג את כל התפריט
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenCustomizer={setActiveCustomizingProduct}
                    onQuickAdd={handleQuickAdd}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Value Props & Freshness Promise */}
          <section className="bg-gradient-to-r from-emerald-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
            <div className="max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                ההתחייבות של SALAD BOX
              </span>
              <h3 className="text-xl sm:text-2xl font-black mt-1">
                טריות ללא פשרות. מהחווה אל הקערה.
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
                הירקות נשטפים, מחוטאים ונקצצים מדי בוקר. הרטבים שלנו מוכנים במקום משמן זית ישראלי
                טהור, עשבי תיבול טריים ותבלינים מובחרים, ללא חומרים משמרים וללא סוכר מיותר.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
              <div>
                <div className="font-bold text-emerald-300">🥦 ירקות פריכים</div>
                <div className="text-[11px] text-stone-300">אספקה יומיומית מובחרת</div>
              </div>
              <div>
                <div className="font-bold text-lime-300">🥣 רטבים תוצרת בית</div>
                <div className="text-[11px] text-stone-300">מתכונים סודיים ובלעדיים</div>
              </div>
              <div>
                <div className="font-bold text-amber-300">🍗 חלבון איכותי</div>
                <div className="text-[11px] text-stone-300">עוף, סלמון, חלומי וטופו טרי</div>
              </div>
              <div>
                <div className="font-bold text-emerald-300">♻️ אריזות מתכלות</div>
                <div className="text-[11px] text-stone-300">שומרים על הסביבה</div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-stone-200 pt-8 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥗</span>
              <span className="text-lg font-black tracking-tight text-stone-900">SALAD BOX</span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              אפליקציית סלטים ואוכל בריא • {settings.address}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{settings.openingHoursText}</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <a href={`tel:${settings.phone}`} className="hover:text-emerald-700">
                {settings.phone}
              </a>
            </span>
            {isAdmin && (
              <button
                onClick={() => setIsAdminDashboardOpen(true)}
                className="text-amber-700 hover:text-amber-800 font-bold underline flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>כניסה לפאנל מנהל</span>
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-400">
          <div>© {new Date().getFullYear()} SALAD BOX. כל הזכויות שמורות.</div>
          <div>טרי • בריא • מהיר • מותאם אישית</div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        onOpenAdmin={() => setIsAdminDashboardOpen(true)}
        onOpenOrders={() => setIsOrdersHistoryOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onScrollToMenu={scrollToMenu}
      />

      {/* Modals & Drawers */}
      {/* 1. Custom Salad Builder Modal */}
      {activeCustomizingProduct && (
        <SaladBuilderModal
          product={activeCustomizingProduct}
          onClose={() => setActiveCustomizingProduct(null)}
        />
      )}

      {/* 2. Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* 3. Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onOrderCompleted={(order) => {
            setIsCheckoutOpen(false);
            setCompletedOrder(order);
          }}
        />
      )}

      {/* 4. Order Confirmation & Live Tracking Screen */}
      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onViewAllOrders={() => {
            setCompletedOrder(null);
            setIsOrdersHistoryOpen(true);
          }}
        />
      )}

      {/* 5. Orders History Modal */}
      {isOrdersHistoryOpen && (
        <OrdersHistoryModal
          onClose={() => setIsOrdersHistoryOpen(false)}
          onTrackOrder={(order) => {
            setIsOrdersHistoryOpen(false);
            setCompletedOrder(order);
          }}
        />
      )}

      {/* 6. Favorites Modal */}
      {isFavoritesOpen && (
        <FavoritesModal
          onClose={() => setIsFavoritesOpen(false)}
          onOpenCustomizer={(product) => {
            setIsFavoritesOpen(false);
            setActiveCustomizingProduct(product);
          }}
        />
      )}

      {/* 7. Admin Dashboard */}
      {isAdminDashboardOpen && (
        <AdminDashboard onClose={() => setIsAdminDashboardOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
