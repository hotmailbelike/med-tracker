import { daysEndingOn } from './dateKeys';
import { OVERDUE_AFTER_MINUTES } from './doseTiming';
import { occurrencesForDay, type DoseOccurrence } from './schedule';
import type { DateKey, DoseLog, Person, Prescription } from './types';

interface AdherenceTally {
  /** Logged doses, plus unlogged ones that are already overdue. */
  counted: number;
  taken: number;
  skipped: number;
  /** Overdue and never logged. */
  missed: number;
}

export interface DayAdherence {
  day: DateKey;
  tally: AdherenceTally;
}

export interface PrescriptionAdherence {
  prescription: Prescription;
  person: Person | undefined;
  tally: AdherenceTally;
}

interface AdherenceReport {
  days: DayAdherence[];
  prescriptions: PrescriptionAdherence[];
  overall: AdherenceTally;
}

interface AdherenceSources {
  prescriptions: readonly Prescription[];
  people: readonly Person[];
  logsById: ReadonlyMap<string, DoseLog>;
}

const MS_PER_MINUTE = 60_000;

const emptyTally = (): AdherenceTally => ({ counted: 0, taken: 0, skipped: 0, missed: 0 });

/** Taken out of counted, or null when nothing was due (so the UI can say "no doses" instead of 0%). */
export function adherenceRatio(tally: AdherenceTally): number | null {
  return tally.counted === 0 ? null : tally.taken / tally.counted;
}

function addToTally(tally: AdherenceTally, occurrence: DoseOccurrence): void {
  tally.counted += 1;
  if (occurrence.log?.status === 'taken') tally.taken += 1;
  else if (occurrence.log?.status === 'skipped') tally.skipped += 1;
  else tally.missed += 1;
}

/**
 * Adherence over the `dayCount` days ending today. An unlogged dose only counts once Today calls it
 * overdue, so the score never drops for a dose that is still due now or later in the day.
 */
export function buildAdherenceReport(
  today: DateKey,
  dayCount: number,
  now: Date,
  sources: AdherenceSources,
): AdherenceReport {
  const overall = emptyTally();
  const byPrescription = new Map<string, PrescriptionAdherence>();

  const overdueBefore = now.getTime() - OVERDUE_AFTER_MINUTES * MS_PER_MINUTE;

  const days = daysEndingOn(today, dayCount).map((day): DayAdherence => {
    const tally = emptyTally();
    for (const occurrence of occurrencesForDay(day, sources)) {
      const isCountable = occurrence.log !== undefined || occurrence.scheduledAt.getTime() <= overdueBefore;
      if (!isCountable) continue;

      addToTally(tally, occurrence);
      addToTally(overall, occurrence);
      let entry = byPrescription.get(occurrence.prescription.id);
      if (entry === undefined) {
        entry = { prescription: occurrence.prescription, person: occurrence.person, tally: emptyTally() };
        byPrescription.set(occurrence.prescription.id, entry);
      }
      addToTally(entry.tally, occurrence);
    }
    return { day, tally };
  });

  const prescriptions = [...byPrescription.values()].sort(
    (a, b) =>
      (a.person?.name ?? '').localeCompare(b.person?.name ?? '') ||
      a.prescription.medicineName.localeCompare(b.prescription.medicineName),
  );

  return { days, prescriptions, overall };
}
