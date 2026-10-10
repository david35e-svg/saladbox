import { Category, Product, SaladIngredient, StoreSettings } from '../types';
import fullShabbatTableImage from '../assets/images/full_shabbat_table_1791015934773.jpg';
import garlicConfitImage from '../assets/images/garlic_confit_bowl_1791015899983.jpg';
import cabbageCarrotImage from '../assets/images/cabbage_carrot_salad_1791015917799.jpg';
import biDrinkCansImage from '../assets/images/bi_drink_cans_1791015885068.jpg';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'shabbat-salads', name: 'סלטים לשישי־שבת', icon: '🥗', order: 1, isActive: true },
  { id: 'packages', name: 'מארזי שבת ואירוח', icon: '🧺', order: 2, isActive: true },
  { id: 'drinks', name: 'שתייה', icon: '🥤', order: 3, isActive: true },
  { id: 'hosting-events', name: 'אירוח ואירועים קטנים', icon: '🎉', order: 4, isActive: true },
  { id: 'shabbat-chatan', name: 'שבת חתן', icon: '🕯️', order: 5, isActive: true },
  { id: 'azkarot', name: 'אזכרות', icon: '🕯️', order: 6, isActive: true },
  { id: 'aliyah-latora', name: 'עלייה לתורה', icon: '📖', order: 7, isActive: true },
];

export const INITIAL_INGREDIENTS: SaladIngredient[] = [
  // Bases & Essentials
  { id: 'ing-tomato', name: 'עגבניות תמר מבושלות', category: 'base', price: 0, isAvailable: true, calories: 25, icon: '🍅' },
  { id: 'ing-eggplant', name: 'חציל קלוי על גחלים', category: 'base', price: 0, isAvailable: true, calories: 35, icon: '🍆' },
  { id: 'ing-peppers', name: 'פלפלים קלויים באש', category: 'base', price: 0, isAvailable: true, calories: 30, icon: '🫑' },
  { id: 'ing-potatoes', name: 'תפוחי אדמה מבושלים', category: 'base', price: 0, isAvailable: true, calories: 85, icon: '🥔' },
  { id: 'ing-beets', name: 'סלק אדום אפוי', category: 'base', price: 0, isAvailable: true, calories: 40, icon: '🍠' },
  { id: 'ing-carrots', name: 'גזר מבושל אל-דנטה', category: 'base', price: 0, isAvailable: true, calories: 30, icon: '🥕' },

  // Seasonings & Enhancements
  { id: 'ing-garlic-confit', name: 'שום קונפי ושום טרי', category: 'addon', price: 0, isAvailable: true, calories: 45, icon: '🧄' },
  { id: 'ing-chili', name: 'פלפל חריף ירוק קלוי', category: 'addon', price: 0, isAvailable: true, calories: 15, icon: '🌶️' },
  { id: 'ing-pickled-lemon', name: 'לימון כבוש ביתי', category: 'addon', price: 0, isAvailable: true, calories: 20, icon: '🍋' },
  { id: 'ing-kalamata', name: 'זיתי קלמטה מובחרים', category: 'addon', price: 3, isAvailable: true, calories: 60, icon: '🫒' },
  { id: 'ing-herbs', name: 'כוזברה ופטרוזיליה רעננה', category: 'addon', price: 0, isAvailable: true, calories: 10, icon: '🌿' },
  { id: 'ing-chickpeas', name: 'גרגרי חומוס מרוקאי', category: 'addon', price: 3, isAvailable: true, calories: 75, icon: '🧆' },
  { id: 'ing-mayo', name: 'מיונז איכותי מסורתי', category: 'dressing', price: 0, isAvailable: true, calories: 90, icon: '🥫' },
  { id: 'ing-tahini', name: 'טחינה שומשום מלא', category: 'dressing', price: 0, isAvailable: true, calories: 85, icon: '🫗' },
  { id: 'ing-olive-oil', name: 'שמן זית כתית טהור', category: 'dressing', price: 0, isAvailable: true, calories: 80, icon: '🫒' },
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Matbucha
  {
    id: 'prod-matbucha',
    name: 'מטבוחה ביתית אסלית (בישול איטי של 5 שעות)',
    description: 'עגבניות תמר מתוקות בבישול סמיך ומרוכז של 5 שעות, פלפלים חריפים, שיני שום שלמות, פפריקה מרוקאית בשמן זית עמוק. בדיוק כמו בבית.',
    price: 46, // 500g
    categoryId: 'shabbat-salads',
    image: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isPopular: true,
    isFeatured: true,
    calories: 140,
    hebrewTag: 'בישול איטי 5 שעות • שולחן שבת',
    sizes: {
      '250g': 26,
      '500g': 46,
      '1kg': 82,
    },
    defaultSize: '500g',
  },

  // 2. Fire-roasted Eggplant
  {
    id: 'prod-eggplant-fire',
    name: 'חציל בלדי על האש בשום ולימון',
    description: 'חצילים בשרניים קלויים על אש גלויה עם טעם מעושן עמוק, שום טרי כתוש, שמן זית כתית טהור, לימון סחוט ופטרוזיליה קצוצה דק.',
    price: 48,
    categoryId: 'shabbat-salads',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isPopular: true,
    isFeatured: true,
    calories: 95,
    hebrewTag: 'קלוי על גחלים • טעם מעושן',
    sizes: {
      '250g': 28,
      '500g': 48,
      '1kg': 85,
    },
    defaultSize: '500g',
  },

  // 3. Eggplant in Mayo
  {
    id: 'prod-eggplant-mayo',
    name: 'חציל במיונז הולנדי עשיר',
    description: 'קלאסיקה אהובה של שולחן שישי. בשר חציל קלוי בשרני ועדין במיונז איכותי, שום כתוש, פלפל לבן ומלח ים. מרקם עשיר ונימוח.',
    price: 46,
    categoryId: 'shabbat-salads',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isPopular: true,
    calories: 165,
    hebrewTag: 'קלאסיקת שישי • מרקם קטיפתי',
    sizes: {
      '250g': 26,
      '500g': 46,
      '1kg': 82,
    },
    defaultSize: '500g',
  },

  // 4. Roasted Peppers in garlic vinaigrette
  {
    id: 'prod-roasted-peppers',
    name: 'סלט פלפלים קלויים בתחמיץ שום ושמן זית',
    description: 'פלפלים אדומים וצהובים קלויים על אש גלויה וקלופים ביד, פרוסות שום דקות, חומץ בן יין, שמן זית מובחר ופטרוזיליה רעננה.',
    price: 45,
    categoryId: 'shabbat-salads',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isPopular: true,
    calories: 80,
    hebrewTag: 'פלפלים קלופים ביד • תחמיץ ביתי',
    sizes: {
      '250g': 26,
      '500g': 45,
      '1kg': 79,
    },
    defaultSize: '500g',
  },

  // 5. Spicy Moroccan Carrots
  {
    id: 'prod-moroccan-carrot',
    name: 'גזר מרוקאי חריף בלימון כבוש',
    description: 'פרוסות גזר מבושלות במידת אל-דנטה מדויקת עם לימונים כבושים בייצור ביתי, אריסה מרוקאית, שיני שום, כמון ופפריקה בשמן.',
    price: 42,
    categoryId: 'shabbat-salads',
    image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isSpicy: true,
    calories: 90,
    hebrewTag: 'אריסה ביתית • לימון כבוש',
    sizes: {
      '250g': 24,
      '500g': 42,
      '1kg': 75,
    },
    defaultSize: '500g',
  },

  // 6. Traditional Potato Salad (Olivier)
  {
    id: 'prod-potato-salad',
    name: 'סלט תפוחי אדמה וירקות במיונז (אוליבייה מסורתי)',
    description: 'קוביות תפוחי אדמה נימוחות, אפונה ירוקה עדינה, גזר מבושל, מלפפון חמוץ ביתי במלח, ביצים קשות ומיונז מעודן. חובה על שולחן שבת.',
    price: 44,
    categoryId: 'shabbat-salads',
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    calories: 175,
    hebrewTag: 'מתכון משפחתי מסורתי',
    sizes: {
      '250g': 25,
      '500g': 44,
      '1kg': 78,
    },
    defaultSize: '500g',
  },

  // 7. Green Tahini with herbs
  {
    id: 'prod-tahini-green',
    name: 'טחינה ירוקה עשירה עם עשבי גינה ושום',
    description: 'טחינה גולמית שומשום מלא טחונה באבני ריחיים, שפע פטרוזיליה קצוצה, שום טרי, מיץ לימון טבעי ושמן זית כתית. מרקם סמיך ועמוק.',
    price: 38,
    categoryId: 'shabbat-salads',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    calories: 160,
    hebrewTag: 'שומשום מלא • עשבי גינה',
    sizes: {
      '250g': 22,
      '500g': 38,
      '1kg': 68,
    },
    defaultSize: '500g',
  },

  // 8. Cooked Beets in cumin and apple cider
  {
    id: 'prod-beets',
    name: 'סלק אדום מבושל בכמון קלוי וסיידר תפוחים',
    description: 'סלק טרי אפוי ומבושל חתוך לקוביות, מתובל בחומץ סיידר תפוחים טבעי, שמן זית כתית, כמון קלוי ועלי סלרי רעננים.',
    price: 40,
    categoryId: 'shabbat-salads',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    calories: 70,
    hebrewTag: 'סלק טרי צלוי • תיבול מאוזן',
    sizes: {
      '250g': 24,
      '500g': 40,
      '1kg': 72,
    },
    defaultSize: '500g',
  },

  // 9. Cabbage and Carrot salad (matching user real image)
  {
    id: 'prod-cabbage-carrot',
    name: 'סלט כרוב וגזר ביתי פריך בתחמיץ לימון',
    description: 'רצועות דקות ופריכות של כרוב לבן מובחר וגזר מתוק ורענן, בתחמיץ לימון סחוט טבעי, שמן זית, מלח ים וקמצוץ פלפל שחור גרוס. פריך וממכר לשולחן שבת.',
    price: 38,
    categoryId: 'shabbat-salads',
    image: cabbageCarrotImage,
    isAvailable: true,
    isPopular: true,
    calories: 45,
    hebrewTag: 'קראנצ׳י ורענן • מתכון ביתי',
    sizes: {
      '250g': 22,
      '500g': 38,
      '1kg': 68,
    },
    defaultSize: '500g',
  },

  // 10. Whole Garlic Confit with Rosemary (matching user real image)
  {
    id: 'prod-garlic-confit',
    name: 'שום קונפי שלם בשמן זית כתית טהור ורוזמרין',
    description: 'שיני שום שלמות מתקתקות בנימוחות מושלמת, אפויות בבישול איטי בשמן זית כתית טהור עם ענף רוזמרין טרי, מלח ים וטימין. מעדן אמיתי על החלה בשולחן שישי.',
    price: 52,
    categoryId: 'shabbat-salads',
    image: garlicConfitImage,
    isAvailable: true,
    isPopular: true,
    calories: 140,
    hebrewTag: 'שום קונפי • שמן זית ורוזמרין',
    sizes: {
      '250g': 28,
      '500g': 52,
      '1kg': 92,
    },
    defaultSize: '500g',
  },

  // 10. Fried hot peppers with confit garlic
  {
    id: 'prod-spicy-chili-dip',
    name: 'פלפלים חריפים צרובים בשמן זית ושום קונפי',
    description: 'פלפלים חריפים ירוקים ואדומים צרובים בשמן זית עם שיני שום שלמות, מלח ים אטלנטי ולימון סחוט. לחובבי חריף אמיתי בשולחן השבת.',
    price: 42,
    categoryId: 'shabbat-salads',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isSpicy: true,
    calories: 95,
    hebrewTag: 'חריף אש • שום קונפי',
    sizes: {
      '250g': 24,
      '500g': 42,
      '1kg': 74,
    },
    defaultSize: '500g',
  },

  // 11. Artichoke & roasted cherry tomatoes
  {
    id: 'prod-artichoke-salad',
    name: 'סלט ארטישוק איטלקי ושרי בצלים',
    description: 'לבבות ארטישוק מובחרים, עגבניות שרי צלויות, זיתי קלמטה, בצלצלי פנינה ושמן זית עדין בניחוח עשבי תיבול.',
    price: 56,
    categoryId: 'hosting-events',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    isFeatured: true,
    calories: 110,
    hebrewTag: 'לבבות ארטישוק • אירוח מיוחד',
    sizes: {
      '250g': 32,
      '500g': 56,
      '1kg': 98,
    },
    defaultSize: '500g',
  },

  // 12. Spiced Moroccan Chickpeas
  {
    id: 'prod-chickpeas-salad',
    name: 'סלט גרגרי חומוס מרוקאי וכמון קלוי',
    description: 'גרגרי חומוס הדס רכים וחמים, כמון מרוקאי טחון טרי, פפריקה מעושנת, כוזברה רעננה, שום ושמן זית עמוק.',
    price: 42,
    categoryId: 'shabbat-salads',
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=800&q=80',
    isAvailable: true,
    calories: 140,
    hebrewTag: 'חומוס הדס • כמון קלוי',
    sizes: {
      '250g': 24,
      '500g': 42,
      '1kg': 75,
    },
    defaultSize: '500g',
  },

  // --- FESTIVE PACKAGES (מארזים חגיגיים) ---
  // 13. Shabbat Family Package (matching user real image with 16 bowls)
  {
    id: 'pkg-shabbat-family',
    name: 'מארז שולחן שישי עשיר ומפואר (16 קעריות סלטים ומטבלים)',
    description: 'שולחן שישי מלא ומפואר בדיוק כמו בתמונה! 16 קעריות עשירות של סלטים ביתיים מבושלים: מטבוחה 5 שעות, חומוס מרוקאי בשמן זית ופפריקה, שום קונפי ברוזמרין, סלט כרוב גזר פריך, סלסת עשבים חריפה, בצל מקורמל, חציל במיונז, חמוצי הבית ולימון כבוש.',
    price: 219,
    categoryId: 'packages',
    image: fullShabbatTableImage,
    isPackage: true,
    packageIncludesText: '16 קעריות סלטים ומטבלים ביתיים לשולחן שבת',
    isAvailable: true,
    isPopular: true,
    isFeatured: true,
    hebrewTag: 'השולחן המלא • 16 קעריות',
    sizes: {
      '250g': 139,
      '500g': 219,
      '1kg': 389,
    },
    defaultSize: '500g',
  },

  // 14. Small Hosting Package (6 salads)
  {
    id: 'pkg-hosting-small',
    name: 'מארז אירוח ביתי מושלם (6 סלטים)',
    description: 'אירוח משפחה או חברים בסוף השבוע? מארז של 6 סלטים ביתיים מגוונים לבחירה (500 גרם כ"א) שסוגרים לכם את כל שולחן האירוח בלי לעמוד דקה במטבח.',
    price: 229,
    categoryId: 'hosting-events',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isPackage: true,
    packageIncludesText: '6 סלטים מובחרים לאירוח (500 גרם כ״א)',
    isAvailable: true,
    isPopular: true,
    isFeatured: true,
    hebrewTag: 'אירוח ללא מאמץ',
    sizes: {
      '250g': 139,
      '500g': 229,
      '1kg': 389,
    },
    defaultSize: '500g',
  },

  // --- B.I CANNED DRINKS (פחיות שתייה B.I בטעמים - מחיר אחיד או מדורג) ---
  {
    id: 'prod-bi-drink',
    name: 'פחית שתייה קרה B.I (מבחר 4 טעמים • מחיר מדורג)',
    description: 'פחיות שתייה מרעננות ומקוררות מבית "B.I פיתות לאירועים" (052-5955104)! בחרו את הטעם האהוב עליכם: 🍏 תפוח עץ ירוק ונענע | 🍋 לימונדה קלאסית מרעננת | 🍓 תות שדה עשיר | 🫐 פירות יער ובלו ברי. תמחור מדורג משתלם: פחית בודדת ב-₪14, זוג ב-₪26, רביעייה ב-₪48 ושישייה ב-₪70!',
    price: 14,
    categoryId: 'drinks',
    image: biDrinkCansImage,
    isDrink: true,
    pricingModel: 'tiered',
    drinkFlavors: [
      'תפוח עץ ונענע 🍏',
      'לימונדה קלאסית 🍋',
      'תות שדה מרענן 🍓',
      'פירות יער ובלו ברי 🫐',
    ],
    drinkTiers: [
      { id: 'single', label: 'פחית בודדת (1 יח׳)', quantity: 1, price: 14 },
      { id: 'duo', label: 'זוג פחיות (2 יח׳)', quantity: 2, price: 26, badge: 'חיסכון ₪2' },
      { id: 'quad', label: 'רביעיית פחיות (4 יח׳)', quantity: 4, price: 48, badge: 'חיסכון ₪8' },
      { id: 'six', label: 'שישיית פחיות (6 יח׳)', quantity: 6, price: 70, badge: 'חיסכון ₪14' },
    ],
    isAvailable: true,
    isPopular: true,
    isFeatured: true,
    calories: 90,
    hebrewTag: 'מחיר מדורג • 4 טעמים לבחירה',
  },
  {
    id: 'prod-bi-lemonade-can',
    name: 'פחית B.I לימונדה קלאסית מרעננת (מחיר אחיד)',
    description: 'לימונדה סחוטה טבעית עם עלי נענע רעננים בקרח כתוש, מוגזת קלות וקרה כקרח. מושלמת לסעודת שבת. מחיר אחיד לפחית.',
    price: 14,
    categoryId: 'drinks',
    image: biDrinkCansImage,
    pricingModel: 'flat',
    isDrink: true,
    drinkFlavors: ['לימונדה קלאסית 🍋'],
    isAvailable: true,
    isPopular: true,
    calories: 85,
    hebrewTag: 'מחיר אחיד • ₪14',
  },
  {
    id: 'prod-bi-apple-can',
    name: 'פחית B.I תפוח עץ ירוק ונענע (מחיר אחיד)',
    description: 'סיידר תפוחי גרני סמית פריך ורענן עם עלי נענע בקרח, מוגש קר בפחית שקופה אטומה עם פתיחה קלה. מחיר אחיד לפחית.',
    price: 14,
    categoryId: 'drinks',
    image: biDrinkCansImage,
    pricingModel: 'flat',
    isDrink: true,
    drinkFlavors: ['תפוח עץ ונענע 🍏'],
    isAvailable: true,
    calories: 90,
    hebrewTag: 'מחיר אחיד • ₪14',
  },
  {
    id: 'pkg-bi-drinks-quad',
    name: 'מארז רביעיית פחיות B.I מיקס (כל 4 הטעמים)',
    description: 'מארז חגיגי של כל 4 הטעמים המרעננים מבית B.I: תפוח עץ ירוק ונענע, לימונדה קלאסית, תות שדה ופירות יער. מתאים בול לארוחת שישי ולאירוח!',
    price: 48,
    categoryId: 'drinks',
    image: biDrinkCansImage,
    pricingModel: 'flat',
    isPackage: true,
    isDrink: true,
    packageIncludesText: '4 פחיות שונות (תפוח נענע, לימונדה, תות ופירות יער)',
    isAvailable: true,
    isPopular: true,
    hebrewTag: 'מארז רביעייה • חיסכון',
  },

  // 15. Shabbat Chatan Package (Large 1kg quantities)
  {
    id: 'pkg-shabbat-chatan',
    name: 'מארז שבת חתן חגיגי (כמויות של 1 ק"ג)',
    description: 'מארז מורחב ומפואר לשבת חתן! מבחר של 6 סלטים ביתיים מובחרים בכמויות של 1 ק"ג כל אחד (סה"כ 6 ק"ג סלטים) — מוכן להגשה ישירה בשולחן הכבוד ובשולחנות האורחים.',
    price: 440,
    categoryId: 'shabbat-chatan',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    isPackage: true,
    packageIncludesText: '6 סלטים גדולים (1 ק״ג כ״א) — סה״כ 6 ק״ג',
    isAvailable: true,
    isFeatured: true,
    hebrewTag: 'לשבת חתן מפוארת',
    sizes: {
      '250g': 160,
      '500g': 260,
      '1kg': 440,
    },
    defaultSize: '1kg',
  },

  // 16. Aliyah Latora Package
  {
    id: 'pkg-aliyah',
    name: 'מארז עלייה לתורה וקידוש בית כנסת',
    description: 'מגש אירוח עשיר ומכובד לסעודת עלייה לתורה בבית הכנסת או בבית — מבחר סלטים מבושלים, חמוצים ביתיים, טחינה עשירה ומטבלים ארוזים בכלים נוחים לחלוקה.',
    price: 320,
    categoryId: 'aliyah-latora',
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
    isPackage: true,
    packageIncludesText: 'מגש סלטים ומטבלים לקידוש ולסעודה',
    isAvailable: true,
    hebrewTag: 'לסעודת מצווה וקידוש',
    sizes: {
      '250g': 180,
      '500g': 320,
      '1kg': 540,
    },
    defaultSize: '500g',
  },

  // 17. Memorial / Azkarot Package
  {
    id: 'pkg-azkara',
    name: 'מארז סלטים מכובד לאזכרות וסעודת מצווה',
    description: 'מבחר מכובד וצנוע של סלטים ביתיים מבושלים, תפוחי אדמה, סלק וטחינה עבור סעודת אזכרה ומפגש משפחתי, ארוזים בקפידה ובכשרות מוקפדת.',
    price: 290,
    categoryId: 'azkarot',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    isPackage: true,
    packageIncludesText: 'סלטים מכובדים לסעודת אזכרה (15-20 איש)',
    isAvailable: true,
    hebrewTag: 'לסעודת אזכרה ומצווה',
    sizes: {
      '250g': 160,
      '500g': 290,
      '1kg': 490,
    },
    defaultSize: '500g',
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  id: 'business_config',
  storeName: 'SALAD SHOP — בוטיק סלטים ביתיים',
  phone: '04-655-1234',
  address: 'מרכז מסחרי דוד, נוף הגליל',
  isOpen: true,
  openingHoursText: 'הזמנות לשישי-שבת מתקבלות עד יום שלישי בחצות | איסוף ומשלוח בנוף הגליל',
  minOrderAmount: 40,
  freeDeliveryThreshold: 140,
  baseDeliveryFee: 15,
  estimatedDeliveryMinutes: 40,
  estimatedPickupMinutes: 15,
  allowedDeliveryCity: 'נוף הגליל',
  orderCutoffDay: 2, // Tuesday (יום שלישי)
  orderCutoffTime: '23:59',
  deliveryZones: [
    {
      id: 'nof-hagalil',
      name: 'נוף הגליל',
      cities: ['נוף הגליל'],
      fee: 15,
      minOrder: 40,
    },
  ],
};

export { fullShabbatTableImage, garlicConfitImage, cabbageCarrotImage, biDrinkCansImage };

