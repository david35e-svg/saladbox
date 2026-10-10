import React, { useState } from 'react';
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Heart,
  HelpCircle,
  LogIn,
  LogOut,
  MapPin,
  Phone,
  ReceiptText,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  Utensils,
  ChevronDown,
  Gift,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { checkOrderWindow } from '../utils/orderCutoff';
import fullShabbatTableImage from '../assets/images/full_shabbat_table_1791015934773.jpg';
import biDrinkCansImage from '../assets/images/bi_drink_cans_1791015885068.jpg';
import garlicConfitImage from '../assets/images/garlic_confit_bowl_1791015899983.jpg';
import cabbageCarrotImage from '../assets/images/cabbage_carrot_salad_1791015917799.jpg';

interface LandingPageProps {
  onEnterStore: () => void;
  onOpenCalculator: () => void;
  onOpenEvents: () => void;
  onOpenOrders?: () => void;
  onOpenFavorites?: () => void;
  onOpenPhoneOrder?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterStore,
  onOpenCalculator,
  onOpenEvents,
  onOpenOrders,
  onOpenFavorites,
  onOpenPhoneOrder,
}) => {
  const { user, profile, isAdmin, loginWithGoogle, logout } = useAuth();
  const { itemsCount, grandTotal } = useCart();
  const { settings, products } = useStore();
  const orderWindow = checkOrderWindow(settings);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'עד מתי ניתן להזמין סלטים לשבת הקרובה?',
      a: 'ההזמנות נסגרות בכל שבוע ביום שלישי בדיוק בחצות (23:59). מאחר ואנחנו פותחים סירים ומבשלים במיוחד לפי כמויות ההזמנה ללא מלאי עומד במקרר, לא ניתן להזמין לאחר שעת הסגירה.',
    },
    {
      q: 'היכן מתבצעים המשלוחים והאיסוף העצמי?',
      a: 'משלוחים מתבצעים ישירות לבית הלקוח בכל שכונות נוף הגליל ברכב מקורר ביום שישי בבוקר. כמו כן, ניתן לבצע איסוף עצמי חינם מנקודת האיסוף שלנו בסניף נוף הגליל בימי שישי בין 09:00 ל-14:00.',
    },
    {
      q: 'האם חובה להירשם או להתחבר לאתר כדי להזמין?',
      a: 'לא! ניתן לגלוש בחופשיות, להוסיף לסל, להרכיב סלטים ולבצע הזמנה כאורח. התחברות באמצעות חשבון Google מאפשרת לכם לצפות בהיסטוריית הזמנות, לשמור מועדפים ולבצע הזמנה חוזרת בקליק.',
    },
    {
      q: 'מהם גדלי הקופסאות של הסלטים?',
      a: 'אנו מציעים שלושה גדלים מדויקים: 250 גרם (אידיאלי למטבלים, ממרחים וחריפים), 500 גרם (לסלטים מבושלים מרכזיים כמו מטבוחה וחציל קלוי) ו-1 ק״ג (לאירוח משפחתי נדיב).',
    },
    {
      q: 'כיצד פועל מחירון פחיות השתייה B.I?',
      a: 'פחיות B.I מוצעות במחיר אחיד לפחית בודדת או במחירון מדורג חסכוני (זוג, רביעייה, שישייה) עם בחירה חופשית של טעמים מרעננים (תפוח נענע, לימונדה קרה, אפרסק, תות ליים).',
    },
    {
      q: 'מהי רמת הכשרות וחומרי הגלם?',
      a: 'כל חומרי הגלם מהדרין בקפידה, ירק גוש קטיף נקי מחשש תולעים, בישול ישראל בהקפדה מלאה וסביבת בישול ביתית כשרה ונקייה ללא פשרות.',
    },
    {
      q: 'כיצד מתבצע התשלום?',
      a: 'התשלום מוסדר בצורה נוחה ושקופה: במזומן בעת איסוף/מסירה, באמצעות העברה ב-Bit, או הזמנה מאובטחת באתר. אין חיובים נסתרים.',
    },
  ];

  const testimonials = [
    {
      name: 'משפחת כהן, נוף הגליל',
      text: 'המטבוחה פשוט הזכירה לי את הבית של סבתא! בישול איטי מורגש בכל ביס, הכל הגיע קר, ארוז מושלם וטרי לחלוטין. חסך לנו שעות של בישולים בשישי.',
      stars: 5,
    },
    {
      name: 'יוסי ורונית מ., נוף הגליל',
      text: 'הזמנו לשבת חתן מארז ענק כולל פחיות B.I ושום קונפי. האורחים לא הפסיקו להחמיא על הטריות והטעם. שירות מדהים ודייקנות של שעון שוויצרי.',
      stars: 5,
    },
    {
      name: 'מיכל א., נוף הגליל',
      text: 'הקונספט של ״מבשלים רק לפי הזמנה״ מורגש מיד. שום סלט תעשייתי בסופר לא מתקרב לרמה הזו. תענוג אמיתי לשולחן שבת.',
      stars: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-600 selection:text-white flex flex-col justify-between">
      {/* Top Notice Bar */}
      <div className="bg-emerald-950 text-emerald-200 text-xs py-2 px-4 border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-300">
              <span>👑</span>
              <span>SALAD BOX • בוטיק סלטי שבת ואירוח ביתי</span>
            </span>
            <span className="hidden md:inline text-emerald-600">•</span>
            <span className="hidden md:inline text-emerald-300">
              {orderWindow.isOpen
                ? 'הזמנות לשבת הקרובה פתוחות עד יום שלישי ב-23:59'
                : 'מועד ההזמנות הנוכחי הסתיים — ההזמנות ייפתחו למחזור הבא'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1 text-emerald-300">
              <MapPin className="w-3.5 h-3.5 text-lime-400" />
              <span>משלוחים בנוף הגליל בלבד</span>
            </span>
            <span className="hidden sm:inline text-emerald-700">|</span>
            <span className="flex items-center gap-1 text-emerald-300">
              <Phone className="w-3.5 h-3.5" />
              <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                {settings.phone}
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-lime-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <span className="text-xl sm:text-2xl">🥗</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900">
                  SALAD BOX
                </span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                  בוטיק שבת
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                סלטים ביתיים טריים לשולחן שישי ולאירוח • נוף הגליל
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-stone-600">
            <a href="#concept" className="hover:text-emerald-700 transition-colors">
              הקונספט
            </a>
            <a href="#whats-inside" className="hover:text-emerald-700 transition-colors">
              מה בחנות
            </a>
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">
              איך זה עובד
            </a>
            <a href="#trust" className="hover:text-emerald-700 transition-colors">
              טריות וביטחון
            </a>
            <a href="#roadmap" className="hover:text-emerald-700 transition-colors flex items-center gap-1 text-amber-700">
              <Rocket className="w-3.5 h-3.5" />
              <span>בקרוב אצלנו</span>
            </a>
            <a href="#faq" className="hover:text-emerald-700 transition-colors">
              שאלות נפוצות
            </a>
            <button
              onClick={onOpenCalculator}
              className="hover:text-emerald-700 transition-colors flex items-center gap-1 text-stone-700"
            >
              <span>🧮</span>
              <span>מחשבון אירוח</span>
            </button>
          </nav>

          {/* Action CTAs & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User auth shortcut */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2 bg-stone-100 px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'משתמש'}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {user.displayName ? user.displayName[0] : 'U'}
                  </div>
                )}
                <span className="font-medium text-stone-800 max-w-[80px] truncate">
                  {user.displayName || 'שלום'}
                </span>
                <button
                  onClick={logout}
                  className="text-stone-400 hover:text-rose-600 p-0.5"
                  title="התנתק"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                title="התחבר עם Google לשמירת הזמנות ומועדפים"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>התחברות</span>
              </button>
            )}

            {/* Primary Entrance CTA */}
            <button
              onClick={onEnterStore}
              className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>כניסה לחנות ההזמנות</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-900 text-white pt-10 pb-16 sm:pt-16 sm:pb-24">
        {/* Subtle background image overlay */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: `url(${fullShabbatTableImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/85 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left/Main Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-black">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>עבודת יד אותנטית • סירים שנפתחים לפי הזמנה בלבד</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                סלטי שבת ביתיים
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-lime-300 to-emerald-400">
                  בלי חומרים משמרים.
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-stone-300 leading-relaxed font-normal max-w-2xl">
                אנחנו לא מחזיקים מלאי שעומד במקרר. את הסלטים שלנו אנחנו מתחילים לבשל רק לאחר סגירת ההזמנות ביום שלישי בחצות.
                מטבוחה בבישול איטי של 5 שעות, חצילים קלויים על אש גלויה, שום קונפי נמס בפה, פחיות שתייה B.I בטעמים ומארזי אירוח עשירים שמגיעים ישר אליכם לקראת שבת.
              </p>

              {/* Quick value badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="bg-stone-800/80 backdrop-blur-md p-3 rounded-2xl border border-stone-700/60">
                  <div className="font-black text-amber-300 flex items-center gap-1.5">
                    <span>🍅</span>
                    <span>100% טבעי וטרי</span>
                  </div>
                  <div className="text-[11px] text-stone-300 mt-1">ללא חומרים משמרים</div>
                </div>

                <div className="bg-stone-800/80 backdrop-blur-md p-3 rounded-2xl border border-stone-700/60">
                  <div className="font-black text-lime-300 flex items-center gap-1.5">
                    <span>⏰</span>
                    <span>סגירה בשלישי</span>
                  </div>
                  <div className="text-[11px] text-stone-300 mt-1">בישול מרוכז לסופ״ש</div>
                </div>

                <div className="bg-stone-800/80 backdrop-blur-md p-3 rounded-2xl border border-stone-700/60">
                  <div className="font-black text-emerald-300 flex items-center gap-1.5">
                    <span>🚚</span>
                    <span>משלוח בנוף הגליל</span>
                  </div>
                  <div className="text-[11px] text-stone-300 mt-1">או איסוף עצמי בשישי</div>
                </div>

                <div className="bg-stone-800/80 backdrop-blur-md p-3 rounded-2xl border border-stone-700/60">
                  <div className="font-black text-blue-300 flex items-center gap-1.5">
                    <span>🥤</span>
                    <span>פחיות B.I בטעמים</span>
                  </div>
                  <div className="text-[11px] text-stone-300 mt-1">מחיר מדורג חסכוני</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={onEnterStore}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-600 hover:to-lime-600 text-stone-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all transform active:scale-95"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>כניסה לחנות והזמנות לשבת</span>
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={onOpenCalculator}
                  className="px-6 py-4 bg-stone-800/90 hover:bg-stone-700 text-amber-300 hover:text-amber-200 font-bold text-sm rounded-2xl border border-amber-400/30 flex items-center justify-center gap-2 transition-all"
                >
                  <span>🧮</span>
                  <span>מחשבון אירוח</span>
                </button>

                {onOpenPhoneOrder && (
                  <button
                    onClick={onOpenPhoneOrder}
                    className="px-5 py-4 bg-stone-800/90 hover:bg-stone-700 text-emerald-300 hover:text-emerald-200 font-bold text-sm rounded-2xl border border-emerald-500/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>מוקד טלפוני</span>
                  </button>
                )}
              </div>

              {/* Guest shopping reassurance */}
              <div className="flex items-center gap-2 text-stone-400 text-xs pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>הזמנה מיידית • תשלום מאובטח באשראי, Bit או מזומן • הנפקת קבלות דיגיטליות ישירות מהאתר</span>
              </div>
            </div>

            {/* Right Column: Visual Showcase Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-b from-stone-800/90 to-stone-900/90 p-5 sm:p-6 rounded-3xl border border-stone-700/80 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-700/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧺</span>
                    <div>
                      <div className="font-bold text-sm text-white">טעימה משולחן השבת</div>
                      <div className="text-[11px] text-stone-400">מוכנים לשישי בנוף הגליל</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                    טרי בכל שבוע
                  </span>
                </div>

                {/* Imagery grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative rounded-2xl overflow-hidden aspect-4/3 group">
                    <img
                      src={fullShabbatTableImage}
                      alt="שולחן סלטי שבת עשיר"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[11px] font-bold text-white">מארזי שישי עשירים</span>
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden aspect-4/3 group">
                    <img
                      src={biDrinkCansImage}
                      alt="פחיות שתייה קרה B.I"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[11px] font-bold text-white">פחיות B.I בטעמים</span>
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden aspect-4/3 group">
                    <img
                      src={garlicConfitImage}
                      alt="שום קונפי עשיר"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[11px] font-bold text-white">שום קונפי נמס בפה</span>
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden aspect-4/3 group">
                    <img
                      src={cabbageCarrotImage}
                      alt="סלט כרוב וגזר פריך"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-2.5">
                      <span className="text-[11px] font-bold text-white">סלטים פריכים טריים</span>
                    </div>
                  </div>
                </div>

                {/* Quick stats / Cutoff indicator */}
                <div className="pt-2 text-xs flex items-center justify-between text-stone-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>סגירת הזמנות: שלישי 23:59</span>
                  </div>
                  <button
                    onClick={onEnterStore}
                    className="text-amber-300 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>לתפריט המלא</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Concept Section */}
      <section id="concept" className="py-14 sm:py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              הקונספט של SALAD BOX
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              איך הכל עובד אצלנו?
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              שלושה עקרונות ברורים שמבטיחים שסלטי השבת שלכם יהיו הכי טריים, טעימים ואותנטיים שיש
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-stone-50 p-6 sm:p-8 rounded-3xl border border-stone-200 relative group hover:border-emerald-500 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center mb-5 shadow-xs">
                1
              </div>
              <h3 className="text-lg font-black text-stone-900 mb-2">
                אתם בוחרים ומזמינים עד שלישי
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                נכנסים לחנות הדיגיטלית, בוחרים סלטים בגדלים מותאמים (250g, 500g, 1kg), פחיות שתייה B.I בטעמים, או נעזרים במחשבון הכמויות שלנו.
              </p>
              <div className="mt-4 pt-4 border-t border-stone-200 text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>דדליין: יום שלישי בחצות</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-stone-50 p-6 sm:p-8 rounded-3xl border border-stone-200 relative group hover:border-emerald-500 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 font-black text-xl flex items-center justify-center mb-5 shadow-xs">
                2
              </div>
              <h3 className="text-lg font-black text-stone-900 mb-2">
                אנחנו פותחים סירים ומבשלים
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                סיר המטבוחה עולה על אש נמוכה ל-5 שעות, החצילים נקלים על אש גלויה, והירקות הטריים נקצצים לקראת יום שישי בבוקר. הכל טרי ובלי פשרות.
              </p>
              <div className="mt-4 pt-4 border-t border-stone-200 text-xs font-bold text-amber-700 flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5" />
                <span>בישול מרוכז לפי הזמנה בלבד</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-stone-50 p-6 sm:p-8 rounded-3xl border border-stone-200 relative group hover:border-emerald-500 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 font-black text-xl flex items-center justify-center mb-5 shadow-xs">
                3
              </div>
              <h3 className="text-lg font-black text-stone-900 mb-2">
                איסוף או משלוח קר עד הדלת
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                ביום שישי בבוקר אתם מקבלים את המארז ארוז בקפידה עם שילוח מבוקר או מגיעים לאיסוף מהיר בנוף הגליל, ישירות לשולחן השבת שלכם.
              </p>
              <div className="mt-4 pt-4 border-t border-stone-200 text-xs font-bold text-blue-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>מוכן להגשה חגיגית</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Inside the Store Section */}
      <section id="whats-inside" className="py-14 sm:py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              התפריט והשירותים שלנו
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              מה תמצאו בתוך חנות ההזמנות?
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              מגוון עשיר של מנות, שתייה, פתרונות אירוח והתאמה אישית מלאה
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Cooked & Fresh Salads */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-2xl flex items-center justify-center">
                🥗
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">
                  סלטי שבת ומעדנייה
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  מטבוחה מבושלת, חציל קלוי בטחינה, שום קונפי עשיר, סלט כרוב וגזר פריך, זיתים מתובלים ומטבלים פיקנטיים.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-700 pt-2 border-t border-stone-100 flex items-center justify-between">
                <span>3 גדלים: 250g • 500g • 1kg</span>
                <span className="text-stone-400">החל מ-₪26</span>
              </div>
            </div>

            {/* 2. Canned Drinks B.I */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-2xl flex items-center justify-center">
                🥤
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">
                  פחיות שתייה B.I בטעמים
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  פחיות שתייה מרעננות ומקוררות ב-4 טעמים (תפוח נענע, לימונדה, אפרסק, תות ליים) עם מחירון מדורג חסכוני.
                </p>
              </div>
              <div className="text-xs font-bold text-blue-700 pt-2 border-t border-stone-100 flex items-center justify-between">
                <span>בודדת • זוג • רביעייה • שישייה</span>
                <span className="text-stone-400">החל מ-₪14</span>
              </div>
            </div>

            {/* 3. Custom Salad Builder */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-2xl flex items-center justify-center">
                🥣
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">
                  מרכיב הסלט האישי (Salad Builder)
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  הרכבת קערת סלט בהתאמה אישית מלאה: בחירת בסיסים, ירקות, תוספות קראנץ', רטבים ורמת חריפות מותאמת.
                </p>
              </div>
              <div className="text-xs font-bold text-amber-700 pt-2 border-t border-stone-100 flex items-center justify-between">
                <span>התאמה מלאה של כל מרכיב</span>
                <span className="text-stone-400">₪42</span>
              </div>
            </div>

            {/* 4. Shabbat Packages */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-2xl flex items-center justify-center">
                🧺
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">
                  מארזי שבת וחיסכון
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  חבילות אירוח מוכנות המשלבות את כל סלטי הדגל והמטבלים הפופולריים ביותר במחיר מוזל ומשתלם.
                </p>
              </div>
              <div className="text-xs font-bold text-purple-700 pt-2 border-t border-stone-100 flex items-center justify-between">
                <span>מארז שישי • מארז אירוח</span>
                <span className="text-stone-400">חיסכון של עד ₪30</span>
              </div>
            </div>

            {/* 5. Quantity Calculator */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-lime-50 text-2xl flex items-center justify-center">
                🧮
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">
                  מחשבון כמויות חכם
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  כלי חינמי שמחשב לכם בדיוק כמה גרם וסוגי סלטים אתם צריכים לפי כמות הסועדים (מ-2 ועד 40 איש).
                </p>
              </div>
              <div className="text-xs font-bold text-lime-700 pt-2 border-t border-stone-100 flex items-center justify-between">
                <button onClick={onOpenCalculator} className="hover:underline">
                  פתח מחשבון עכשיו ←
                </button>
                <span className="text-stone-400">חינם באתר</span>
              </div>
            </div>

            {/* 6. Events & Celebrations */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-2xl flex items-center justify-center">
                🎉
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">
                  אירועים ושבתות חתן
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  מענה מרוכז לשבתות חתן, עליות לתורה, אזכרות, מפגשי חברים ואירוח משפחתי נרחב בכמויות נדיבות.
                </p>
              </div>
              <div className="text-xs font-bold text-rose-700 pt-2 border-t border-stone-100 flex items-center justify-between">
                <button onClick={onOpenEvents} className="hover:underline">
                  פנייה להצעת מחיר ←
                </button>
                <span className="text-stone-400">מותאם אישית</span>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={onEnterStore}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-600/20 inline-flex items-center gap-2 transition-all transform active:scale-95"
            >
              <span>לצפייה בכל התפריט והזמנה לחצו כאן</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works & User Journey Section */}
      <section id="how-it-works" className="py-14 sm:py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              מסלול ההזמנה שלכם
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              פשוט, מהיר ושקוף בכל צעד
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              ארבעה שלבים קלים מרגע הכניסה ועד שסלטי השבת הטריים מונחים על שולחנכם
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-black text-sm text-stone-900">גלישה חופשית ובחירה</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                בוחרים את הסלטים, המשקלים (250g, 500g, 1kg), פחיות B.I והמארזים. אין צורך ביצירת חשבון מראש.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-black text-sm text-stone-900">בחירת איסוף או משלוח</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                בוחרים בין איסוף עצמי חינם בסניף נוף הגליל לבין משלוח ברכב מקורר עד דלת הבית ברחבי העיר.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-black text-sm text-stone-900">הגדרת חלון זמן וברכה</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                בוחרים חלון שעות ביום שישי. שולחים כמתנה? אפשר לצרף כרטיס ברכה מודפס ללא עלות.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                4
              </div>
              <h4 className="font-black text-sm text-stone-900">אישור ומעקב בזמן אמת</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                ההזמנה נקלטת מיד במטבח. מקבלים מספר מעקב חי, ויכולים לעקוב אחרי כל שלב עד המסירה.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust, Privacy & Safety Section */}
      <section id="trust" className="py-14 sm:py-20 bg-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              אמינות, בטיחות וטריות
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              איך אנחנו שומרים על הטריות והפרטיות שלכם?
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              התחייבות אמיתית לאיכות קולינרית, שרשרת קירור והגנה מלאה על פרטי הלקוח
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-black text-base text-stone-900">הגנה על פרטיות והזמנה ללא ספאם</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                פרטי הטלפון והכתובת משמשים אך ורק לצורך תיאום משלוח הסלטים שלכם. אין העברת מידע לצדדים שלישיים ואין הודעות פרסומת טורדניות.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-black text-base text-stone-900">שרשרת קירור מבוקרת ביום שישי</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                כל המשלוחים נארזים באריזות אטומות ומבוקרות ומועברים ברכבי שילוח מקוררים עד הדלת, כך שהסלטים מגיעים בטמפרטורה מושלמת להגשה.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <h4 className="font-black text-base text-stone-900">התחייבות ל-0% חומרים משמרים</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                אנו מבשלים בשיטות מסורתיות בלבד עם שמן זית, ירקות טריים ותבלינים מובחרים, ללא שימורים, צבעי מאכל או חומרים משמרים תעשייתיים.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP SECTION: "בקרוב אצלנו - מה אנחנו מתכננים להוסיף" */}
      <section id="roadmap" className="py-14 sm:py-20 bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-300 text-xs font-black">
              <Rocket className="w-4 h-4" />
              <span>החזון והעתיד של SALAD BOX</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              מה אנחנו מתכננים להוסיף בקרוב?
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              אנחנו כל הזמן משפרים את חוויית ההזמנה, התפעול והאירוח. הנה הצצה לפיתוחים והשירותים שבדרך:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Roadmap 1 */}
            <div className="bg-stone-900/80 p-6 rounded-3xl border border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">💳</span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  בשלבי סליקה
                </span>
              </div>
              <h3 className="text-base font-black text-white">
                תשלום מהיר ב-Bit, Apple Pay ו-Google Pay
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                סגירת הזמנה בשתי שניות בלבד דרך אפליקציית ביט או באמצעות טביעת אצבע וזיהוי פנים באפל פיי, ללא צורך בהקלדת כרטיס אשראי.
              </p>
            </div>

            {/* Roadmap 2 */}
            <div className="bg-stone-900/80 p-6 rounded-3xl border border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">👑</span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  נאמנות ושימור
                </span>
              </div>
              <h3 className="text-base font-black text-white">
                מועדון לקוחות VIP ונקודות "מטבעות שבת"
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                צבירת 5% מכל הזמנה כמטבעות שבת למימוש חוזר בהזמנות הבאות, והטבות בלעדיות לקראת חגים וסופי שבוע.
              </p>
            </div>

            {/* Roadmap 3 */}
            <div className="bg-stone-900/80 p-6 rounded-3xl border border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🥖</span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/30">
                  שיתוף פעולה בוטיק
                </span>
              </div>
              <h3 className="text-base font-black text-white">
                חלות שבת טריות ומאפי בוטיק
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                שילוב חלות ויז׳ניץ קלועות, חלות כוסמין ומאפים טריים הנאפים בשישי לפנות בוקר לצד הסלטים בעגלת קניות אחת.
              </p>
            </div>

            {/* Roadmap 4 */}
            <div className="bg-stone-900/80 p-6 rounded-3xl border border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🚚</span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  הרחבת פריסה
                </span>
              </div>
              <h3 className="text-base font-black text-white">
                הרחבת אזורי חלוקה לכל עמק יזרעאל והגליל
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                פריסת קווי חלוקה נוספים לעפולה, מגדל העמק, יישובי העמק וסביבת הגליל התחתון עם רכבי קירור ייעודיים.
              </p>
            </div>

            {/* Roadmap 5 */}
            <div className="bg-stone-900/80 p-6 rounded-3xl border border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🎁</span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  מארזי מתנה
                </span>
              </div>
              <h3 className="text-base font-black text-white">
                משלוח מארזי שי ומתנות עם כרטיס ברכה מודפס
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                אפשרות לפנק יולדת, הורים או חברים במארז שבת חגיגי עם הקדשה אישית מודפסת ומעוצבת המצורפת ישירות למשלוח.
              </p>
            </div>

            {/* Roadmap 6 */}
            <div className="bg-stone-900/80 p-6 rounded-3xl border border-emerald-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">⏱️</span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  חוויית שילוח
                </span>
              </div>
              <h3 className="text-base font-black text-white">
                מעקב שליח חי וחלונות זמן מדויקים
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                מערכת מעקב מפה חיה עם התראה ב-SMS ובווטסאפ כשהשליח נמצא 10 דקות מכם, בלי צורך לחכות שעות בבית.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-14 sm:py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              מה אומרים הלקוחות שלנו
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              הטעם שמדבר בעד עצמו
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              מתוך מאות שולחנות שבת ואירוחים מוצלחים בנוף הגליל והסביבה
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-stone-50 p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                    "{t.text}"
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-200 text-xs font-bold text-stone-900">
                  {t.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-14 sm:py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              שאלות ותשובות
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              כל מה שחשוב לדעת לפני שמזמינים
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 sm:p-5 text-right flex items-center justify-between gap-4 font-black text-xs sm:text-sm text-stone-900 hover:text-emerald-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Massive CTA Banner */}
      <section className="py-14 sm:py-20 bg-gradient-to-r from-emerald-800 to-stone-950 text-white text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-400 text-stone-950 text-3xl mx-auto flex items-center justify-center shadow-lg font-black">
            🥗
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            מוכנים לשדרג את שולחן השבת שלכם?
          </h2>

          <p className="text-xs sm:text-base text-stone-300 leading-relaxed">
            היכנסו עכשיו לחנות, בחרו את הסלטים והטעמים האהובים עליכם, ואנחנו נדאג שביום שישי הכל יחכה לכם טרי, מבושל ומושלם.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onEnterStore}
              className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-base rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>התחילו הזמנה עכשיו לשבת הקרובה</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-8 px-4 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div>
            <span className="font-bold text-white">SALAD BOX</span> • חנות בוטיק לסלטי שבת ואירוח • נוף הגליל
          </div>
          <div>© {new Date().getFullYear()} כל הזכויות שמורות. טריות, מסורת וטעמים מהלב.</div>
        </div>
      </footer>
    </div>
  );
};
