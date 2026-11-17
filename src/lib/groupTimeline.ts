import { doseState, timelinePhase, type DoseState, type TimelinePhase } from './doseTiming';
import type { DoseOccurrence } from './schedule';
import type { TimeOfDay } from './types';

export interface TimelineDose {
  occurrence: DoseOccurrence;
  state: DoseState;
}

interface TimeSlot {
  time: TimeOfDay;
  doses: TimelineDose[];
}

export interface TimelineSection {
  phase: TimelinePhase;
  slots: TimeSlot[];
  doseCount: number;
  overdueCount: number;
}

const PHASE_ORDER: readonly TimelinePhase[] = ['previous', 'due', 'upcoming'];

/** Splits a day's doses into Previous / Due now / Upcoming, each grouped by time of day. */
export function groupTimeline(occurrences: readonly DoseOccurrence[], now: Date): TimelineSection[] {
  const sections = new Map<TimelinePhase, TimelineSection>(
    PHASE_ORDER.map((phase) => [phase, { phase, slots: [], doseCount: 0, overdueCount: 0 }]),
  );

  // Occurrences arrive in time order, so each time slot is the last one in its section or new.
  for (const occurrence of occurrences) {
    const section = sections.get(timelinePhase(occurrence, now));
    if (section === undefined) continue;
    const state = doseState(occurrence, now);
    let slot = section.slots.at(-1);
    if (slot === undefined || slot.time !== occurrence.time) {
      slot = { time: occurrence.time, doses: [] };
      section.slots.push(slot);
    }
    slot.doses.push({ occurrence, state });
    section.doseCount += 1;
    if (state === 'overdue') section.overdueCount += 1;
  }

  return PHASE_ORDER.map((phase) => sections.get(phase)).filter(
    (section): section is TimelineSection => section !== undefined && section.doseCount > 0,
  );
}
