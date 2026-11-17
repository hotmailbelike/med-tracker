import { dayOfWeek } from './dateKeys';
import { atTimeOnDay } from './timeOfDay';
import type { DateKey, DoseLog, Person, Prescription, TimeOfDay } from './types';

export interface DoseOccurrence {
  /** Stable identity of this dose: the id its log is stored under. */
  key: string;
  prescription: Prescription;
  person: Person | undefined;
  date: DateKey;
  time: TimeOfDay;
  scheduledAt: Date;
  log: DoseLog | undefined;
}

export function occurrenceKey(prescriptionId: string, date: DateKey, time: TimeOfDay): string {
  return `${prescriptionId}@${date}T${time}`;
}

function isScheduledOn(prescription: Prescription, day: DateKey): boolean {
  // Day keys are zero-padded, so text comparison is date order.
  if (day < prescription.startDate) return false;
  if (prescription.endDate !== null && day > prescription.endDate) return false;
  return prescription.daysOfWeek.includes(dayOfWeek(day));
}

/**
 * Archiving stops new doses from the archive moment on, not from the start of that day, so doses
 * already due (and any that were logged) stay in Today and History.
 */
function isDroppedByArchive(prescription: Prescription, scheduledAt: Date, log: DoseLog | undefined): boolean {
  if (prescription.archivedAt === null || log !== undefined) return false;
  return scheduledAt.getTime() >= Date.parse(prescription.archivedAt);
}

export function indexLogs(logs: readonly DoseLog[]): Map<string, DoseLog> {
  return new Map(logs.map((log) => [log.id, log]));
}

interface OccurrenceSources {
  prescriptions: readonly Prescription[];
  people: readonly Person[];
  logsById: ReadonlyMap<string, DoseLog>;
}

/** Every dose due on one local day, generated from the schedules, in time order. */
export function occurrencesForDay(day: DateKey, { prescriptions, people, logsById }: OccurrenceSources): DoseOccurrence[] {
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const occurrences: DoseOccurrence[] = [];

  for (const prescription of prescriptions) {
    if (!isScheduledOn(prescription, day)) continue;
    for (const time of prescription.times) {
      const key = occurrenceKey(prescription.id, day, time);
      const scheduledAt = atTimeOnDay(day, time);
      const log = logsById.get(key);
      if (isDroppedByArchive(prescription, scheduledAt, log)) continue;
      occurrences.push({
        key,
        prescription,
        person: peopleById.get(prescription.personId),
        date: day,
        time,
        scheduledAt,
        log,
      });
    }
  }

  return occurrences.sort(
    (a, b) =>
      a.scheduledAt.getTime() - b.scheduledAt.getTime() ||
      a.prescription.medicineName.localeCompare(b.prescription.medicineName),
  );
}
