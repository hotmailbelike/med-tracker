import type { DayOfWeek } from './types';

export const ALL_DAYS: readonly DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

/** Monday-first, the order most of the world reads a week in. */
export const WEEK_ORDER: readonly DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

export function isEveryDay(days: readonly DayOfWeek[]): boolean {
  return ALL_DAYS.every((day) => days.includes(day));
}

export function isDayOfWeek(value: unknown): value is DayOfWeek {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 6;
}

export function sortDays(days: readonly DayOfWeek[]): DayOfWeek[] {
  return WEEK_ORDER.filter((day) => days.includes(day));
}
