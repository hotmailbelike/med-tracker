import { useEffect, useRef, useState } from 'react';
import { buildReminder } from '../lib/buildReminder';
import type { DoseOccurrence } from '../lib/schedule';
import { showNotification } from '../lib/showNotification';

/** When the app opens or comes back into view, doses that came due this recently still get a reminder. */
const CATCH_UP_MINUTES = 15;
const MS_PER_MINUTE = 60_000;

function groupPendingBySlot(occurrences: readonly DoseOccurrence[]): Map<string, DoseOccurrence[]> {
  const slots = new Map<string, DoseOccurrence[]>();
  for (const occurrence of occurrences) {
    if (occurrence.log !== undefined) continue;
    const slotKey = `${occurrence.date}T${occurrence.time}`;
    slots.set(slotKey, [...(slots.get(slotKey) ?? []), occurrence]);
  }
  return slots;
}

/**
 * Schedules a notification for each upcoming time slot of today's unlogged doses, while the app is
 * open. Timers are rebuilt whenever the doses change (a dose logged before its time cancels its
 * reminder) and when the app becomes visible again, since browsers throttle timers in hidden tabs.
 * Reminders with the app closed would need Web Push from a server, which this app has none of.
 */
export function useReminders(todaysDoses: readonly DoseOccurrence[], isActive: boolean): void {
  const notifiedSlots = useRef(new Set<string>());
  const [visibleSince, setVisibleSince] = useState(() => Date.now());

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') setVisibleSince(Date.now());
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const timers: number[] = [];
    const now = Date.now();

    for (const [slotKey, doses] of groupPendingBySlot(todaysDoses)) {
      const first = doses[0];
      if (first === undefined || notifiedSlots.current.has(slotKey)) continue;
      const delay = first.scheduledAt.getTime() - now;
      if (delay < -CATCH_UP_MINUTES * MS_PER_MINUTE) continue;

      const remind = () => {
        notifiedSlots.current.add(slotKey);
        showNotification(buildReminder(slotKey, doses)).catch((error: unknown) => {
          console.warn('Med Tracker: a reminder could not be shown.', error);
        });
      };
      if (delay <= 0) remind();
      else timers.push(window.setTimeout(remind, delay));
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [todaysDoses, isActive, visibleSince]);
}
