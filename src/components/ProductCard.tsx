import React, { useState } from 'react';
import { Flame, Heart, Plus, Sparkles, SlidersHorizontal, Clock } from 'lucide-react';
import { Product, SaladSize, SALAD_SIZE_LABELS } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onOpenCustomizer: (product: Product, size?: SaladSize) => void;
  onQuickAdd: (product: Product, size?: SaladSize) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenCustomizer,
  onQuickAdd,
}) => {
  const { toggleFavorite, isFavorite } = useStore();
  const { user, loginWithGoogle } = useAuth();
  const favorite = isFavorite(product.id);

  // Selected size if product has sizes
  const [selectedSize, setSelectedSize] = useState<SaladSize>(
    product.defaultSize || (product.sizes ? '500g' : '500g')
  );

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      loginWithGoogle();
      return;
    }
    toggleFavorite(product.id, product.name, currentPrice);
  };

  const isAvailable = product.isAvailable !== false;

  // Compute price based on selected size if available
  const currentPrice =
    product.sizes && selectedSize && product.sizes[selectedSize]
      ? product.sizes[selectedSize]
      : product.price;

  return (
    <div
      onClick={() => {
        if (!isAvailable) return;
        if (product.isCustomizable) {
          onOpenCustomizer(product, product.sizes ? selectedSize : undefined);
        } else {
          onQuickAdd(product, product.sizes ? selectedSize : undefined);
        }
      }}
      className={`group bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col cursor-pointer relative ${
        !isAvailable ? 'opacity-60 grayscale-[0.3]' : ''
      }`}
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>

        {/* Availability Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-stone-900 text-white font-bold px-3 py-1 rounded-full text-xs border border-white/20">
              אזל מהמלאי כרגע
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end z-10">
          {product.isPopular && (
            <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <span>🔥</span>
              <span>פופולרי</span>
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              <span>חדש</span>
            </span>
          )}
          {product.isSpicy && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
              🌶️ חריף
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 left-2.5 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 z-10 ${
            favorite
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 text-stone-700 hover:text-rose-500 hover:bg-white'
          }`}
          title={favorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
        >
          <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
        </button>

        {/* Prep time & Calories indicator */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 text-[10px] font-semibold text-white drop-shadow-md">
          {product.prepTimeMinutes && (
            <span className="bg-stone-900/70 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              {product.prepTimeMinutes} דק׳
            </span>
          )}
          {product.calories && (
            <span className="bg-stone-900/70 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              {product.calories} קק״ל
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-1">
            {product.name}
          </h3>
          <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed font-normal">
            {product.description}
          </p>

          {/* Size Selector if product has sizes */}
          {product.sizes && (
            <div className="mt-3 pt-2 border-t border-stone-100" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] text-stone-400 font-semibold block mb-1">
                בחר גודל סלט:
              </span>
              <div className="grid grid-cols-3 gap-1 bg-stone-100 p-0.5 rounded-xl">
                {(['250g', '500g', '1kg'] as SaladSize[]).map((sizeKey) => {
                  const isSelected = selectedSize === sizeKey;
                  return (
                    <button
                      key={sizeKey}
                      type="button"
                      onClick={() => setSelectedSize(sizeKey)}
                      className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                      }`}
                    >
                      <div>{SALAD_SIZE_LABELS[sizeKey].short}</div>
                      <div className={`text-[9px] ${isSelected ? 'text-emerald-100' : 'text-stone-400'}`}>
                        ₪{product.sizes?.[sizeKey]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Price & CTA Button */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">
              {product.sizes ? SALAD_SIZE_LABELS[selectedSize].short : 'מחיר'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              ₪{currentPrice}
            </span>
          </div>

          <div>
            {product.isCustomizable ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCustomizer(product, product.sizes ? selectedSize : undefined);
                }}
                disabled={!isAvailable}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-emerald-200 hover:border-emerald-600 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>התאם סלט</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAdd(product, product.sizes ? selectedSize : undefined);
                }}
                disabled={!isAvailable}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף לסל</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
