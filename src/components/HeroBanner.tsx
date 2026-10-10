import React, { useState } from 'react';
import { CalendarCheck, ChevronLeft, MapPin, PackageCheck, Scale, Sparkles, UtensilsCrossed } from 'lucide-react';
import fullShabbatTableImage from '../assets/images/full_shabbat_table_1791015934773.jpg';
import biDrinkCansImage from '../assets/images/bi_drink_cans_1791015885068.jpg';

interface HeroBannerProps {
  onExploreMenu: () => void;
  onSelectPackages?: () => void;
  onOpenEvents?: () => void;
  onStartCustomSalad?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreMenu,
  onSelectPackages,
  onOpenEvents,
}) => {
  const [heroCardTab, setHeroCardTab] = useState<'shabbat' | 'drinks'>('shabbat');

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#1b2f23] via-[#14231b] to-stone-900 text-white rounded-3xl mx-4 sm:mx-6 my-4 shadow-xl border border-emerald-900/60">
      {/* Warm boutique atmospheric glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-12 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Story & Copy */}
          <div className="lg:col-span-7 space-y-5 text-right">
            {/* Boutique Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-amber-200 text-xs font-semibold backdrop-blur-xs shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>חנות בוטיק לסלטים ביתיים מבושלים ופחיות B.I • נוף הגליל</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.18] text-white">
                סלטים ביתיים עשירים <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-200 via-emerald-300 to-lime-200">
                  שנולדו לשולחן שישי.
                </span>
              </h1>
              <p className="text-lg sm:text-xl font-bold text-amber-200/90 tracking-wide">
                אתם בוחרים — אנחנו מבשלים — אתם מגישים.
              </p>
            </div>

            {/* Concept Description */}
            <p className="text-sm sm:text-base text-stone-200/90 max-w-xl font-normal leading-relaxed">
              אצלנו לא קונים סלטים תעשייתיים ולא הכנות שעומדות ימים במקרר.
              כל סיר מטבוחה מתבשל 5 שעות על אש קטנה, החצילים נקלים על גחלים אמיתיות,
              וכל סלט מוכן <strong className="text-white font-bold">טרי ולפי הזמנה מראש</strong> לקראת סוף השבוע שלכם.
              במשקל מדויק לבחירה (250 גרם, 500 גרם, 1 ק"ג), מארזי שישי עשירים ופחיות שתייה קרירות מבית B.I פיתות לאירועים.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreMenu}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-600 text-stone-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-900/40 hover:shadow-emerald-600/30 hover:scale-102 active:scale-98 transition-all flex items-center gap-2"
              >
                <span className="text-lg">🥗</span>
                <span>כניסה לחנות הסלטים</span>
              </button>

              {onSelectPackages && (
                <button
                  onClick={onSelectPackages}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-all hover:scale-102 active:scale-98 flex items-center gap-2"
                >
                  <PackageCheck className="w-4 h-4 text-amber-300" />
                  <span>מארזי שישי ואירוח</span>
                </button>
              )}

              {onOpenEvents && (
                <button
                  onClick={onOpenEvents}
                  className="px-4 py-3 text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1.5 underline decoration-amber-400/40 underline-offset-4"
                >
                  <span>שבת חתן, אזכרות ואירועים קטנים</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Micro badges - Store policy */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-emerald-800/50">
              <div className="flex items-center gap-2 text-[11px] text-emerald-200/90 font-medium">
                <UtensilsCrossed className="w-4 h-4 text-amber-300 shrink-0" />
                <span>מכינים טרי לפי הזמנה</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-200/90 font-medium">
                <CalendarCheck className="w-4 h-4 text-lime-400 shrink-0" />
                <span>הזמנות עד יום שלישי בחצות</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-200/90 font-medium">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>איסוף / הפצה בנוף הגליל</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-200/90 font-medium">
                <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>250g | 500g | 1 ק״ג</span>
              </div>
            </div>
          </div>

          {/* Interactive Showcase Card with Tab Toggle */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/20 to-emerald-600/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all"></div>
              <div className="relative bg-stone-900/90 backdrop-blur-md border border-stone-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden space-y-3.5">
                {/* Switcher Tab: Shabbat Salads / B.I Drink Cans */}
                <div className="flex items-center gap-1.5 p-1 bg-stone-800/80 rounded-xl border border-stone-700 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setHeroCardTab('shabbat')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      heroCardTab === 'shabbat'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>🥗</span>
                    <span>שולחן שישי (16 סלטים)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroCardTab('drinks')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      heroCardTab === 'drinks'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <span>🥤</span>
                    <span>פחיות שתייה B.I</span>
                  </button>
                </div>

                {/* Card Content depending on Tab */}
                {heroCardTab === 'shabbat' ? (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="relative overflow-hidden rounded-2xl">
                      <img
                        src={fullShabbatTableImage}
                        alt="שולחן סלטים עשיר לשבת - 16 קעריות"
                        className="w-full h-56 sm:h-64 object-cover rounded-2xl group-hover:scale-104 transition-transform duration-700"
                      />
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-stone-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
                        <span>👑</span>
                        <span>שולחן שישי מלא</span>
                      </div>

                      <div className="absolute bottom-2.5 right-2.5 left-2.5 bg-stone-950/85 backdrop-blur-md border border-stone-700/60 p-2 rounded-xl text-[11px] text-stone-200 flex items-center justify-between">
                        <span className="font-semibold text-emerald-300 truncate">
                          🍅 מטבוחה • חומוס • שום קונפי • כרוב גזר • עשבים
                        </span>
                        <span className="text-[10px] text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/50 shrink-0 mr-1">
                          16 קעריות
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                          מארז שולחן שישי עשיר ומפואר
                        </h3>
                        <p className="text-xs text-stone-400 mt-0.5">
                          16 קעריות סלטים ומטבלים ביתיים לשולחן שבת
                        </p>
                      </div>

                      <div className="text-left shrink-0">
                        <span className="text-[10px] text-stone-400 block font-medium">החל מ-</span>
                        <span className="text-xl sm:text-2xl font-black text-amber-300">₪139</span>
                        <span className="text-[10px] text-stone-400 block font-semibold">למארז</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="relative overflow-hidden rounded-2xl">
                      <img
                        src={biDrinkCansImage}
                        alt="פחיות שתייה מרעננות B.I - 4 טעמים לבחירה"
                        className="w-full h-56 sm:h-64 object-cover rounded-2xl group-hover:scale-104 transition-transform duration-700"
                      />
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-stone-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
                        <span>🧊</span>
                        <span>מוגש קר עם קרח</span>
                      </div>

                      <div className="absolute bottom-2.5 right-2.5 left-2.5 bg-stone-950/85 backdrop-blur-md border border-stone-700/60 p-2 rounded-xl text-[11px] text-stone-200 flex items-center justify-between">
                        <span className="font-semibold text-amber-300 truncate">
                          🍏 תפוח נענע • 🍋 לימונדה • 🍓 תות • 🫐 פירות יער
                        </span>
                        <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50 shrink-0 mr-1">
                          B.I אירועים
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                          פחיות שתייה B.I לאירועים ולשבת
                        </h3>
                        <p className="text-xs text-stone-400 mt-0.5">
                          מבחר 4 טעמים מרעננים לבחירת הלקוח
                        </p>
                      </div>

                      <div className="text-left shrink-0">
                        <span className="text-[10px] text-stone-400 block font-medium">לפחית</span>
                        <span className="text-xl sm:text-2xl font-black text-amber-300">₪14</span>
                        <span className="text-[10px] text-emerald-400 block font-semibold">רביעייה ב-₪48</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={onExploreMenu}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-emerald-600/50 shadow-sm"
                >
                  <span>
                    {heroCardTab === 'shabbat'
                      ? 'צפייה בסלטים ומארזים לשולחן שישי'
                      : 'בחירת טעמים ופחיות שתייה B.I'}
                  </span>
                  <ChevronLeft className="w-4 h-4 text-emerald-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
