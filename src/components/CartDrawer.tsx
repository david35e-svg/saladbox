import React from 'react';
import { ChevronRight, ShoppingBag, Trash2, Truck, X, Sparkles, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    itemsCount,
    itemsTotal,
    deliveryType,
    setDeliveryType,
    deliveryFee,
    grandTotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { settings } = useStore();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = settings.freeDeliveryThreshold || 120;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - itemsTotal);
  const minOrderAmount = settings.minOrderAmount || 40;
  const meetsMinOrder = itemsTotal >= minOrderAmount;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Cart Header */}
          <div className="px-5 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 leading-tight">
                  סל הקניות שלך
                </h2>
                <span className="text-xs text-stone-500 font-medium">
                  {itemsCount} {itemsCount === 1 ? 'פריט' : 'פריטים'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-stone-400 hover:text-rose-600 text-xs font-semibold px-2 py-1 transition-colors"
                >
                  רוקן סל
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery / Pickup switcher in Cart */}
          <div className="px-5 py-2.5 bg-stone-100/80 border-b border-stone-200 shrink-0">
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-200/70 rounded-xl text-xs font-bold">
              <button
                onClick={() => setDeliveryType('delivery')}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  deliveryType === 'delivery'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🚚</span>
                <span>משלוח בנוף הגליל (₪{deliveryFee})</span>
              </button>
              <button
                onClick={() => setDeliveryType('pickup')}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  deliveryType === 'pickup'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🏪</span>
                <span>איסוף הסלטים (חינם)</span>
              </button>
            </div>

            {/* Free delivery progress bar */}
            {deliveryType === 'delivery' && (
              <div className="mt-2.5 pt-2 border-t border-stone-200/60">
                {remainingForFreeDelivery > 0 ? (
                  <div>
                    <div className="flex justify-between text-[11px] text-stone-600 font-medium mb-1">
                      <span>עוד ₪{remainingForFreeDelivery.toFixed(0)} למשלוח חינם!</span>
                      <span>{Math.round((itemsTotal / freeDeliveryThreshold) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (itemsTotal / freeDeliveryThreshold) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>זכאי למשלוח חינם על הזמנה זו! 🎉</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-stone-100 flex items-center justify-center text-4xl shadow-inner">
                  🥗
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-800">הסל שלך ריק</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    בחר מהסלטים המומלצים שלנו או הרכב סלט עשיר ומותאם אישית
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
                >
                  חזרה לתפריט
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white rounded-2xl border border-stone-200/90 shadow-xs flex flex-col gap-2.5 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-sm text-stone-900 leading-snug line-clamp-2">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-300 hover:text-rose-500 p-1 transition-colors"
                          title="הסר פריט"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Salad Size Badge */}
                      {item.selectedSizeLabel && (
                        <div className="mt-1">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            גודל: {item.selectedSizeLabel}
                          </span>
                        </div>
                      )}

                      <div className="text-xs font-black text-emerald-800 mt-1">
                        ₪{item.unitPrice} ליחידה
                      </div>
                    </div>
                  </div>

                  {/* Customization Details List */}
                  {item.customSummaryText && item.customSummaryText.length > 0 && (
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 text-[11px] text-stone-600 space-y-1">
                      {item.customSummaryText.map((line, idx) => (
                        <div key={idx} className="flex items-start gap-1">
                          <span className="text-emerald-600 font-bold shrink-0">•</span>
                          <span className="leading-tight">{line}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                    <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-700 font-bold text-sm flex items-center justify-center transition-colors shadow-xs"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-700 font-bold text-sm flex items-center justify-center transition-colors shadow-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-left font-black text-stone-900 text-base">
                      ₪{(item.unitPrice * item.quantity).toFixed(0)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-3 shrink-0 shadow-lg">
              {/* Summary lines */}
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>סכום ביניים</span>
                  <span className="font-bold text-stone-900">₪{itemsTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>דמי משלוח</span>
                  <span className="font-bold text-stone-900">
                    {deliveryType === 'pickup' ? (
                      <span className="text-emerald-700">איסוף עצמי חינם</span>
                    ) : deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold">חינם</span>
                    ) : (
                      `₪${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                  <span>סה"כ לתשלום</span>
                  <span className="text-xl text-emerald-800">₪{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              {/* Minimum order check */}
              {!meetsMinOrder && (
                <div className="flex items-center gap-1.5 p-2 bg-amber-50 text-amber-900 text-xs rounded-xl border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>מינימום הזמנה הוא ₪{minOrderAmount} (חסרים ₪{minOrderAmount - itemsTotal})</span>
                </div>
              )}

              {/* Checkout CTA Button */}
              <button
                onClick={() => {
                  if (!meetsMinOrder) return;
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                disabled={!meetsMinOrder}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 disabled:opacity-50 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-600/30 flex items-center justify-between transition-all transform active:scale-98"
              >
                <span>המשך להזמנה</span>
                <span className="flex items-center gap-1">
                  <span>₪{grandTotal.toFixed(0)}</span>
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
