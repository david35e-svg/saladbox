import React from 'react';
import { Heart, Plus, Trash2, X, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';

interface FavoritesModalProps {
  onClose: () => void;
  onOpenCustomizer: (product: Product) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  onClose,
  onOpenCustomizer,
}) => {
  const { favorites, products, toggleFavorite } = useStore();
  const { addToCart } = useCart();
  const { user, loginWithGoogle } = useAuth();

  const handleQuickAdd = (product: Product) => {
    addToCart(product, 1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">
                הסלטים שלי ❤️
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                הסלטים המועדפים עליך להזמנה מהירה
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {!user && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <span>התחבר לחשבונך כדי לשמור את הסלטים שאתה הכי אוהב</span>
              <button
                onClick={loginWithGoogle}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-xl font-bold shrink-0 shadow-xs"
              >
                התחברות
              </button>
            </div>
          )}

          {favorites.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center text-3xl">
                ❤️
              </div>
              <h3 className="font-bold text-stone-800 text-base">אין עדיין סלטים במועדפים</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                לחץ על סמל הלב בכרטיס כל סלט כדי לשמור אותו כאן להזמנה חוזרת ברגע
              </p>
            </div>
          ) : (
            favorites.map((fav) => {
              const matchedProduct = products.find((p) => p.id === fav.productId);

              return (
                <div
                  key={fav.id}
                  className="p-3.5 bg-stone-50/80 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {matchedProduct ? (
                      <img
                        src={matchedProduct.image}
                        alt={fav.productName}
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-emerald-100 text-2xl flex items-center justify-center shrink-0">
                        🥗
                      </div>
                    )}

                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-stone-900 truncate">
                        {fav.productName}
                      </h4>
                      <div className="text-xs font-black text-emerald-800 mt-0.5">
                        ₪{fav.productPrice}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {matchedProduct && (
                      <>
                        {matchedProduct.isCustomizable ? (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenCustomizer(matchedProduct);
                            }}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-xl text-xs font-bold border border-emerald-300 transition-all flex items-center gap-1 shadow-xs"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>התאם</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickAdd(matchedProduct)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>הוסף לסל</span>
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => toggleFavorite(fav.productId, fav.productName, fav.productPrice)}
                      className="p-2 text-stone-300 hover:text-rose-500 rounded-lg hover:bg-stone-200 transition-colors"
                      title="הסר ממועדפים"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
