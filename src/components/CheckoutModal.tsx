import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  User,
  X,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { DeliveryType, Order, PaymentMethod, PaymentStatus } from '../types';
import { checkOrderWindow } from '../utils/orderCutoff';

interface CheckoutModalProps {
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  onClose,
  onOrderCompleted,
}) => {
  const { user, profile } = useAuth();
  const { items, itemsTotal, deliveryType, setDeliveryType, deliveryFee, grandTotal, clearCart } =
    useCart();
  const { settings, createOrder } = useStore();

  // Check order deadline window
  const orderWindow = checkOrderWindow(settings);

  // Step 1: Customer details
  const [customerName, setCustomerName] = useState(
    profile?.displayName || user?.displayName || ''
  );
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Step 2: Delivery address (Restricted to Nof HaGalil)
  const [city, setCity] = useState('נוף הגליל');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [apartment, setApartment] = useState('');
  const [floor, setFloor] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Step 3: Timing
  const [timing, setTiming] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledTime, setScheduledTime] = useState('13:30');

  // Step 4: Special kitchen notes
  const [specialNotes, setSpecialNotes] = useState('');

  // Step 5: Payment method: cash / bit / credit_card
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Check weekly deadline
    if (!orderWindow.isOpen) {
      setErrorMsg('מועד ההזמנות למחזור הנוכחי הסתיים. ניתן להזמין למחזור הבא.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('נא להזין שם לקוח מלא');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setErrorMsg('נא להזין מספר טלפון תקין ליצירת קשר');
      return;
    }

    // Nof HaGalil strict enforcement
    if (deliveryType === 'delivery') {
      const normalizedCity = city.trim();
      if (normalizedCity !== 'נוף הגליל') {
        setErrorMsg('כרגע אנחנו מבצעים משלוחים בנוף הגליל בלבד.');
        return;
      }
      if (!street.trim()) {
        setErrorMsg('נא להזין שם רחוב למשלוח בנוף הגליל');
        return;
      }
      if (!houseNumber.trim()) {
        setErrorMsg('נא להזין מספר בית');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Payment status determination:
      // Cash & Bit start as 'pending' (ממתין לתשלום), admin manually confirms when money is received!
      // Credit card starts as 'pending' (ready for gateway webhook confirmation).
      const initialPaymentStatus: PaymentStatus = 'pending';

      const orderPayload = {
        userId: user ? user.uid : 'guest',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        deliveryType,
        deliveryAddress:
          deliveryType === 'delivery'
            ? {
                city: 'נוף הגליל',
                street: street.trim(),
                houseNumber: houseNumber.trim(),
                apartment: apartment.trim() || undefined,
                floor: floor.trim() || undefined,
                notes: deliveryNotes.trim() || undefined,
              }
            : undefined,
        deliveryFee,
        itemsTotal,
        grandTotal,
        paymentMethod,
        paymentStatus: initialPaymentStatus,
        timing,
        scheduledTime: timing === 'scheduled' ? scheduledTime : undefined,
        specialNotes: specialNotes.trim() || undefined,
        items,
      };

      const created = await createOrder(orderPayload);

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      clearCart();
      onOrderCompleted(created);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMsg('אירעה שגיאה בביצוע ההזמנה. אנא נסה שוב או צור קשר בטלפון.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white sm:rounded-3xl shadow-2xl flex flex-col h-full sm:h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-stone-900 leading-tight">
              ביצוע הזמנה וקופה — SALAD BOX
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              השלם את הפרטים לקבלת הסלטים הטריים שלך
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Order Window Cutoff Banner */}
          {!orderWindow.isOpen ? (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-black text-sm">
                  מועד ההזמנות למחזור הנוכחי הסתיים. ניתן להזמין למחזור הבא.
                </div>
                <div className="text-xs text-rose-700">
                  ההזמנות לסלטים נסגרות בכל שבוע ביום שלישי ב-23:59.
                  המועד הבא לפתיחת הזמנות ומסירה יחול ב-{orderWindow.nextCutoffDateFormatted}.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{orderWindow.message}</span>
              </span>
              <span className="text-[11px] text-emerald-700 hidden sm:inline">
                מועד חלוקה/איסוף: יום שישי הקרוב
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-bold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Customer Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                1
              </span>
              <span>פרטי לקוח</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  שם מלא *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="ישראל ישראלי"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  מספר טלפון *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="050-1234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none text-right"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  אימייל (לקבלת אישור ועדכוני סטטוס - אופציונלי)
                </label>
                <input
                  type="email"
                  dir="ltr"
                  placeholder="your-email@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none text-right"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Delivery Type & Address */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                2
              </span>
              <span>אופן קבלה: איסוף הסלטים או משלוח</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`py-3 px-4 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                  deliveryType === 'pickup'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className="text-2xl">🏪</span>
                <div>
                  <div className="font-bold text-xs sm:text-sm">איסוף הסלטים</div>
                  <div className="text-[11px] text-stone-500">איסוף מהסניף (חינם)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`py-3 px-4 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                  deliveryType === 'delivery'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <span className="text-2xl">🚚</span>
                <div>
                  <div className="font-bold text-xs sm:text-sm">משלוח עד הדלת</div>
                  <div className="text-[11px] text-stone-500">נוף הגליל בלבד (₪{deliveryFee})</div>
                </div>
              </button>
            </div>

            {deliveryType === 'delivery' ? (
              <div className="space-y-2.5 pt-2">
                {/* Nof HaGalil Region Notice */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    אזור ההפצה שלנו הוא <strong>נוף הגליל בלבד</strong>. משלוחים מתבצעים לכל השכונות בעיר.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      עיר (נוף הגליל בלבד) *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="נוף הגליל"
                      className={`w-full px-3 py-2 text-xs rounded-xl focus:outline-none font-bold transition-all ${
                        city.trim() && city.trim() !== 'נוף הגליל'
                          ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:border-rose-600'
                          : 'bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-600'
                      }`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      רחוב בנוף הגליל *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="לדוגמה: שדרות מעלה יצחק"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {city.trim() && city.trim() !== 'נוף הגליל' && (
                  <div className="p-3 bg-rose-50 border-2 border-rose-400 rounded-xl text-rose-900 text-xs font-bold flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>כרגע אנחנו מבצעים משלוחים בנוף הגליל בלבד.</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      מספר בית *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="15"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">דירה</label>
                    <input
                      type="text"
                      placeholder="4"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">קומה</label>
                    <input
                      type="text"
                      placeholder="2"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    הערות והנחיות לשליח בנוף הגליל
                  </label>
                  <input
                    type="text"
                    placeholder="אינטרקום, כניסה, להשאיר ליד הדלת..."
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-stone-700 space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>איסוף הסלטים מהסניף בנוף הגליל:</span>
                </div>
                <p className="text-stone-800 font-semibold">{settings.address}</p>
                <p className="text-stone-500 text-[11px]">
                  בעת איסוף הסלטים תוכל לשלם במזומן או ב-Bit.
                </p>
              </div>
            )}
          </div>

          {/* STEP 3: Special notes */}
          <div className="space-y-2 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                3
              </span>
              <span>הערות להזמנה</span>
            </div>
            <textarea
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="הערות מיוחדות לגבי ההזמנה, אריזה או סכו״ם..."
              rows={2}
              className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* STEP 4: Payment method */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                4
              </span>
              <span>אמצעי תשלום</span>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Cash */}
              <label
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💵</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      תשלום במזומן בעת איסוף הסלטים
                    </div>
                    <div className="text-[11px] text-stone-500">
                      סטטוס: <strong>ממתין לתשלום</strong> (התשלום יימסר באיסוף או לשליח)
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="accent-emerald-600 w-4 h-4"
                />
              </label>

              {/* Option 2: Bit */}
              <label
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'bit'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      תשלום ב-Bit בעת איסוף הסלטים
                    </div>
                    <div className="text-[11px] text-stone-500">
                      סטטוס: <strong>ממתין לתשלום</strong> (התשלום יאושר ידנית ע"י מנהל לאחר קבלתו)
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bit'}
                  onChange={() => setPaymentMethod('bit')}
                  className="accent-emerald-600 w-4 h-4"
                />
              </label>

              {/* Option 3: Credit Card Online */}
              <label
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      תשלום באשראי באתר
                    </div>
                    <div className="text-[11px] text-stone-500">
                      מוכן לחיבור שער סליקה אמיתי • ללא חיוב דמה מזויף
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'credit_card'}
                  onChange={() => setPaymentMethod('credit_card')}
                  className="accent-emerald-600 w-4 h-4"
                />
              </label>

              {paymentMethod === 'credit_card' && (
                <div className="p-3 bg-amber-50/90 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1 animate-in fade-in">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>הודעת מערכת: תשלום באשראי</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    המערכת מוכנה לחיבור ספק סליקה מאושר. בהתאם לנהלי העסק, לא מבוצע חיוב כרטיס מזויף. ההזמנה תישמר בסטטוס <strong>ממתין לתשלום</strong>, ומנהל הסניף ייצור עמך קשר להסדרת התשלום או שתוכל לשלם באיסוף/במסירה.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Items Summary preview */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
            <div className="font-bold text-stone-900">
              פירוט סלטים ומוצרים ({items.length} פריטים):
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-stone-700">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900">{it.quantity}×</span>
                    <span>{it.name}</span>
                    {it.selectedSizeLabel && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">
                        {it.selectedSizeLabel}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-stone-900">
                    ₪{(it.unitPrice * it.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-200 space-y-1">
              <div className="flex justify-between text-stone-600">
                <span>סכום סלטים</span>
                <span>₪{itemsTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>משלוח (נוף הגליל)</span>
                <span>
                  {deliveryType === 'pickup'
                    ? 'איסוף הסלטים (חינם)'
                    : deliveryFee === 0
                    ? 'חינם'
                    : `₪${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-stone-900 pt-1 border-t border-stone-200">
                <span>סה"כ לתשלום</span>
                <span className="text-emerald-800 text-lg">₪{grandTotal.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !orderWindow.isOpen}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 disabled:opacity-50 text-white rounded-2xl font-black text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>יוצר הזמנה...</span>
                </div>
              ) : !orderWindow.isOpen ? (
                <span>מועד ההזמנות הסתיים למחזור זה</span>
              ) : (
                <>
                  <span>אשר ובצע הזמנה</span>
                  <span>•</span>
                  <span>₪{grandTotal.toFixed(0)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
