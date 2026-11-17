import { parseDateKey } from './dateKeys';
import { atTimeOnDay } from './timeOfDay';
import type { DateKey, DayOfWeek, TimeOfDay } from './types';

// `undefined` locale: every date and time follows the user's own language and 12/24-hour setting.
const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const longDayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
const shortDateFormatter = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const shortWeekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const longWeekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
const percentFormatter = new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 });
const listFormatter = new Intl.ListFormat(undefined, { style: 'long', type: 'conjunction' });
const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

/** A known Sunday, used to name weekdays through Intl. */
const REFERENCE_SUNDAY = new Date(2024, 0, 7);
const MINUTES_PER_HOUR = 60;

function weekdayDate(day: DayOfWeek): Date {
  const date = new Date(REFERENCE_SUNDAY);
  date.setDate(REFERENCE_SUNDAY.getDate() + day);
  return date;
}

/** Times are formatted on a fixed day so daylight saving never shifts the label. */
export function formatTimeOfDay(time: TimeOfDay): string {
  return timeFormatter.format(atTimeOnDay('2024-01-15', time));
}

export function formatClockTime(date: Date): string {
  return timeFormatter.format(date);
}

export function formatLongDay(key: DateKey): string {
  const date = parseDateKey(key);
  return date === null ? key : longDayFormatter.format(date);
}

export function formatShortDate(key: DateKey): string {
  const date = parseDateKey(key);
  return date === null ? key : shortDateFormatter.format(date);
}

export function formatShortWeekday(dayOrKey: DayOfWeek | DateKey): string {
  if (typeof dayOrKey === 'number') return shortWeekdayFormatter.format(weekdayDate(dayOrKey));
  const date = parseDateKey(dayOrKey);
  return date === null ? dayOrKey : shortWeekdayFormatter.format(date);
}

export function formatLongWeekday(dayOrKey: DayOfWeek | DateKey): string {
  if (typeof dayOrKey === 'number') return longWeekdayFormatter.format(weekdayDate(dayOrKey));
  const date = parseDateKey(dayOrKey);
  return date === null ? dayOrKey : longWeekdayFormatter.format(date);
}

export function formatPercent(ratio: number): string {
  return percentFormatter.format(ratio);
}

export function formatList(items: readonly string[]): string {
  return listFormatter.format(items);
}

/** "in 20 minutes", "2 hours ago": rounded to minutes under an hour, otherwise to hours. */
export function formatRelativeMinutes(minutes: number): string {
  if (Math.abs(minutes) < MINUTES_PER_HOUR) return relativeFormatter.format(Math.round(minutes), 'minute');
  return relativeFormatter.format(Math.round(minutes / MINUTES_PER_HOUR), 'hour');
}
