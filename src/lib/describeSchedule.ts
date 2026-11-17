import { toDateKey } from './dateKeys';
import { formatList, formatShortDate, formatShortWeekday, formatTimeOfDay } from './formatters';
import type { Prescription } from './types';
import { isEveryDay, sortDays } from './weekdays';

/** "Every day at 8:00 AM and 8:00 PM", "Mon, Wed and Fri at 9:00 PM". */
export function describeSchedule(prescription: Pick<Prescription, 'daysOfWeek' | 'times'>): string {
  const days = isEveryDay(prescription.daysOfWeek)
    ? 'Every day'
    : formatList(sortDays(prescription.daysOfWeek).map(formatShortWeekday));
  const times = formatList(prescription.times.map(formatTimeOfDay));
  return `${days} at ${times}`;
}

/** "From 3 Nov 2026", "3 Nov 2026 to 10 Nov 2026". */
export function describeDateRange(prescription: Pick<Prescription, 'startDate' | 'endDate'>): string {
  if (prescription.endDate === null) return `From ${formatShortDate(prescription.startDate)}`;
  return `${formatShortDate(prescription.startDate)} to ${formatShortDate(prescription.endDate)}`;
}

export function describeArchived(prescription: Pick<Prescription, 'archivedAt'>): string | null {
  if (prescription.archivedAt === null) return null;
  return `Archived ${formatShortDate(toDateKey(new Date(prescription.archivedAt)))}`;
}
