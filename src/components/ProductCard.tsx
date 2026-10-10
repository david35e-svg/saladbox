import React, { useState, useMemo } from 'react';
import { Flame, Heart, Plus, Sparkles, SlidersHorizontal, Clock } from 'lucide-react';
import { DrinkPricingTier, Product, SaladSize, SALAD_SIZE_LABELS } from '../types';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onOpenCustomizer: (product: Product, size?: SaladSize, flavor?: string, tier?: DrinkPricingTier) => void;
  onQuickAdd: (product: Product, size?: SaladSize, flavor?: string, tier?: DrinkPricingTier) => void;
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

  // Selected drink tier if product has drink tiers (tiered pricing)
  const [selectedTier, setSelectedTier] = useState<DrinkPricingTier | undefined>(
    product.drinkTiers?.[0]
  );

  // Selected drink flavor if product is a drink with flavors
  const [selectedFlavor, setSelectedFlavor] = useState<string | undefined>(
    product.drinkFlavors?.[0]
  );

  const isAvailable = product.isAvailable !== false;

  // Compute price based on selected tier, size, or flat price
  const currentPrice = useMemo(() => {
    if (product.drinkTiers && product.drinkTiers.length > 0 && selectedTier) {
      return selectedTier.price;
    }
    if (product.sizes && selectedSize && product.sizes[selectedSize]) {
      return product.sizes[selectedSize];
    }
    return product.price;
  }, [product, selectedTier, selectedSize]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      loginWithGoogle();
      return;
    }
    toggleFavorite(product.id, product.name, currentPrice);
  };

  const handleAction = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAvailable) return;
    if (product.isCustomizable) {
      onOpenCustomizer(product, product.sizes ? selectedSize : undefined, selectedFlavor, selectedTier);
    } else {
      onQuickAdd(product, product.sizes ? selectedSize : undefined, selectedFlavor, selectedTier);
    }
  };

  return (
    <div
      onClick={handleAction}
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
          {product.isDrink && (
            <span className="bg-sky-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <span>🥤</span>
              <span>שתייה</span>
            </span>
          )}
          {product.pricingModel === 'tiered' || (product.drinkTiers && product.drinkTiers.length > 0) ? (
            <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <span>🏷️</span>
              <span>מחיר מדורג</span>
            </span>
          ) : product.isDrink ? (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
              <span>מחיר אחיד</span>
            </span>
          ) : null}
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

          {/* Tiered Pricing Selector for Drinks (מחיר מדורג) */}
          {product.drinkTiers && product.drinkTiers.length > 0 && (
            <div className="mt-3 pt-2 border-t border-stone-100" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-stone-500 font-bold">
                  בחר כמות / מדרגת מחיר:
                </span>
                {selectedTier?.badge && (
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded-md">
                    {selectedTier.badge}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5 bg-stone-100/80 p-1 rounded-xl">
                {product.drinkTiers.map((tier) => {
                  const isSelected = selectedTier?.id === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTier(tier)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-center leading-tight flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-stone-700 hover:text-stone-950 bg-white/70 hover:bg-white'
                      }`}
                    >
                      <span>{tier.label}</span>
                      <span className={`text-[11px] font-black ${isSelected ? 'text-emerald-100' : 'text-emerald-800'}`}>
                        ₪{tier.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector if product has sizes (for homemade salads) */}
          {product.sizes && !product.drinkTiers && (
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

          {/* Flavor Selector if product has drink flavors */}
          {product.drinkFlavors && product.drinkFlavors.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-stone-100" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] text-stone-500 font-bold block mb-1">
                בחר טעם פחית:
              </span>
              <div className="grid grid-cols-2 gap-1 bg-stone-100/70 p-1 rounded-xl max-h-28 overflow-y-auto">
                {product.drinkFlavors.map((flv) => {
                  const isSelected = selectedFlavor === flv;
                  return (
                    <button
                      key={flv}
                      type="button"
                      onClick={() => setSelectedFlavor(flv)}
                      className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center leading-tight truncate ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 shadow-xs ring-1 ring-amber-600 font-black'
                          : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/80 bg-white/70'
                      }`}
                      title={flv}
                    >
                      {flv}
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
              {product.drinkTiers && selectedTier
                ? selectedTier.label
                : product.sizes
                ? SALAD_SIZE_LABELS[selectedSize].short
                : product.isDrink
                ? 'מחיר אחיד לפחית'
                : 'מחיר'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              ₪{currentPrice}
            </span>
          </div>

          <div>
            {product.isCustomizable ? (
              <button
                type="button"
                onClick={handleAction}
                disabled={!isAvailable}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-700 text-emerald-900 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-emerald-200 hover:border-emerald-700 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>בחירת גודל ופרטים</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAction}
                disabled={!isAvailable}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-700/20 active:scale-95"
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
