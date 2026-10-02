import React, { useState } from 'react';
import { Clock, RefreshCw, ShoppingBag, X, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface OrdersHistoryModalProps {
  onClose: () => void;
  onTrackOrder: (order: Order) => void;
}

export const OrdersHistoryModal: React.FC<OrdersHistoryModalProps> = ({
  onClose,
  onTrackOrder,
}) => {
  const { orders } = useStore();
  const { reorderItems } = useCart();
  const { user, loginWithGoogle } = useAuth();

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return { label: 'התקבלה', color: 'bg-amber-100 text-amber-800' };
      case 'in_review':
        return { label: 'בטיפול', color: 'bg-blue-100 text-blue-800' };
      case 'preparing':
        return { label: 'בהכנה במטבח', color: 'bg-orange-100 text-orange-800' };
      case 'on_the_way':
        return { label: 'בדרך עם שליח', color: 'bg-purple-100 text-purple-800' };
      case 'completed':
        return { label: 'הושלמה', color: 'bg-emerald-100 text-emerald-800' };
      case 'cancelled':
        return { label: 'בוטלה', color: 'bg-rose-100 text-rose-800' };
      default:
        return { label: status, color: 'bg-stone-100 text-stone-800' };
    }
  };

  const handleReorder = (order: Order) => {
    reorderItems(order.items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              📋
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 leading-tight">
                ההזמנות שלי
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                מעקב בזמן אמת והזמנה חוזרת בלחיצה אחת
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

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {!user && orders.length === 0 && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <span>התחבר עם חשבון Google כדי לשמור ולסנכרן את ההזמנות שלך בכל מכשיר.</span>
              <button
                onClick={loginWithGoogle}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-xl font-bold shrink-0 shadow-xs"
              >
                התחבר עכשיו
              </button>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-stone-100 mx-auto flex items-center justify-center text-3xl">
                📦
              </div>
              <h3 className="font-bold text-stone-800 text-base">עדיין לא בוצעו הזמנות</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                כל הזמנה שתבצע תופיע כאן עם אפשרות למעקב סטטוס והזמנה חוזרת מהירה
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-stone-50/80 rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:border-emerald-300 transition-colors"
                >
                  {/* Summary Bar */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-stone-900 text-sm">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span>{new Date(order.createdAt).toLocaleDateString('he-IL')}</span>
                        <span>•</span>
                        <span>{order.deliveryType === 'delivery' ? 'משלוח 🚚' : 'איסוף עצמי 🏪'}</span>
                        <span>•</span>
                        <span className="font-bold text-stone-900">₪{order.grandTotal.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>הזמן שוב</span>
                      </button>

                      <button
                        onClick={() => onTrackOrder(order)}
                        className="px-3 py-2 bg-white hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold border border-stone-200 transition-colors"
                      >
                        מעקב
                      </button>

                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
                        title="פירוט הזמנה"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Line Items */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-stone-200/70 space-y-2 bg-white text-xs">
                      <div className="font-bold text-stone-800">פירוט פריטי ההזמנה:</div>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-stone-50 rounded-xl border border-stone-200/60 flex items-start justify-between"
                        >
                          <div>
                            <div className="font-bold text-stone-900">
                              {item.quantity}x {item.name}
                            </div>
                            {item.customSummaryText && (
                              <div className="text-[11px] text-stone-500 mt-0.5 space-y-0.5">
                                {item.customSummaryText.map((t, i) => (
                                  <div key={i}>• {t}</div>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="font-black text-stone-900 shrink-0">
                            ₪{(item.unitPrice * item.quantity).toFixed(0)}
                          </span>
                        </div>
                      ))}

                      {order.deliveryAddress && (
                        <div className="pt-2 text-[11px] text-stone-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            יעד: {order.deliveryAddress.street} {order.deliveryAddress.houseNumber},{' '}
                            {order.deliveryAddress.city}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
