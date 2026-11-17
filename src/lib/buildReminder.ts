import { formatTimeOfDay } from './formatters';
import type { DoseOccurrence } from './schedule';

/** Reminders can show on a lock screen, so they never name a medicine or a person. */
const REMINDER_BODY = 'Open Med Tracker to see and log them.';

/** One notification per time slot, counting every dose due then, across everyone. */
export function buildReminder(slotKey: string, doses: readonly DoseOccurrence[]) {
  const first = doses[0];
  const time = first === undefined ? '' : formatTimeOfDay(first.time);
  const countLabel = doses.length === 1 ? '1 dose due' : `${doses.length} doses due`;
  return { title: `${time} · ${countLabel}`, body: REMINDER_BODY, tag: `med-tracker-${slotKey}` };
}
