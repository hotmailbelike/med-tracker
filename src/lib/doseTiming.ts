import type { DoseOccurrence } from './schedule';

/** A dose counts as "due now" from this long before its time... */
const DUE_SOON_MINUTES = 30;
/** ...until this long after it; after that an unlogged dose is overdue. */
export const OVERDUE_AFTER_MINUTES = 60;

const MS_PER_MINUTE = 60_000;

export type TimelinePhase = 'previous' | 'due' | 'upcoming';
export type DoseState = 'taken' | 'skipped' | 'due' | 'overdue' | 'upcoming';

export function minutesUntil(occurrence: DoseOccurrence, now: Date): number {
  return (occurrence.scheduledAt.getTime() - now.getTime()) / MS_PER_MINUTE;
}

export function timelinePhase(occurrence: DoseOccurrence, now: Date): TimelinePhase {
  const minutes = minutesUntil(occurrence, now);
  if (minutes > DUE_SOON_MINUTES) return 'upcoming';
  if (minutes < -OVERDUE_AFTER_MINUTES) return 'previous';
  return 'due';
}

export function doseState(occurrence: DoseOccurrence, now: Date): DoseState {
  if (occurrence.log !== undefined) return occurrence.log.status;
  const phase = timelinePhase(occurrence, now);
  if (phase === 'previous') return 'overdue';
  return phase;
}
