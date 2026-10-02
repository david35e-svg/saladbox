import React from 'react';
import { Award, Clock, Leaf, Sparkles, Truck } from 'lucide-react';

interface HeroBannerProps {
  onStartCustomSalad: () => void;
  onExploreMenu: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onStartCustomSalad,
  onExploreMenu,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-stone-900 text-white rounded-3xl mx-4 sm:mx-6 my-4 shadow-xl">
      {/* Decorative background glow & shapes */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-lime-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-5 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
              <span>עשיר, טרי וקצוץ ברגע ההזמנה</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
              הסלט שלך. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-300 via-lime-300 to-emerald-200">
                בדיוק כמו שאתה אוהב.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/90 max-w-xl font-normal leading-relaxed">
              בחר, הרכב והזמן תוך דקות. ירקות שנקטפו הבוקר, חלבונים איכותיים, תוספות פריכות ורטבים בייצור עצמי.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartCustomSalad}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-500 text-stone-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-102 active:scale-98 transition-all flex items-center gap-2"
              >
                <span className="text-lg">🥣</span>
                <span>הרכב סלט אישי עכשיו</span>
              </button>

              <button
                onClick={onExploreMenu}
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-xs transition-all hover:scale-102 active:scale-98"
              >
                צפייה בתפריט המלא
              </button>
            </div>

            {/* Micro badges */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-emerald-800/60">
              <div className="flex items-center gap-2 text-xs text-emerald-200/90 font-medium">
                <Truck className="w-4 h-4 text-amber-300 shrink-0" />
                <span>משלוחים בנוף הגליל בלבד</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-200/90 font-medium">
                <Clock className="w-4 h-4 text-lime-400 shrink-0" />
                <span>הזמנות עד יום שלישי בחצות</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-200/90 font-medium col-span-2 sm:col-span-1">
                <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>גדלים: 250 גר׳, 500 גר׳, 1 ק״ג</span>
              </div>
            </div>
          </div>

          {/* Visual Salad Feature Hero Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 to-lime-500/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all"></div>
              <div className="relative bg-stone-800/80 backdrop-blur-md border border-white/15 rounded-3xl p-4 shadow-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
                  alt="סלט בהרכבה אישית"
                  className="w-full h-56 sm:h-64 object-cover rounded-2xl group-hover:scale-104 transition-transform duration-500"
                />

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full">
                        ★ הכי נמכר
                      </span>
                      <span className="text-xs text-stone-300">הרכבה בלייב</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      קערת SALAD BOX אישית
                    </h3>
                  </div>

                  <div className="text-left">
                    <span className="text-xs text-stone-400 block">החל מ-</span>
                    <span className="text-xl font-black text-emerald-400">₪49</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
