import { StoreSettings } from '../types';

export interface OrderWindowStatus {
  isOpen: boolean;
  currentDayName: string;
  cutoffDayName: string;
  nextCutoffDateFormatted: string;
  currentCycleDeliveryDate: string;
  nextCycleDeliveryDate: string;
  message: string;
  daysRemaining: number;
}

const HEBREW_DAYS = [
  'יום ראשון',
  'יום שני',
  'יום שלישי',
  'יום רביעי',
  'יום חמישי',
  'יום שישי',
  'שבת',
];

/**
 * Dynamically evaluates if the order window for the current weekly cycle is open.
 * Orders are accepted until Tuesday 23:59:59.
 */
export function checkOrderWindow(settings?: StoreSettings): OrderWindowStatus {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const cutoffDay = settings?.orderCutoffDay ?? 2; // Default Tuesday (2)

  // If admin has set cutoffOverrideOpen to true, allow orders
  const isOverridden = Boolean(settings?.cutoffOverrideOpen);

  // If current day is Sunday (0), Monday (1), or Tuesday (2 up to 23:59), the window is OPEN
  const isBeforeOrOnCutoff = currentDay <= cutoffDay;
  const isOpen = isOverridden || isBeforeOrOnCutoff;

  // Calculate this week's Tuesday date
  const thisTuesday = new Date(now);
  const diffToTuesday = cutoffDay - currentDay;
  thisTuesday.setDate(now.getDate() + diffToTuesday);
  thisTuesday.setHours(23, 59, 59, 999);

  // Calculate next cycle's Tuesday
  const nextTuesday = new Date(thisTuesday);
  if (!isBeforeOrOnCutoff) {
    nextTuesday.setDate(thisTuesday.getDate() + 7);
  }

  // Distribution days (typically Friday of the cycle)
  const currentFriday = new Date(thisTuesday);
  currentFriday.setDate(thisTuesday.getDate() + 3);

  const nextFriday = new Date(nextTuesday);
  nextFriday.setDate(nextTuesday.getDate() + 3);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

  const daysRemaining = isBeforeOrOnCutoff ? cutoffDay - currentDay : 0;

  let message = '';
  if (isOpen) {
    if (daysRemaining === 0) {
      message = 'היום יום שלישי - ההזמנות נסגרות הלילה בחצות!';
    } else {
      message = `ההזמנות למחזור הנוכחי פתוחות עד יום שלישי בחצות (נותרו ${daysRemaining} ימים)`;
    }
  } else {
    message = 'מועד ההזמנות למחזור הנוכחי הסתיים. ניתן להזמין למחזור הבא.';
  }

  return {
    isOpen,
    currentDayName: HEBREW_DAYS[currentDay],
    cutoffDayName: HEBREW_DAYS[cutoffDay],
    nextCutoffDateFormatted: formatDate(isBeforeOrOnCutoff ? thisTuesday : nextTuesday),
    currentCycleDeliveryDate: formatDate(currentFriday),
    nextCycleDeliveryDate: formatDate(nextFriday),
    message,
    daysRemaining,
  };
}
