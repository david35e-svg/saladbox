import React from 'react';
import { CheckCircle2, Clock, MapPin, Phone, Share2, X, ChevronRight, CreditCard, DollarSign } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useStore } from '../context/StoreContext';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
  onViewAllOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewAllOrders,
}) => {
  const { settings } = useStore();

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return { label: 'ההזמנה התקבלה במטבח', color: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' };
      case 'in_review':
        return { label: 'בהדפסה ובטיפול', color: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-500' };
      case 'preparing':
        return { label: 'קוצצים ומכינים את הסלטים', color: 'bg-orange-100 text-orange-800 border-orange-300', dot: 'bg-orange-500' };
      case 'on_the_way':
        return { label: 'השליח יצא לדרך אליך', color: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500' };
      case 'completed':
        return { label: 'ההזמנה נמסרה בהצלחה', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' };
      case 'cancelled':
        return { label: 'ההזמנה בוטלה', color: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' };
      default:
        return { label: 'התקבלה', color: 'bg-stone-100 text-stone-800 border-stone-300', dot: 'bg-stone-500' };
    }
  };

  const statusBadge = getStatusBadge(order.status);

  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'received', label: 'התקבלה' },
    { key: 'preparing', label: 'בהכנה' },
    { key: 'on_the_way', label: 'בדרך' },
    { key: 'completed', label: 'נמסרה' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `הזמנתי עכשיו סלטים טריים מ-SALAD BOX נוף הגליל! מספר הזמנה ${order.orderNumber} על סך ₪${order.grandTotal.toFixed(0)}.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const paymentMethodLabel =
    order.paymentMethod === 'cash'
      ? 'מזומן'
      : order.paymentMethod === 'bit'
      ? 'Bit'
      : 'אשראי באתר';

  const isCashOrBit = order.paymentMethod === 'cash' || order.paymentMethod === 'bit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-lime-700 text-white p-6 text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner">
            🎉
          </div>
          <h2 className="text-2xl font-black tracking-tight">ההזמנה שלך התקבלה בהצלחה!</h2>
          <p className="text-emerald-100 text-xs mt-1">
            הסלטים הטריים שלך ייקצצו ויוכנו לקראת מועד החלוקה והאיסוף
          </p>

          <div className="mt-3 inline-block bg-white text-stone-900 font-black text-sm px-4 py-1.5 rounded-full shadow-md tracking-wider">
            מספר הזמנה: {order.orderNumber}
          </div>
        </div>

        {/* Scrollable details */}
        <div className="p-5 overflow-y-auto space-y-4 text-right flex-1">
          {/* Payment Instructions Notice according to prompt */}
          <div
            className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
              isCashOrBit
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-sm">
                <span>{order.paymentMethod === 'cash' ? '💵' : order.paymentMethod === 'bit' ? '📱' : '💳'}</span>
                <span>אמצעי תשלום: {paymentMethodLabel}</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md font-extrabold bg-white border border-current">
                {order.paymentStatus === 'paid' ? 'שולם' : 'ממתין לתשלום'}
              </span>
            </div>

            <div className="text-xs font-semibold pt-1">
              {isCashOrBit ? (
                <span>📍 התשלום יתבצע בעת איסוף הסלטים (או מסירת המשלוח בנוף הגליל).</span>
              ) : (
                <span>✅ התשלום התקבל בהצלחה.</span>
              )}
            </div>
          </div>

          {/* Status Tracker */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">סטטוס הזמנה עדכני:</span>
              <span
                className={`text-xs font-black px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusBadge.color}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusBadge.dot} animate-pulse`}></span>
                {statusBadge.label}
              </span>
            </div>

            {/* Stepper progress dots */}
            <div className="flex items-center justify-between pt-2 px-2 relative">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-stone-200 -translate-y-1/2 -z-0"></div>
              {steps.map((st, idx) => {
                const isPassed = idx <= activeIndex;
                return (
                  <div key={st.key} className="flex flex-col items-center gap-1 relative z-10">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                        isPassed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-stone-300 text-stone-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-[10px] font-medium text-stone-600">{st.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Time info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>מועד אספקה:</span>
              </span>
              <span className="font-bold text-stone-900 text-xs sm:text-sm">
                {order.timing === 'scheduled'
                  ? `היום בשעה ${order.scheduledTime}`
                  : 'ביום החלוקה השבועי'}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-stone-400 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>אופן קבלה:</span>
              </span>
              <span className="font-bold text-stone-900 text-xs sm:text-sm">
                {order.deliveryType === 'delivery' ? 'משלוח בנוף הגליל' : 'איסוף הסלטים מהסניף'}
              </span>
            </div>
          </div>

          {/* Address info */}
          {order.deliveryAddress ? (
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
              <span className="text-stone-400 font-semibold block">כתובת למשלוח בנוף הגליל:</span>
              <div className="font-bold text-stone-900">
                {order.deliveryAddress.street} {order.deliveryAddress.houseNumber}
                {order.deliveryAddress.apartment && `, דירה ${order.deliveryAddress.apartment}`}
                {order.deliveryAddress.floor && `, קומה ${order.deliveryAddress.floor}`},{' '}
                {order.deliveryAddress.city}
              </div>
              {order.deliveryAddress.notes && (
                <div className="text-stone-500 text-[11px] pt-1">
                  הערה: {order.deliveryAddress.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
              <span className="text-stone-400 font-semibold block">איסוף הסלטים:</span>
              <div className="font-bold text-stone-900">{settings.address}</div>
              <div className="text-stone-500 text-[11px]">{settings.openingHoursText}</div>
            </div>
          )}

          {/* Ordered Salads with Size Breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-700 block">הסלטים שהוזמנו והגדלים:</span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-stone-900">
                        {item.quantity}× {item.name}
                      </span>
                      {item.selectedSizeLabel && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-black">
                          {item.selectedSizeLabel}
                        </span>
                      )}
                    </div>
                    {item.customSummaryText && (
                      <div className="text-[10px] text-stone-500 line-clamp-2">
                        {item.customSummaryText.slice(0, 3).join(' • ')}
                      </div>
                    )}
                  </div>
                  <div className="font-black text-stone-900 shrink-0">
                    ₪{(item.unitPrice * item.quantity).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grand total */}
          <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-stone-900">
            <span>סה"כ לתשלום:</span>
            <span className="text-xl text-emerald-800 font-black">
              ₪{order.grandTotal.toFixed(0)}
            </span>
          </div>

          {/* Contact and share actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>שתף בוואטסאפ</span>
            </button>
            <a
              href={`tel:${settings.phone}`}
              className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold border border-stone-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>חיוג למוקד</span>
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              onViewAllOrders();
            }}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors text-center"
          >
            צפה בהזמנות שלי
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-white hover:bg-stone-100 text-stone-700 rounded-xl font-semibold text-xs border border-stone-300 transition-colors"
          >
            חזרה לתפריט
          </button>
        </div>
      </div>
    </div>
  );
};
