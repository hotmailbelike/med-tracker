import { parseDateKey } from './dateKeys';
import type { DateKey, TimeOfDay } from './types';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isTimeOfDay(value: unknown): value is TimeOfDay {
  return typeof value === 'string' && TIME_PATTERN.test(value);
}

/**
 * The moment a local wall-clock time happens on a local day. On the night clocks go forward, a time
 * that does not exist (such as 02:30) resolves to the next real minute, which is what a reminder
 * should do.
 */
export function atTimeOnDay(day: DateKey, time: TimeOfDay): Date {
  const date = parseDateKey(day);
  const match = TIME_PATTERN.exec(time);
  if (date === null || match === null) throw new Error(`Not a valid day and time: ${day} ${time}`);
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date;
}

export function sortTimes(times: readonly TimeOfDay[]): TimeOfDay[] {
  // Zero-padded 24-hour strings sort correctly as text.
  return [...new Set(times)].sort();
}
