import React, { useState, useMemo } from 'react';
import { Calculator, Users, Plus, Check, X, Sparkles, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface PortionsCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToStore?: () => void;
}

export const PortionsCalculatorModal: React.FC<PortionsCalculatorModalProps> = ({
  isOpen,
  onClose,
  onGoToStore,
}) => {
  const { products } = useStore();
  const { addToCart, setIsCartOpen } = useCart();

  const [guestCount, setGuestCount] = useState<number>(8);
  const [mealType, setMealType] = useState<'kiddush' | 'standard' | 'festive'>('standard');
  const [addedToast, setAddedToast] = useState(false);

  // Recommendations math based on culinary hospitality standards
  const recommendation = useMemo(() => {
    // multiplier per person in grams
    const gramFactor = mealType === 'kiddush' ? 180 : mealType === 'standard' ? 260 : 350;
    const totalGramsNeeded = guestCount * gramFactor;

    // Small containers (250g - dips, spicy, spreads)
    const smallContainersCount = Math.max(3, Math.ceil(guestCount * 0.6));
    // Large containers (500g - matbucha, eggplant, cooked salads)
    const largeContainersCount = Math.max(2, Math.ceil(guestCount * 0.4));
    // Canned drinks recommendation
    const cansCount = Math.max(2, Math.ceil(guestCount * 1.0));
    // Challah loaves
    const challahCount = Math.max(1, Math.ceil(guestCount / 4));

    return {
      totalGramsNeeded,
      smallContainersCount,
      largeContainersCount,
      cansCount,
      challahCount,
    };
  }, [guestCount, mealType]);

  // Find standard products to bundle
  const recommendedItems = useMemo(() => {
    const matbucha = products.find((p) => p.name.includes('מטבוחה')) || products[0];
    const eggplant = products.find((p) => p.name.includes('חציל')) || products[1];
    const garlic = products.find((p) => p.name.includes('שום קונפי')) || products[2];
    const cabbage = products.find((p) => p.name.includes('כרוב')) || products[3];
    const drink = products.find((p) => p.isDrink || p.name.includes('שתייה')) || products[products.length - 1];

    return { matbucha, eggplant, garlic, cabbage, drink };
  }, [products]);

  const handleAddBundleToCart = () => {
    if (recommendedItems.matbucha) {
      addToCart(recommendedItems.matbucha, 1, undefined, undefined, 0, '500g');
    }
    if (recommendedItems.eggplant) {
      addToCart(recommendedItems.eggplant, 1, undefined, undefined, 0, '500g');
    }
    if (recommendedItems.garlic) {
      addToCart(recommendedItems.garlic, 1, undefined, undefined, 0, '250g');
    }
    if (recommendedItems.cabbage) {
      addToCart(recommendedItems.cabbage, 1, undefined, undefined, 0, '250g');
    }
    if (recommendedItems.drink) {
      const tier = recommendedItems.drink.drinkTiers?.find((t) => t.quantity >= 4) || recommendedItems.drink.drinkTiers?.[0];
      addToCart(recommendedItems.drink, 1, undefined, undefined, 0, undefined, 'תפוח נענע', tier);
    }

    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
      setIsCartOpen(true);
      if (onGoToStore) onGoToStore();
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xl shadow-md">
              🧮
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                מחשבון כמויות חכם לאירוח וסעודת שבת
              </h2>
              <p className="text-xs text-emerald-200 font-medium">
                חישוב מדויק של סלטים, משקלים ופחיות שתייה כדי שלא יחסר כלום
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Guest Count Selector */}
          <div className="space-y-3 bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-stone-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>כמה סועדים ואורחים סביב השולחן?</span>
              </label>
              <span className="text-2xl font-black text-emerald-700 bg-emerald-100 px-4 py-1 rounded-xl">
                {guestCount} סועדים
              </span>
            </div>

            <input
              type="range"
              min="2"
              max="40"
              step="1"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
            />

            <div className="flex justify-between text-[11px] text-stone-400 font-medium">
              <span>2 איש (זוגי)</span>
              <span>8-10 (משפחה)</span>
              <span>20 (אירוח מורחב)</span>
              <span>40 (שבת חתן)</span>
            </div>
          </div>

          {/* Meal Style Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700">סוג הארוחה / אופי האירוח:</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMealType('kiddush')}
                className={`p-3 rounded-2xl border text-right transition-all ${
                  mealType === 'kiddush'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="text-base">🍷 קידוש קל</div>
                <div className="text-[11px] text-stone-500 mt-0.5">נישנוש סלטים וחלה</div>
              </button>

              <button
                type="button"
                onClick={() => setMealType('standard')}
                className={`p-3 rounded-2xl border text-right transition-all ${
                  mealType === 'standard'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="text-base">🍲 סעודת שבת</div>
                <div className="text-[11px] text-stone-500 mt-0.5">מנה ראשונה עשירה</div>
              </button>

              <button
                type="button"
                onClick={() => setMealType('festive')}
                className={`p-3 rounded-2xl border text-right transition-all ${
                  mealType === 'festive'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="text-base">👑 אירוח שופע</div>
                <div className="text-[11px] text-stone-500 mt-0.5">שבת חתן / שולחן מלכים</div>
              </button>
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-5 rounded-2xl border border-amber-200/90 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-black text-stone-900 text-sm">
                ההמלצה הקולינרית של SALAD BOX עבור {guestCount} סועדים:
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                <div className="text-xl font-black text-emerald-800">
                  {(recommendation.totalGramsNeeded / 1000).toFixed(1)} ק"ג
                </div>
                <div className="text-[11px] text-stone-600 font-bold mt-1">סה"כ סלטים</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                <div className="text-xl font-black text-amber-700">
                  {recommendation.largeContainersCount} קופסאות
                </div>
                <div className="text-[11px] text-stone-600 font-bold mt-1">סלטים מבושלים (500g)</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                <div className="text-xl font-black text-stone-900">
                  {recommendation.smallContainersCount} קופסאות
                </div>
                <div className="text-[11px] text-stone-600 font-bold mt-1">מטבלים וחריף (250g)</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                <div className="text-xl font-black text-blue-700">
                  {recommendation.cansCount} יח׳
                </div>
                <div className="text-[11px] text-stone-600 font-bold mt-1">פחיות שתייה B.I</div>
              </div>
            </div>

            <div className="text-xs text-stone-600 leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-100">
              💡 <strong>טיפ השף לשבת:</strong> עבור שולחן של {guestCount} מומלץ לגוון בין 2 סלטים מבושלים עשירים (כמו מטבוחה וחציל קלוי), 2 מטבלים/חריפים (שום קונפי וסחוג/טחינה) וסלט ירקות פריך (כרוב וגזר/סלק).
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              if (onGoToStore) onGoToStore();
            }}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
          >
            הרכבת סל ידנית בחנות ←
          </button>

          <button
            onClick={handleAddBundleToCart}
            disabled={addedToast}
            className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {addedToast ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>נוסף לסל בהצלחה! פותח עגלה...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>הוסף הרכב אירוח מומלץ זה ישירות לסל</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
