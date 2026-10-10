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
  QrCode,
  Copy,
  Tag,
  Lock,
  Sparkles,
  Smartphone,
  ExternalLink,
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
  const { items, itemsTotal, deliveryType, setDeliveryType, deliveryFee, clearCart } =
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
  const [timeSlot, setTimeSlot] = useState('09:00 - 11:30');

  // Gift option
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Special kitchen notes
  const [specialNotes, setSpecialNotes] = useState('');

  // Step 4: Promo code / Coupon discount
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Step 5: Payment method: cash / bit / credit_card / phone
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');

  // Credit Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardIdNumber, setCardIdNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [installments, setInstallments] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Bit details
  const [bitTransactionRef, setBitTransactionRef] = useState('');
  const [copiedBitPhone, setCopiedBitPhone] = useState(false);
  const [bitConfirmedByCustomer, setBitConfirmedByCustomer] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate final amounts with discount
  const currentDeliveryFee = deliveryType === 'delivery' ? deliveryFee : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, itemsTotal + currentDeliveryFee - discountAmount);

  // Handle Coupon Application
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError(null);
    const cleaned = couponCodeInput.trim().toUpperCase();

    if (!cleaned) return;

    if (cleaned === 'SHABBAT10') {
      const discount = Math.round(itemsTotal * 0.1);
      setAppliedCoupon({
        code: 'SHABBAT10',
        discountAmount: discount,
        description: '10% הנחה על כל הסלטים והמארזים לשבת!',
      });
    } else if (cleaned === 'WELCOME15') {
      setAppliedCoupon({
        code: 'WELCOME15',
        discountAmount: 15,
        description: '₪15 מתנת הצטרפות להזמנה ראשונה!',
      });
    } else if (cleaned === 'FREESHIP') {
      if (deliveryType !== 'delivery') {
        setCouponError('קופון משלוח חינם תקף להזמנות משלוח בלבד');
        return;
      }
      setAppliedCoupon({
        code: 'FREESHIP',
        discountAmount: deliveryFee,
        description: 'משלוח חינם בנוף הגליל!',
      });
    } else if (cleaned === 'SALAD20') {
      if (itemsTotal < 150) {
        setCouponError('קופון SALAD20 תקף להזמנות מעל ₪150 (חסרים ₪' + (150 - itemsTotal) + ')');
        return;
      }
      const discount = Math.round(itemsTotal * 0.2);
      setAppliedCoupon({
        code: 'SALAD20',
        discountAmount: discount,
        description: '20% הנחה על הזמנה מעל ₪150!',
      });
    } else {
      setCouponError('קוד קופון לא תקין. נסו SHABBAT10 או WELCOME15');
    }
  };

  const handleCopyBitPhone = () => {
    navigator.clipboard.writeText('0528443990');
    setCopiedBitPhone(true);
    setTimeout(() => setCopiedBitPhone(false), 2000);
  };

  const handleFormatCardNumber = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  const handleFormatExpiry = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

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

    if (deliveryType === 'delivery') {
      if (!street.trim()) {
        setErrorMsg('נא להזין שם רחוב למשלוח בנוף הגליל');
        return;
      }
      if (!houseNumber.trim()) {
        setErrorMsg('נא להזין מספר בית');
        return;
      }
    }

    // Validate Credit Card if selected
    if (paymentMethod === 'credit_card') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 15) {
        setErrorMsg('נא להזין מספר כרטיס אשראי מלא (15-16 ספרות)');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMsg('נא להזין תוקף כרטיס אשראי בפורמט MM/YY');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg('נא להזין קוד CVV (3 ספרות בגב הכרטיס)');
        return;
      }
      if (cardIdNumber.length < 8) {
        setErrorMsg('נא להזין תעודת זהות של בעל הכרטיס');
        return;
      }
    }

    setIsSubmitting(true);
    setIsProcessingPayment(true);

    try {
      // Simulate real bank/gateway clearance delay for credit card
      if (paymentMethod === 'credit_card') {
        await new Promise((res) => setTimeout(res, 900));
      }

      // Generate approval codes and official receipt number
      const cleanCard = cardNumber.replace(/\s+/g, '');
      const last4 = cleanCard ? cleanCard.slice(-4) : '4242';
      const approvalCode =
        paymentMethod === 'credit_card'
          ? `APP-${Math.floor(100000 + Math.random() * 900000)}`
          : undefined;

      const receiptNumber = `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      // Determine initial payment status:
      // Credit card: 'paid' immediately upon gateway authorization
      // Bit with confirmation: 'paid'
      // Bit pending / Cash / Phone: 'pending' (paid on pickup or phone call)
      const initialPaymentStatus: PaymentStatus =
        paymentMethod === 'credit_card' || (paymentMethod === 'bit' && bitConfirmedByCustomer)
          ? 'paid'
          : 'pending';

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
        deliveryFee: currentDeliveryFee,
        itemsTotal,
        grandTotal,
        paymentMethod,
        paymentStatus: initialPaymentStatus,
        paymentConfirmedAt: initialPaymentStatus === 'paid' ? new Date().toISOString() : undefined,
        receiptNumber,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        creditCardLast4: paymentMethod === 'credit_card' ? last4 : undefined,
        approvalCode,
        bitTransactionRef: bitTransactionRef.trim() || (paymentMethod === 'bit' ? `BIT-${Date.now().toString().slice(-6)}` : undefined),
        installments: paymentMethod === 'credit_card' ? installments : undefined,
        timing,
        scheduledTime: timing === 'scheduled' ? scheduledTime : undefined,
        timeSlot,
        isGift,
        giftMessage: isGift ? giftMessage.trim() : undefined,
        specialNotes: specialNotes.trim() || undefined,
        items,
      };

      const created = await createOrder(orderPayload);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch {}

      clearCart();
      onOrderCompleted(created);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMsg(err?.message || 'חלה שגיאה ביצירת ההזמנה. נסו שוב.');
    } finally {
      setIsSubmitting(false);
      setIsProcessingPayment(false);
    }
  };

  const timeSlots = [
    { id: 'morning', label: '08:30 - 10:30 (מוקדם לשבת)' },
    { id: 'midday', label: '10:30 - 12:30 (חלון מרכזי)' },
    { id: 'afternoon', label: '12:30 - 14:30 (לפני כניסת שבת)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              🛍️
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">
                השלמת הזמנה • SALAD BOX
              </h2>
              <span className="text-xs text-stone-500 font-medium">
                איסוף עצמי או משלוח ישיר בנוף הגליל לקראת שבת
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-right">
          {/* Order Window Info Badge */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>הזמנות לשבת הקרובה פתוחות עד יום שלישי בחצות</span>
            </div>
            <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full">
              חלוקה ביום שישי
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
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
              <span>פרטי הלקוח</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  שם מלא *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="שם פרטי ומשפחה"
                    className="w-full pr-9 pl-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  טלפון נייד (לוואטסאפ ועדכונים) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="050-1234567"
                    className="w-full pr-9 pl-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none text-right"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  דוא"ל לקבלת חשבונית מס וקבלה דיגיטלית (אופציונלי)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full p-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Delivery or Pickup */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                2
              </span>
              <span>אופן קבלת ההזמנה</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-3.5 rounded-2xl border text-right transition-all ${
                  deliveryType === 'pickup'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs sm:text-sm text-stone-900">
                    🏪 איסוף הסלטים
                  </span>
                  <span className="text-[11px] font-black text-emerald-800">חינם</span>
                </div>
                <div className="text-[11px] text-stone-500">
                  {settings.address} (יום שישי 08:00 - 14:30)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`p-3.5 rounded-2xl border text-right transition-all ${
                  deliveryType === 'delivery'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs sm:text-sm text-stone-900">
                    🚚 משלוח עד הבית
                  </span>
                  <span className="text-[11px] font-black text-emerald-800">
                    {deliveryFee === 0 ? 'חינם!' : `₪${deliveryFee}`}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500">
                  בלעדי לתושבי <strong>נוף הגליל</strong>
                </div>
              </button>
            </div>

            {/* Address fields for delivery */}
            {deliveryType === 'delivery' ? (
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs text-stone-700">
                  <span className="font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>כתובת מדויקת למשלוח בנוף הגליל:</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                    עיר מורשית: נוף הגליל בלבד
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="שם רחוב *"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="מספר בית *"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="דירה"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="קומה"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <input
                  type="text"
                  placeholder="הנחיות לשליח (למשל: להשאיר ליד הדלת, קוד כניסה לבניין...)"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full p-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                />
              </div>
            ) : (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <p>
                  נקודת איסוף: <strong>{settings.address}</strong> (חלוקה מרוכזת ביום שישי).
                </p>
              </div>
            )}

            {/* Time Slot selection */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                חלון זמנים מועדף ביום שישי:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setTimeSlot(slot.label)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                      timeSlot === slot.label
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500 font-bold'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: Special notes & Gift message */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                3
              </span>
              <span>הערות וכרטיס ברכה לשבת</span>
            </div>

            {/* Gift option toggle */}
            <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/90 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="rounded text-emerald-600 accent-emerald-600 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1">
                  <span>🎁</span>
                  <span>זוהי מתנה לשבת! הוסיפו כרטיס ברכה מודפס ללא עלות</span>
                </span>
              </label>

              {isGift && (
                <div className="pt-2 border-t border-amber-200/60 animate-in fade-in">
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="כתבו כאן את הברכה שלכם (למשל: 'לסבא וסבתא האהובים, שבת שלום ומבורכת מהילדים והנכדים!')..."
                    rows={2}
                    className="w-full p-2.5 text-xs bg-white border border-amber-200 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <textarea
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="הערות מיוחדות לגבי ההזמנה, אריזה, רמת חריפות או סכו״ם..."
              rows={2}
              className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* STEP 4: Discount & Coupon Code */}
          <div className="space-y-2.5 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <Tag className="w-4 h-4 text-emerald-700" />
                <span>קוד קופון ומבצע</span>
              </div>
              <span className="text-[11px] text-stone-400">יש לכם קופון? הזינו וקבלו הנחה מיידית</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="הזינו קוד קופון (למשל: SHABBAT10)"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value)}
                className="flex-1 p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none font-bold uppercase tracking-wider"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                החל קופון
              </button>
            </div>

            {couponError && (
              <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
            )}

            {appliedCoupon && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold">קופון {appliedCoupon.code} הופעל! </span>
                  <span className="text-[11px]">{appliedCoupon.description}</span>
                </div>
                <span className="font-black text-emerald-800">-₪{appliedCoupon.discountAmount}</span>
              </div>
            )}
          </div>

          {/* STEP 5: Payment method */}
          <div className="space-y-3 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                  4
                </span>
                <span>אמצעי תשלום והנפקת קבלה</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>הנפקת חשבונית מס קבלה מיידית</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Credit Card */}
              <label
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'credit_card'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                      <span>כרטיס אשראי מאובטח</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded">
                        מומלץ • אישור מיידי
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      סליקה מאובטחת SSL 256-Bit • אפשרות פריסה לעד 3 תשלומים
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

              {/* Credit Card Detailed Form */}
              {paymentMethod === 'credit_card' && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 animate-in fade-in">
                  {/* Visual Credit Card Preview */}
                  <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-900 text-white shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-300">
                        <Lock className="w-3.5 h-3.5" />
                        <span>SECURE PAY • SALAD BOX</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-amber-300">CHIP</div>
                    </div>
                    <div className="text-base sm:text-lg font-mono tracking-widest text-center my-2 text-stone-200" dir="ltr">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="flex justify-between items-end text-[11px] text-stone-300 pt-2 border-t border-stone-700/60">
                      <div>
                        <div className="text-[9px] text-stone-400">שם בעל הכרטיס</div>
                        <div className="font-bold text-white uppercase">{cardHolderName || customerName || 'ISRAEL ISRAELI'}</div>
                      </div>
                      <div className="text-left" dir="ltr">
                        <div className="text-[9px] text-stone-400">בתוקף עד</div>
                        <div className="font-mono font-bold text-white">{cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Input Fields */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                        מספר כרטיס אשראי *
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === 'credit_card'}
                        value={cardNumber}
                        onChange={(e) => handleFormatCardNumber(e.target.value)}
                        placeholder="4580 0000 0000 0000"
                        className="w-full p-2.5 text-xs font-mono bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none text-left tracking-wider"
                        dir="ltr"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                          תוקף (MM/YY) *
                        </label>
                        <input
                          type="text"
                          required={paymentMethod === 'credit_card'}
                          value={cardExpiry}
                          onChange={(e) => handleFormatExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full p-2.5 text-xs font-mono bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none text-center"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                          קוד 3 ספרות (CVV) *
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          required={paymentMethod === 'credit_card'}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="•••"
                          className="w-full p-2.5 text-xs font-mono bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none text-center tracking-widest"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                          ת.ז. בעל הכרטיס *
                        </label>
                        <input
                          type="text"
                          maxLength={9}
                          required={paymentMethod === 'credit_card'}
                          value={cardIdNumber}
                          onChange={(e) => setCardIdNumber(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="9 ספרות ת.ז."
                          className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none text-left font-mono"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                          תשלומים
                        </label>
                        <select
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                          className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:border-emerald-600 focus:outline-none"
                        >
                          <option value={1}>תשלום 1 רגיל (₪{grandTotal.toFixed(0)})</option>
                          <option value={2}>2 תשלומים (₪{(grandTotal / 2).toFixed(0)} לתשלום)</option>
                          <option value={3}>3 תשלומים ללא ריבית (₪{(grandTotal / 3).toFixed(0)} לתשלום)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                    <span className="flex items-center gap-1 text-emerald-800 font-bold">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>תקן אבטחה PCI-DSS Level 1</span>
                    </span>
                    <span>קבלה תונפק אוטומטית</span>
                  </div>
                </div>
              )}

              {/* Option 2: Bit */}
              <label
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'bit'
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    📱
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      תשלום באפליקציית Bit
                    </div>
                    <div className="text-[11px] text-stone-500">
                      העברה מהירה למספר הסניף • סריקת QR או קישור ישיר
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bit'}
                  onChange={() => setPaymentMethod('bit')}
                  className="accent-blue-600 w-4 h-4"
                />
              </label>

              {/* Bit Detailed Flow */}
              {paymentMethod === 'bit' && (
                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3 animate-in fade-in text-xs text-blue-950">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-blue-200">
                    <div>
                      <span className="text-[11px] text-stone-500 block">מספר הטלפון להעברה ב-Bit:</span>
                      <span className="text-lg font-black text-blue-900 tracking-wider dir-ltr" dir="ltr">
                        052-844-3990
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyBitPhone}
                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedBitPhone ? 'הועתק!' : 'העתק מספר'}</span>
                      </button>

                      <a
                        href={`https://wa.me/972528443990?text=${encodeURIComponent(`שלום, אני מבצע תשלום ב-Bit על סך ₪${grandTotal.toFixed(0)} עבור הזמנת סלטים לשבת.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>פתח Bit</span>
                      </a>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-stone-700 block">
                      מספר אסמכתא או 4 ספרות של ההעברה ב-Bit (אופציונלי):
                    </label>
                    <input
                      type="text"
                      value={bitTransactionRef}
                      onChange={(e) => setBitTransactionRef(e.target.value)}
                      placeholder="למשל: 4910 או שם השולח ב-Bit"
                      className="w-full p-2.5 text-xs bg-white border border-blue-200 rounded-xl focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={bitConfirmedByCustomer}
                      onChange={(e) => setBitConfirmedByCustomer(e.target.checked)}
                      className="rounded text-blue-600 accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-stone-900">
                      העברתי את התשלום ב-Bit כעת (סמן לאישור מיידי והפקת קבלה)
                    </span>
                  </label>
                </div>
              )}

              {/* Option 3: Phone order */}
              <label
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'phone'
                    ? 'border-purple-600 bg-purple-50/80 shadow-xs ring-1 ring-purple-500'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                    📞
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      הזמנה טלפונית / תשלום מול נציג
                    </div>
                    <div className="text-[11px] text-stone-500">
                      נציג המוקד ייצור איתך קשר טלפוני לאישור וסגירת פרטי החיוב
                    </div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'phone'}
                  onChange={() => setPaymentMethod('phone')}
                  className="accent-purple-600 w-4 h-4"
                />
              </label>

              {/* Option 4: Cash */}
              <label
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-lg">
                    💵
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900">
                      תשלום במזומן בעת איסוף / מסירה
                    </div>
                    <div className="text-[11px] text-stone-500">
                      מסירת התשלום המדויק במעמד קבלת הסלטים הטריים
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
                    {it.selectedFlavor && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-md font-bold">
                        {it.selectedFlavor}
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
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>הנחת קופון ({appliedCoupon.code})</span>
                  <span>-₪{appliedCoupon.discountAmount}</span>
                </div>
              )}
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
                  <span>{isProcessingPayment ? 'מבצע סליקה ומפיק קבלה...' : 'יוצר הזמנה...'}</span>
                </div>
              ) : !orderWindow.isOpen ? (
                <span>מועד ההזמנות הסתיים למחזור זה</span>
              ) : (
                <>
                  <span>
                    {paymentMethod === 'credit_card'
                      ? 'שלם באשראי והנפק קבלה'
                      : paymentMethod === 'bit'
                      ? 'אשר תשלום ב-Bit'
                      : paymentMethod === 'phone'
                      ? 'שלח להזמנה טלפונית'
                      : 'אשר הזמנה במזומן'}
                  </span>
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
