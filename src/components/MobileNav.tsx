import React from 'react';
import { Heart, Home, ReceiptText, ShieldCheck, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface MobileNavProps {
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
  onOpenFavorites: () => void;
  onScrollToMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  onOpenAdmin,
  onOpenOrders,
  onOpenFavorites,
  onScrollToMenu,
}) => {
  const { user, isAdmin, loginWithGoogle } = useAuth();
  const { itemsCount, grandTotal, setIsCartOpen } = useCart();
  const { favorites } = useStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 py-1.5 px-3 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Menu Home */}
        <button
          onClick={onScrollToMenu}
          className="flex flex-col items-center justify-center p-1 text-stone-600 hover:text-emerald-600 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">תפריט</span>
        </button>

        {/* Favorites */}
        <button
          onClick={onOpenFavorites}
          className="flex flex-col items-center justify-center p-1 text-stone-600 hover:text-rose-600 transition-colors relative"
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">מועדפים</span>
          {favorites.length > 0 && (
            <span className="absolute top-0 right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </button>

        {/* Cart in center (prominent) */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center justify-center -mt-4 bg-emerald-600 text-white rounded-full w-13 h-13 shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform relative"
        >
          <ShoppingBag className="w-6 h-6" />
          {itemsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white">
              {itemsCount}
            </span>
          )}
        </button>

        {/* Orders */}
        <button
          onClick={onOpenOrders}
          className="flex flex-col items-center justify-center p-1 text-stone-600 hover:text-emerald-600 transition-colors"
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">הזמנות</span>
        </button>

        {/* Admin / Profile */}
        {isAdmin ? (
          <button
            onClick={onOpenAdmin}
            className="flex flex-col items-center justify-center p-1 text-amber-600 hover:text-amber-700 transition-colors"
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">ניהול</span>
          </button>
        ) : (
          <button
            onClick={user ? onOpenOrders : loginWithGoogle}
            className="flex flex-col items-center justify-center p-1 text-stone-600 hover:text-emerald-600 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">{user ? 'חשבון' : 'כניסה'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
