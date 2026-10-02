import React, { useState, useMemo } from 'react';
import { Check, ChevronRight, Info, Plus, Sparkles, X, Scale } from 'lucide-react';
import { Product, SaladCustomization, SaladIngredient, SaladSize, SALAD_SIZE_LABELS } from '../types';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';

interface SaladBuilderModalProps {
  product: Product;
  initialSize?: SaladSize;
  onClose: () => void;
}

export const SaladBuilderModal: React.FC<SaladBuilderModalProps> = ({
  product,
  initialSize,
  onClose,
}) => {
  const { ingredients } = useStore();
  const { addToCart } = useCart();

  // Selected Salad Size (250g, 500g, 1kg)
  const [selectedSize, setSelectedSize] = useState<SaladSize>(
    initialSize || product.defaultSize || (product.sizes ? '500g' : '500g')
  );

  // Filter available ingredients by category
  const bases = useMemo(
    () => ingredients.filter((i) => i.category === 'base' && i.isAvailable),
    [ingredients]
  );
  const veggies = useMemo(
    () => ingredients.filter((i) => i.category === 'veggie' && i.isAvailable),
    [ingredients]
  );
  const proteins = useMemo(
    () => ingredients.filter((i) => i.category === 'protein' && i.isAvailable),
    [ingredients]
  );
  const addons = useMemo(
    () => ingredients.filter((i) => i.category === 'addon' && i.isAvailable),
    [ingredients]
  );
  const dressings = useMemo(
    () => ingredients.filter((i) => i.category === 'dressing' && i.isAvailable),
    [ingredients]
  );

  // Initialize selections with defaults if the product has them, or standard base
  const [selectedBases, setSelectedBases] = useState<string[]>(() => {
    if (product.defaultBases && product.defaultBases.length > 0) {
      return product.defaultBases;
    }
    return ['חסה ערבית פריכה'];
  });

  const [selectedVeggies, setSelectedVeggies] = useState<string[]>(() => {
    if (product.defaultVeggies && product.defaultVeggies.length > 0) {
      return product.defaultVeggies;
    }
    // Default 4 fresh veggies for custom salad
    return ['מלפפון ישראלי פריך', 'עגבניות שרי מתוקות', 'גזר מגורר דק', 'גרגירי תירס מתוק'];
  });

  const [selectedProteins, setSelectedProteins] = useState<string[]>(() => {
    if (product.defaultProteins && product.defaultProteins.length > 0) {
      return product.defaultProteins;
    }
    return [];
  });

  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const [selectedDressings, setSelectedDressings] = useState<string[]>(() => {
    if (product.defaultDressings && product.defaultDressings.length > 0) {
      return product.defaultDressings;
    }
    return ['ויניגרט הדרים וחרדל דיז׳ון'];
  });

  const [dressingOption, setDressingOption] = useState<'mixed' | 'on_side'>('on_side');
  const [breadOption, setBreadOption] = useState<
    'white_ciabatta' | 'whole_wheat' | 'gluten_free' | 'none'
  >('white_ciabatta');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Active step / tab in builder
  const [activeTab, setActiveTab] = useState<'base' | 'veggies' | 'protein' | 'addons' | 'dressing' | 'bread'>('base');

  // Toggle selection helpers
  const toggleBase = (name: string) => {
    if (selectedBases.includes(name)) {
      if (selectedBases.length > 1) {
        setSelectedBases(selectedBases.filter((b) => b !== name));
      }
    } else {
      if (selectedBases.length < 2) {
        setSelectedBases([...selectedBases, name]);
      } else {
        // Replace second
        setSelectedBases([selectedBases[0], name]);
      }
    }
  };

  const toggleVeggie = (name: string) => {
    if (selectedVeggies.includes(name)) {
      setSelectedVeggies(selectedVeggies.filter((v) => v !== name));
    } else {
      setSelectedVeggies([...selectedVeggies, name]);
    }
  };

  const toggleProtein = (name: string) => {
    if (selectedProteins.includes(name)) {
      setSelectedProteins(selectedProteins.filter((p) => p !== name));
    } else {
      setSelectedProteins([...selectedProteins, name]);
    }
  };

  const toggleAddon = (name: string) => {
    if (selectedAddons.includes(name)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== name));
    } else {
      setSelectedAddons([...selectedAddons, name]);
    }
  };

  const toggleDressing = (name: string) => {
    if (selectedDressings.includes(name)) {
      setSelectedDressings(selectedDressings.filter((d) => d !== name));
    } else {
      if (selectedDressings.length < 3) {
        setSelectedDressings([...selectedDressings, name]);
      } else {
        setSelectedDressings([selectedDressings[0], selectedDressings[1], name]);
      }
    }
  };

  // Extra price calculations:
  // Base: Premium bases add their extra price
  // Veggies: First 6 veggies included in base price! Beyond 6, ₪3 per veggie.
  // Proteins: Add item price if not already in defaultProteins of the pre-set salad
  // Addons: Add addon price
  // Dressings: First 2 included. Beyond 2, ₪2 per dressing
  const extraPrice = useMemo(() => {
    let extra = 0;

    // Check premium bases
    selectedBases.forEach((bName) => {
      const ing = bases.find((i) => i.name === bName);
      if (ing && ing.price > 0) extra += ing.price;
    });

    // Check extra veggies (beyond 6)
    if (selectedVeggies.length > 6) {
      extra += (selectedVeggies.length - 6) * 3;
    }
    // Also add premium veggies cost if any
    selectedVeggies.forEach((vName) => {
      const ing = veggies.find((i) => i.name === vName);
      if (ing && ing.price > 0) extra += ing.price;
    });

    // Check proteins
    selectedProteins.forEach((pName) => {
      // If it's a pre-set salad and this protein was already included, don't charge extra for the first one
      const wasDefault = product.defaultProteins?.includes(pName);
      if (!wasDefault) {
        const ing = proteins.find((i) => i.name === pName);
        if (ing) extra += ing.price;
      }
    });

    // Addons
    selectedAddons.forEach((aName) => {
      const ing = addons.find((i) => i.name === aName);
      if (ing) extra += ing.price;
    });

    // Dressings beyond 2
    if (selectedDressings.length > 2) {
      extra += (selectedDressings.length - 2) * 2;
    }

    return extra;
  }, [
    selectedBases,
    selectedVeggies,
    selectedProteins,
    selectedAddons,
    selectedDressings,
    bases,
    veggies,
    proteins,
    addons,
    product.defaultProteins,
  ]);

  // Base price dynamically resolved from selected size if product has sizes
  const baseProductPrice = useMemo(() => {
    if (product.sizes && selectedSize && product.sizes[selectedSize]) {
      return product.sizes[selectedSize];
    }
    return product.price;
  }, [product, selectedSize]);

  const unitTotal = baseProductPrice + extraPrice;
  const grandItemTotal = unitTotal * quantity;

  // Build summary text bullets for cart view
  const customSummaryText = useMemo(() => {
    const list: string[] = [];
    if (product.sizes) {
      list.push(`גודל סלט: ${SALAD_SIZE_LABELS[selectedSize].full}`);
    }
    if (selectedBases.length) list.push(`בסיס: ${selectedBases.join(', ')}`);
    if (selectedVeggies.length) list.push(`ירקות (${selectedVeggies.length}): ${selectedVeggies.join(', ')}`);
    if (selectedProteins.length) list.push(`חלבון: ${selectedProteins.join(', ')}`);
    if (selectedAddons.length) list.push(`תוספות: ${selectedAddons.join(', ')}`);
    if (selectedDressings.length) {
      list.push(`רטבים: ${selectedDressings.join(', ')} (${dressingOption === 'mixed' ? 'מעורבב' : 'בצד'})`);
    }
    const breadLabels: Record<string, string> = {
      white_ciabatta: 'ג׳בטת מחמצת כפרית',
      whole_wheat: 'לחם מלא',
      gluten_free: 'לחמנייה ללא גלוטן (+₪4)',
      none: 'ללא לחם',
    };
    list.push(`לחם: ${breadLabels[breadOption] || 'בצד'}`);
    if (specialInstructions.trim()) {
      list.push(`הערה: ${specialInstructions.trim()}`);
    }
    return list;
  }, [
    product.sizes,
    selectedSize,
    selectedBases,
    selectedVeggies,
    selectedProteins,
    selectedAddons,
    selectedDressings,
    dressingOption,
    breadOption,
    specialInstructions,
  ]);

  const handleAddToCart = () => {
    const customization: SaladCustomization = {
      bases: selectedBases,
      veggies: selectedVeggies,
      proteins: selectedProteins,
      addons: selectedAddons,
      dressings: selectedDressings,
      dressingOption,
      breadOption,
      specialInstructions: specialInstructions.trim(),
    };

    addToCart(
      product,
      quantity,
      customization,
      customSummaryText,
      extraPrice,
      product.sizes ? selectedSize : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 rounded-2xl object-cover border border-stone-200 shadow-xs"
            />
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">
                {product.name}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                התאם והרכב את הסלט שלך בדיוק לטעמך
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

        {/* Salad Size Selector Banner (if product has sizes) */}
        {product.sizes && (
          <div className="px-5 py-3 bg-emerald-50/70 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-950 block">בחר את גודל הסלט:</span>
                <span className="text-[11px] text-emerald-700">המחיר והמנה מתעדכנים בהתאם</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
              {(['250g', '500g', '1kg'] as SaladSize[]).map((sizeKey) => {
                const isSelected = selectedSize === sizeKey;
                const sizePrice = product.sizes?.[sizeKey] ?? product.price;

                return (
                  <button
                    key={sizeKey}
                    type="button"
                    onClick={() => setSelectedSize(sizeKey)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
                    }`}
                  >
                    <div>{SALAD_SIZE_LABELS[sizeKey].short}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-emerald-100 font-extrabold' : 'text-emerald-800 font-bold'}`}>
                      ₪{sizePrice}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step navigation tabs */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 py-2.5 bg-stone-100 border-b border-stone-200 text-xs font-semibold shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('base')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 flex items-center gap-1 ${
              activeTab === 'base'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>🥬</span>
            <span>1. בסיס ({selectedBases.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('veggies')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 flex items-center gap-1 ${
              activeTab === 'veggies'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>🥒</span>
            <span>2. ירקות ({selectedVeggies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('protein')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 flex items-center gap-1 ${
              activeTab === 'protein'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>🍗</span>
            <span>3. חלבון ({selectedProteins.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addons')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 flex items-center gap-1 ${
              activeTab === 'addons'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>🥑</span>
            <span>4. תוספות ({selectedAddons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dressing')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 flex items-center gap-1 ${
              activeTab === 'dressing'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>🫗</span>
            <span>5. רטבים ({selectedDressings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bread')}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 flex items-center gap-1 ${
              activeTab === 'bread'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>🥖</span>
            <span>6. לחם והערות</span>
          </button>
        </div>

        {/* Scrollable body with active step content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: BASES */}
          {activeTab === 'base' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">בחר בסיס לסלט (עד 2)</h3>
                  <p className="text-xs text-stone-500">
                    ניתן לשלב בין חסה, עלי תרד, כרוב, קינואה או פסטה
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  נבחרו: {selectedBases.length}/2
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {bases.map((b) => {
                  const isSelected = selectedBases.includes(b.name);
                  return (
                    <button
                      key={b.id}
                      onClick={() => toggleBase(b.name)}
                      className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{b.icon || '🥬'}</span>
                        <div>
                          <div className="font-bold text-sm text-stone-900">{b.name}</div>
                          <div className="text-[11px] text-stone-500">
                            {b.calories} קק״ל {b.price > 0 && `• +₪${b.price}`}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: VEGGIES */}
          {activeTab === 'veggies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">בחר ירקות טריים</h3>
                  <p className="text-xs text-stone-500">
                    6 ירקות כלולים במחיר המנה! כל ירק נוסף ב-₪3 בלבד
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    selectedVeggies.length > 6
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  נבחרו: {selectedVeggies.length} (
                  {selectedVeggies.length <= 6
                    ? `${6 - selectedVeggies.length} נוספים כלולים`
                    : `+₪${(selectedVeggies.length - 6) * 3}`}
                  )
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {veggies.map((v) => {
                  const isSelected = selectedVeggies.includes(v.name);
                  return (
                    <button
                      key={v.id}
                      onClick={() => toggleVeggie(v.name)}
                      className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{v.icon || '🥒'}</span>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-stone-900 leading-tight">
                            {v.name}
                          </div>
                          {v.price > 0 && (
                            <span className="text-[10px] text-amber-700 font-semibold block">
                              +₪{v.price} (פרימיום)
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PROTEIN */}
          {activeTab === 'protein' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">בחירת מנת חלבון</h3>
                  <p className="text-xs text-stone-500">
                    הוסף חלבון מובחר להשלמת הארוחה
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  נבחרו: {selectedProteins.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {proteins.map((p) => {
                  const isSelected = selectedProteins.includes(p.name);
                  const isIncludedDefault = product.defaultProteins?.includes(p.name);

                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProtein(p.name)}
                      className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{p.icon || '🍗'}</span>
                        <div>
                          <div className="font-bold text-sm text-stone-900">{p.name}</div>
                          <div className="text-xs text-stone-500">
                            {isIncludedDefault ? (
                              <span className="text-emerald-700 font-bold">כלול בסלט זה</span>
                            ) : (
                              <span>+₪{p.price}</span>
                            )}{' '}
                            • {p.calories} קק״ל
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ADDONS */}
          {activeTab === 'addons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">תוספות קראנצ׳יות ופינוקים</h3>
                  <p className="text-xs text-stone-500">אגוזים, פקאן, שקדים, אבוקדו וקרוטונים</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  נבחרו: {selectedAddons.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {addons.map((a) => {
                  const isSelected = selectedAddons.includes(a.name);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAddon(a.name)}
                      className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{a.icon || '🥑'}</span>
                        <div>
                          <div className="font-bold text-sm text-stone-900">{a.name}</div>
                          <div className="text-xs text-stone-500">
                            +₪{a.price} • {a.calories} קק״ל
                          </div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: DRESSINGS */}
          {activeTab === 'dressing' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">רטבים תוצרת בית</h3>
                  <p className="text-xs text-stone-500">
                    עד 2 רטבים ללא עלות! רוטב נוסף ב-₪2
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  נבחרו: {selectedDressings.length}
                </span>
              </div>

              {/* Dressing style selector */}
              <div className="p-3 bg-stone-100/80 rounded-2xl border border-stone-200/80">
                <span className="text-xs font-bold text-stone-700 block mb-2">אופן הגשת הרוטב:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDressingOption('on_side')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      dressingOption === 'on_side'
                        ? 'bg-white text-emerald-800 shadow-xs border border-emerald-500'
                        : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    🥣 רוטב בצד (מומלץ למשלוח)
                  </button>
                  <button
                    onClick={() => setDressingOption('mixed')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      dressingOption === 'mixed'
                        ? 'bg-white text-emerald-800 shadow-xs border border-emerald-500'
                        : 'text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    🥗 רוטב מעורבב בסלט
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {dressings.map((d) => {
                  const isSelected = selectedDressings.includes(d.name);
                  return (
                    <button
                      key={d.id}
                      onClick={() => toggleDressing(d.name)}
                      className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{d.icon || '🫗'}</span>
                        <div>
                          <div className="font-bold text-sm text-stone-900">{d.name}</div>
                          <div className="text-xs text-stone-500">{d.calories} קק״ל</div>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: BREAD & INSTRUCTIONS */}
          {activeTab === 'bread' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-stone-900 text-base">לחם בצד המנה</h3>
                <p className="text-xs text-stone-500">כל סלט מגיע בליווי לחם לבחירתך</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'white_ciabatta', label: 'ג׳בטת מחמצת כפרית', icon: '🥖', extra: 0 },
                  { id: 'whole_wheat', label: 'לחם מלא ודגנים', icon: '🍞', extra: 0 },
                  { id: 'gluten_free', label: 'לחמנייה ללא גלוטן', icon: '🌾', extra: 4 },
                  { id: 'none', label: 'ללא לחם (אני מוותר/ת)', icon: '🚫', extra: 0 },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBreadOption(b.id as any)}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between ${
                      breadOption === b.id
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{b.icon}</span>
                      <div className="font-bold text-xs sm:text-sm text-stone-900">
                        {b.label}
                        {b.extra > 0 && <span className="text-amber-700 block text-xs">+₪{b.extra}</span>}
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        breadOption === b.id
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {breadOption === b.id && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  הערות מיוחדות להכנה (לדוגמה: לקצוץ דק במיוחד, בלי בצל כלל, רטבים אקסטרה)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="כתוב כאן בקשות מיוחדות למטבח..."
                  rows={3}
                  className="w-full p-3 text-xs bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>
          )}

          {/* Quick summary strip */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>סיכום הרכבה אישית</span>
              </span>
              <span>₪{unitTotal} ליחידה</span>
            </div>
            <div className="text-[11px] text-stone-600 leading-relaxed">
              {customSummaryText.slice(0, 4).join(' • ')}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-4 bg-white border-t border-stone-200/90 flex items-center justify-between gap-4 shrink-0 shadow-lg">
          {/* Quantity Selector */}
          <div className="flex items-center bg-stone-100 rounded-2xl p-1 border border-stone-200">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-base disabled:opacity-40 transition-colors shadow-xs"
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-sm text-stone-900">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-base transition-colors shadow-xs"
            >
              +
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-emerald-600/30 flex items-center justify-between transition-all transform active:scale-98"
          >
            <span className="flex items-center gap-1.5">
              <span>הוסף לסל</span>
              <ChevronRight className="w-4 h-4 rotate-180" />
            </span>
            <span className="font-extrabold text-white text-base">₪{grandItemTotal}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
