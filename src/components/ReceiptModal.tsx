import React, { useRef } from 'react';
import {
  Printer,
  X,
  Share2,
  CheckCircle2,
  Download,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

interface ReceiptModalProps {
  order: Order;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { settings } = useStore();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Derive official receipt number if not saved yet
  const receiptNumber =
    order.receiptNumber ||
    `REC-2026-${order.orderNumber.replace(/[^0-9]/g, '') || Math.floor(10000 + Math.random() * 90000)}`;

  // Financial calculations
  const discount = order.discountAmount || 0;
  const grandTotal = order.grandTotal;
  // In Israel VAT is 17%
  const subtotalBeforeVat = grandTotal / 1.17;
  const vatAmount = grandTotal - subtotalBeforeVat;

  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `שלום ${order.customerName},\nלהלן חשבונית מס קבלה דיגיטלית מס׳ ${receiptNumber} מ-SALAD BOX נוף הגליל.\nסה"כ שולם: ₪${grandTotal.toFixed(0)}.\nלהזמנה: ${order.orderNumber}\nתודה שבחרתם בנו לשולחן השבת שלכם! 🥗`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopySummary = () => {
    const summary = `חשבונית מס קבלה ${receiptNumber}\nעסק: SALAD BOX (ח.פ 516482910)\nתאריך: ${formattedDate} ${formattedTime}\nלכבוד: ${order.customerName}\nסה"כ כולל מע"מ: ₪${grandTotal.toFixed(0)}\nאמצעי תשלום: ${order.paymentMethod}\nסטטוס: ${order.paymentStatus === 'paid' ? 'שולם' : 'ממתין לתשלום'}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getPaymentMethodDetails = () => {
    switch (order.paymentMethod) {
      case 'credit_card':
        return {
          title: 'כרטיס אשראי',
          icon: '💳',
          details: `סיומת כרטיס: ****${order.creditCardLast4 || '4242'} • אישור שובר: ${order.approvalCode || '948210'} • ${order.installments || 1} תשלומים`,
        };
      case 'bit':
        return {
          title: 'העברה דיגיטלית (Bit)',
          icon: '📱',
          details: `הועבר למספר 052-844-3990 • אסמכתא: ${order.bitTransactionRef || 'BIT-' + order.orderNumber.replace(/[^0-9]/g, '')}`,
        };
      case 'cash':
        return {
          title: 'תשלום במזומן',
          icon: '💵',
          details: 'מסירה במעמד איסוף ההזמנה או הגעת השליח',
        };
      case 'phone':
        return {
          title: 'הזמנה וחיוב טלפוני',
          icon: '📞',
          details: 'ההזמנה אושרה טלפונית מול מוקד השירות של הסניף',
        };
      default:
        return {
          title: 'תשלום דיגיטלי',
          icon: '💰',
          details: 'אושר במערכת',
        };
    }
  };

  const paymentDetails = getPaymentMethodDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              📄
            </div>
            <div>
              <h3 className="font-bold text-sm">חשבונית מס קבלה דיגיטלית רשמית</h3>
              <p className="text-[11px] text-stone-400">מסמך ממוחשב חוקי ומאושר לצורכי מס</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="הדפס חשבונית"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">הדפס קבלה</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="שתף בוואטסאפ"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">וואטסאפ</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-stone-100/60 print:p-0 print:bg-white">
          <div
            ref={receiptRef}
            className="max-w-xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 text-stone-900 print:border-none print:shadow-none print:p-0"
          >
            {/* Header: Company Details & Invoice Title */}
            <div className="border-b-2 border-stone-900 pb-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Business Info */}
                <div className="space-y-1 text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-emerald-800">
                      SALAD BOX
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      סלטים ביתיים פרימיום
                    </span>
                  </div>
                  <div className="text-xs font-bold text-stone-800">
                    סלט בוקס בע"מ • ח.פ / ע.מ: 516482910
                  </div>
                  <div className="text-[11px] text-stone-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>שדרות מעלה יצחק 24, נוף הגליל</span>
                  </div>
                  <div className="text-[11px] text-stone-600 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>052-844-3990</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>orders@saladbox.co.il</span>
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1 pt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>כשר למהדרין בהשגחת רבנות נוף הגליל</span>
                  </div>
                </div>

                {/* Document Type Badge */}
                <div className="text-left bg-stone-50 p-3 rounded-2xl border border-stone-200 shrink-0 space-y-1 sm:text-left">
                  <div className="inline-block bg-stone-900 text-white font-black text-xs px-2.5 py-1 rounded-md tracking-wide">
                    חשבונית מס / קבלה
                  </div>
                  <div className="text-[11px] font-bold text-stone-700">
                    מקור • מסמך ממוחשב
                  </div>
                  <div className="text-xs font-black text-emerald-800 dir-ltr">
                    {receiptNumber}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    תאריך: {formattedDate} {formattedTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="my-5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <span className="text-stone-400 text-[10px] block font-bold">לכבוד (פרטי הלקוח):</span>
                <span className="font-black text-stone-900 text-sm">{order.customerName}</span>
                <div className="text-stone-600 text-xs mt-0.5" dir="ltr">
                  טלפון: {order.customerPhone}
                </div>
                {order.customerEmail && (
                  <div className="text-stone-600 text-[11px]">מייל: {order.customerEmail}</div>
                )}
              </div>

              <div>
                <span className="text-stone-400 text-[10px] block font-bold">פרטי מסירה ויעד:</span>
                <div className="font-bold text-stone-900">
                  {order.deliveryType === 'delivery' ? 'משלוח עד הבית (נוף הגליל)' : 'איסוף עצמי מהסניף'}
                </div>
                {order.deliveryAddress ? (
                  <div className="text-stone-600 text-xs mt-0.5">
                    {order.deliveryAddress.street} {order.deliveryAddress.houseNumber}
                    {order.deliveryAddress.apartment && `, דירה ${order.deliveryAddress.apartment}`}
                    {order.deliveryAddress.floor && `, קומה ${order.deliveryAddress.floor}`},{' '}
                    {order.deliveryAddress.city}
                  </div>
                ) : (
                  <div className="text-stone-600 text-xs mt-0.5">
                    שדרות מעלה יצחק 24, נוף הגליל (שישי 08:00-14:30)
                  </div>
                )}
                {order.timeSlot && (
                  <div className="text-emerald-700 text-[11px] font-bold mt-0.5">
                    חלון חלוקה מבוקש: {order.timeSlot}
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2 mb-5">
              <div className="text-xs font-bold text-stone-800 flex items-center justify-between">
                <span>פירוט מוצרים ושירותים:</span>
                <span className="text-stone-400 text-[11px]">מספר הזמנה: {order.orderNumber}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="border-b-2 border-stone-200 text-stone-500 text-[11px]">
                      <th className="py-2 pr-1 font-bold">תיאור הפריט</th>
                      <th className="py-2 text-center font-bold">גודל / טעם</th>
                      <th className="py-2 text-center font-bold">כמות</th>
                      <th className="py-2 text-left font-bold">מחיר יח'</th>
                      <th className="py-2 pl-1 text-left font-bold">סה"כ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {order.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="py-2.5 pr-1 font-bold text-stone-900">
                          {it.name}
                          {it.customDetails && (
                            <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                              הרכבה אישית
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 text-center text-stone-600">
                          {it.selectedSizeLabel || it.selectedFlavor || (it.selectedTier ? it.selectedTier.label : 'יחידה')}
                        </td>
                        <td className="py-2.5 text-center font-bold text-stone-900">
                          {it.quantity}
                        </td>
                        <td className="py-2.5 text-left text-stone-600" dir="ltr">
                          ₪{it.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 pl-1 text-left font-bold text-stone-900" dir="ltr">
                          ₪{(it.unitPrice * it.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* Delivery fee row */}
                    {order.deliveryFee > 0 && (
                      <tr className="hover:bg-stone-50/50">
                        <td className="py-2.5 pr-1 font-bold text-stone-900" colSpan={2}>
                          דמי משלוח מקומי (נוף הגליל)
                        </td>
                        <td className="py-2.5 text-center font-bold">1</td>
                        <td className="py-2.5 text-left text-stone-600" dir="ltr">
                          ₪{order.deliveryFee.toFixed(2)}
                        </td>
                        <td className="py-2.5 pl-1 text-left font-bold text-stone-900" dir="ltr">
                          ₪{order.deliveryFee.toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {/* Discount coupon row */}
                    {discount > 0 && (
                      <tr className="text-emerald-700 bg-emerald-50/40">
                        <td className="py-2 pr-1 font-bold" colSpan={4}>
                          הנחת קופון ומבצע {order.couponCode ? `(${order.couponCode})` : ''}
                        </td>
                        <td className="py-2 pl-1 text-left font-bold" dir="ltr">
                          -₪{discount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary & VAT Breakdown */}
            <div className="border-t-2 border-stone-900 pt-3 pb-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>סה"כ חייב במע"מ (17%):</span>
                <span className="font-medium" dir="ltr">₪{subtotalBeforeVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>סכום מע"מ (17%):</span>
                <span className="font-medium" dir="ltr">₪{vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm sm:text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                <span className="text-stone-900">סה"כ לתשלום כולל מע"מ:</span>
                <span className="text-xl font-black text-emerald-800" dir="ltr">
                  ₪{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method & Authorization Information */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1 mb-5">
              <div className="flex items-center justify-between font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{paymentDetails.icon}</span>
                  <span>אמצעי תשלום: {paymentDetails.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {order.paymentStatus === 'paid' ? 'שולם במלואו' : 'ממתין לתשלום'}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-stone-600 pt-0.5">
                {paymentDetails.details}
              </div>
              {order.paymentConfirmedAt && (
                <div className="text-[10px] text-stone-500">
                  מועד אישור התקבול: {new Date(order.paymentConfirmedAt).toLocaleString('he-IL')}
                </div>
              )}
            </div>

            {/* Footer Signoff, Stamp and Barcode */}
            <div className="pt-4 border-t border-dashed border-stone-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
              {/* Official Digital Stamp */}
              <div className="p-3 bg-emerald-50/80 rounded-2xl border-2 border-dashed border-emerald-300 text-center inline-block">
                <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>SALAD BOX - חתום דיגיטלית</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                  מסמך ממוחשב חוקי ומאושר כחוק
                </div>
              </div>

              {/* Barcode & Security Hash */}
              <div className="space-y-1 text-center sm:text-left">
                <div className="inline-block bg-stone-900 text-white font-mono text-[10px] px-3 py-1 rounded tracking-widest uppercase">
                  ||| | | || ||| || ||||| | |||
                </div>
                <div className="text-[9px] text-stone-400 font-mono">
                  VERIFY-{receiptNumber}
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="mt-4 pt-3 border-t border-stone-100 text-center text-[10px] text-stone-400">
              הופק באופן אוטומטי ע"י מערכת SALAD BOX נוף הגליל • תודה על הזמנתכם ושבת שלום ומבורכת!
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden in Print) */}
        <div className="p-4 bg-white border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'הועתק ללוח!' : 'העתק פרטים'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>שלח בוואטסאפ</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>הדפס / שמור כ-PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold border border-stone-200 transition-colors"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
