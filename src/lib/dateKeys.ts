import type { DateKey, DayOfWeek } from './types';

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number) => String(value).padStart(2, '0');

/** The local calendar day of a moment, so "today" follows the device's time zone. */
export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local midnight of a day key, or null for anything that is not a real calendar date. */
export function parseDateKey(key: string): Date | null {
  const match = DATE_KEY_PATTERN.exec(key);
  if (match === null) return null;
  const [, year, month, day] = match.map(Number) as [number, number, number, number];
  const date = new Date(year, month - 1, day);
  const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isRealDate ? date : null;
}

export function isDateKey(value: unknown): value is DateKey {
  return typeof value === 'string' && parseDateKey(value) !== null;
}

/**
 * Moves a day key by whole calendar days. Works on the calendar date, not on 24-hour steps, so a
 * daylight saving change never skips or repeats a day.
 */
export function addDays(key: DateKey, days: number): DateKey {
  const date = parseDateKey(key);
  if (date === null) throw new Error(`Not a valid date: ${key}`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function dayOfWeek(key: DateKey): DayOfWeek {
  const date = parseDateKey(key);
  if (date === null) throw new Error(`Not a valid date: ${key}`);
  return date.getDay() as DayOfWeek;
}

/** The `count` days ending with `lastDay`, oldest first. */
export function daysEndingOn(lastDay: DateKey, count: number): DateKey[] {
  return Array.from({ length: count }, (_, index) => addDays(lastDay, index - (count - 1)));
}
