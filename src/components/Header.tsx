import React from 'react';
import {
  Clock,
  Heart,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Phone,
  ReceiptText,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
  onOpenFavorites: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdmin,
  onOpenOrders,
  onOpenFavorites,
}) => {
  const { user, profile, isAdmin, loginWithGoogle, logout } = useAuth();
  const { itemsCount, grandTotal, setIsCartOpen, deliveryType, setDeliveryType } = useCart();
  const { settings, favorites } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top micro bar for store notice and quick contact */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className={`inline-block w-2 h-2 rounded-full ${settings.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              {settings.isOpen ? 'המטבח פתוח להזמנות' : 'המטבח סגור כרגע'}
            </span>
            <span className="hidden sm:inline-block text-emerald-300">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-emerald-200">
              <MapPin className="w-3.5 h-3.5 text-lime-400" />
              <span>משלוחים בנוף הגליל בלבד</span>
            </span>
            <span className="hidden md:inline-block text-emerald-300">|</span>
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-200">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>הזמנות עד יום שלישי בחצות</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline-flex items-center gap-1 text-emerald-200">
              <MapPin className="w-3.5 h-3.5" />
              <span>סניף {settings.address}</span>
            </span>
            <a
              href={`tel:${settings.phone}`}
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{settings.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="text-xl sm:text-2xl">🥗</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 group-hover:text-emerald-700 transition-colors">
                  SALAD BOX
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">
                  FRESH
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block font-medium">
                הסלט שלך. בדיוק כמו שאתה אוהב.
              </p>
            </div>
          </a>

          {/* Delivery / Pickup pill */}
          <div className="hidden lg:flex items-center p-1 bg-stone-100 rounded-full border border-stone-200 text-xs font-semibold mr-4">
            <button
              onClick={() => setDeliveryType('delivery')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                deliveryType === 'delivery'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🚚</span>
              <span>משלוח (נוף הגליל)</span>
            </button>
            <button
              onClick={() => setDeliveryType('pickup')}
              className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                deliveryType === 'pickup'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🏪</span>
              <span>איסוף הסלטים</span>
            </button>
          </div>
        </div>

        {/* Action icons & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Dashboard shortcut button if admin */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all hover:scale-102"
              title="פאנל ניהול מנהל"
            >
              <ShieldCheck className="w-4 h-4 text-stone-950" />
              <span className="hidden sm:inline">פאנל ניהול</span>
            </button>
          )}

          {/* Favorites */}
          <button
            onClick={onOpenFavorites}
            className="p-2 sm:px-3 sm:py-2 text-stone-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors relative flex items-center gap-1 text-xs font-medium"
            title="מועדפים"
          >
            <Heart className="w-5 h-5 text-rose-500" />
            <span className="hidden md:inline">המועדפים שלי</span>
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Orders history */}
          <button
            onClick={onOpenOrders}
            className="p-2 sm:px-3 sm:py-2 text-stone-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-1 text-xs font-medium"
            title="ההזמנות שלי"
          >
            <ReceiptText className="w-5 h-5 text-emerald-700" />
            <span className="hidden md:inline">ההזמנות שלי</span>
          </button>

          {/* User Auth Button */}
          {user ? (
            <div className="flex items-center gap-2 bg-stone-100/80 px-2 sm:px-3 py-1.5 rounded-xl border border-stone-200">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'משתמש'}
                  className="w-6 h-6 rounded-full border border-stone-300"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {user.displayName ? user.displayName[0] : 'U'}
                </div>
              )}
              <span className="text-xs font-medium text-stone-800 hidden sm:inline max-w-[90px] truncate">
                {user.displayName || 'שלום'}
              </span>
              <button
                onClick={logout}
                className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                title="התנתק"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl border border-stone-200 transition-colors"
            >
              <LogIn className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline">התחברות</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 sm:px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all transform active:scale-95"
            aria-label="פתח סל קניות"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {itemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-stone-950 text-[11px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                  {itemsCount}
                </span>
              )}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black tracking-tight leading-tight">
                ₪{grandTotal.toFixed(0)}
              </div>
              <div className="text-[10px] text-emerald-100 leading-tight">
                {itemsCount === 1 ? 'פריט 1' : `${itemsCount} פריטים`}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
