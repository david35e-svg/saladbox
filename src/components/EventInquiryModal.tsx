import React, { useState } from 'react';
import { Calendar, CheckCircle2, Phone, Sparkles, Users, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { EventInquiry, EventType } from '../types';

interface EventInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EVENT_TYPES_LIST: { id: EventType; label: string; icon: string; desc: string }[] = [
  { id: 'shabbat_chatan', label: 'שבת חתן', icon: '🕯️', desc: 'מארזים וכמויות נדיבות לשבת שלמה' },
  { id: 'azkara', label: 'אזכרה וסעודת מצווה', icon: '🕯️', desc: 'מגוון סלטים מבושלים ומסורתיים' },
  { id: 'aliyah_latora', label: 'עלייה לתורה', icon: '📖', desc: 'כיבוד וסלטים מפנקים לאחר התפילה' },
  { id: 'family_hosting', label: 'אירוח משפחתי עשיר', icon: '🍷', desc: 'שולחן שישי עשיר ללא שעות עמידה במטבח' },
  { id: 'birthday', label: 'יום הולדת / מפגש חברים', icon: '🎉', desc: 'קערות סלטים ומטבלים מיוחדים' },
  { id: 'friends_gathering', label: 'אירוע קטן אחר', icon: '✨', desc: 'התאמה אישית של תפריט הסלטים' },
];

export const EventInquiryModal: React.FC<EventInquiryModalProps> = ({ isOpen, onClose }) => {
  const [eventType, setEventType] = useState<EventType>('shabbat_chatan');
  const [eventDate, setEventDate] = useState('');
  const [guestsCount, setGuestsCount] = useState<number>(20);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('נא למלא שם וטלפון ליצירת קשר');
      return;
    }

    try {
      setIsSubmitting(true);
      const inquiryId = `inq_${Date.now()}`;
      const selectedObj = EVENT_TYPES_LIST.find((t) => t.id === eventType);
      const newInquiry: EventInquiry = {
        id: inquiryId,
        eventType,
        eventTypeName: selectedObj?.label || 'אירוע',
        eventDate: eventDate || new Date().toISOString().split('T')[0],
        numberOfGuests: Number(guestsCount) || 10,
        contactName: customerName.trim(),
        contactPhone: customerPhone.trim(),
        contactEmail: customerEmail.trim() || undefined,
        location: 'נוף הגליל',
        notes: notes.trim() || undefined,
        status: 'new',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(collection(db, 'eventInquiries'), inquiryId), newInquiry);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit event inquiry:', err);
      setErrorMsg('שגיאה בשליחת הפנייה. ניתן גם ליצור קשר ישירות בטלפון.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-stone-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full w-fit mb-1 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>אירוח ואירועים קטנים</span>
            </div>
            <h3 className="font-black text-stone-900 text-lg sm:text-xl">
              יש לכם אירוע? אנחנו מכינים את הסלטים
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              שבת חתן, אזכרות, עלייה לתורה או אירוח משפחתי — סלטים טריים בכמויות מתאימות
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-xl text-stone-900">הפנייה התקבלה בהצלחה!</h4>
              <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                תודה <strong className="font-bold">{customerName}</strong>. ניצור איתך קשר בהקדם בטלפון{' '}
                <strong className="font-bold" dir="ltr">{customerPhone}</strong> להתאמת תפריט סלטים מושלם וכמויות מדויקות לאירוע.
              </p>
            </div>
            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              סגור וחזור לחנות
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold">
                {errorMsg}
              </div>
            )}

            {/* Event Type Grid */}
            <div className="space-y-1.5">
              <label className="block font-bold text-stone-800">
                סוג האירוע או האירוח *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_TYPES_LIST.map((item) => {
                  const isSelected = eventType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEventType(item.id)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex items-start gap-2 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-500 shadow-2xs'
                          : 'border-stone-200 hover:border-emerald-300 bg-white'
                      }`}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <div className="font-bold text-stone-900 leading-snug">{item.label}</div>
                        <div className="text-[10px] text-stone-500 leading-tight mt-0.5">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Guests */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>תאריך האירוע המשוער</span>
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  <span>מספר אורחים משוער</span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={500}
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  placeholder="למשל 25"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-bold focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  שם מלא *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>טלפון ליצירת קשר *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="050-0000000"
                  dir="ltr"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-right focus:bg-white focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                הערות, סלטים מועדפים או דגשים מיוחדים
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="למשל: סלטים פיקנטיים, כמות גדולה של מטבוחה וחצילים לשבת חתן..."
                className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                📍 איסוף / אספקה בנוף הגליל והסביבה
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>{isSubmitting ? 'שולח...' : 'שלח פנייה להתאמת סלטים'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
