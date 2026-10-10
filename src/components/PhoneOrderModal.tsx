import React, { useState } from 'react';
import {
  Phone,
  X,
  MessageCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Send,
  ShoppingBag,
  HelpCircle,
  User,
  MapPin,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';

interface PhoneOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToStore?: () => void;
}

export const PhoneOrderModal: React.FC<PhoneOrderModalProps> = ({
  isOpen,
  onClose,
  onGoToStore,
}) => {
  const { settings } = useStore();
  const { items, itemsTotal, grandTotal, deliveryType } = useCart();

  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('בהקדם האפשרי (תוך 15 דקות)');
  const [notes, setNotes] = useState('');
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);

  if (!isOpen) return null;

  const phoneHotline = settings.phone || '052-844-3990';
  const cleanPhone = phoneHotline.replace(/[^0-9]/g, '');

  const handleCallNow = () => {
    window.location.href = `tel:${phoneHotline}`;
  };

  const handleSendCartWhatsApp = () => {
    let message = `שלום למוקד ההזמנות של SALAD BOX! 🥗\nאשמח לבצע הזמנה טלפונית של הסל שלי:\n\n`;

    if (items.length > 0) {
      items.forEach((item, idx) => {
        const sizeOrFlavor = item.selectedSizeLabel || item.selectedFlavor || (item.selectedTier ? item.selectedTier.label : '');
        message += `${idx + 1}. ${item.quantity}× ${item.name} ${sizeOrFlavor ? `(${sizeOrFlavor})` : ''} - ₪${(item.unitPrice * item.quantity).toFixed(0)}\n`;
      });
      message += `\nאופן קבלה: ${deliveryType === 'delivery' ? 'משלוח בנוף הגליל' : 'איסוף עצמי מהסניף'}\n`;
      message += `סה"כ משוער לתשלום: ₪${grandTotal.toFixed(0)}\n\n`;
    } else {
      message += `היי, אני מעוניין להרכיב הזמנת סלטים לשבת בעזרת נציג טלפוני.\n`;
    }

    message += `אשמח שנציג יחזור אליי או יאשר את ההזמנה! תודה.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/972${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleSubmitCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackName.trim() || !callbackPhone.trim()) return;

    // Simulate callback recorded successfully
    setCallbackSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-lime-700 text-white p-5 sm:p-6 text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-white mb-2.5 shadow-inner">
            <Phone className="w-7 h-7 animate-pulse" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            מוקד הזמנות טלפוני אישי
          </h3>
          <p className="text-emerald-100 text-xs mt-1 max-w-sm mx-auto">
            מעדיפים להזמין בשיחה אישית? נציג שירות ומטבח ישמח להרכיב עבורכם את המארז המושלם לשבת
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-right flex-1">
          {/* Direct Dial Banner */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/90 text-center space-y-3">
            <span className="text-xs text-emerald-800 font-bold block">
              חיוג ישיר לנציג שירות והזמנות:
            </span>

            <div className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-wider dir-ltr" dir="ltr">
              {phoneHotline}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                onClick={handleCallNow}
                className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>חייג עכשיו מטלפון זה</span>
              </button>

              <button
                onClick={handleSendCartWhatsApp}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {items.length > 0 ? `שלח סל (${items.length} פריטים) בוואטסאפ` : 'פתח שיחת וואטסאפ עם נציג'}
                </span>
              </button>
            </div>
          </div>

          {/* Cart preview if cart has items */}
          {items.length > 0 && (
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-stone-800">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>סל הקניות הנוכחי שלך ({items.length} פריטים):</span>
                </span>
                <span className="text-emerald-800 font-black">₪{grandTotal.toFixed(0)}</span>
              </div>
              <p className="text-[11px] text-stone-500">
                הסל יישמר ויועבר לנציג הטלפוני כך שלא תצטרכו להקריא מחדש כל פריט וטעם.
              </p>
            </div>
          )}

          {/* Operating hours */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>שעות פעילות מוקד ההזמנות הטלפוני:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
              <div className="p-2 bg-white rounded-xl border border-stone-200/70">
                <span className="font-bold text-stone-900 block">ימים א' - ה':</span>
                <span>08:30 עד 21:00</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-stone-200/70">
                <span className="font-bold text-stone-900 block">יום שישי:</span>
                <span>07:30 עד 14:30 (מוקד חירום)</span>
              </div>
            </div>
          </div>

          {/* Request Callback Section */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>רוצים שנחזור אליכם טלפונית?</span>
            </div>

            {callbackSubmitted ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1.5 animate-in fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-emerald-900 text-sm">הפניה התקבלה בהצלחה!</h4>
                <p className="text-xs text-emerald-800">
                  נציג מוקד SALAD BOX יחזור אל <strong>{callbackPhone}</strong> {preferredTime}.
                </p>
                <button
                  onClick={() => setCallbackSubmitted(false)}
                  className="mt-2 text-xs text-emerald-700 underline font-semibold"
                >
                  הגש בקשה נוספת
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitCallback} className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="שם מלא *"
                    value={callbackName}
                    onChange={(e) => setCallbackName(e.target.value)}
                    className="p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="מספר טלפון לחזרה *"
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    className="p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none text-right"
                    dir="ltr"
                  />
                </div>

                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                >
                  <option value="בהקדם האפשרי (תוך 15 דקות)">חזרו אליי בהקדם האפשרי (תוך 15 דקות)</option>
                  <option value="בשעות הצהריים (12:00 - 15:00)">בשעות הצהריים (12:00 - 15:00)</option>
                  <option value="בשעות הערב (18:00 - 21:00)">בשעות הערב (18:00 - 21:00)</option>
                  <option value="ביום שישי בבוקר">ביום שישי בבוקר לפני חלוקה</option>
                </select>

                <textarea
                  rows={2}
                  placeholder="הערות או בקשות מיוחדות לנציג (אופציונלי)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>שמור בקשה ונציג יחזור אליי</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>SALAD BOX • שדרות מעלה יצחק 24, נוף הגליל</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 rounded-xl font-semibold border border-stone-200 transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
