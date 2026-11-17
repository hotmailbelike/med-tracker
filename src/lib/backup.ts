import { toDateKey } from './dateKeys';
import { occurrenceKey } from './schedule';
import { sortTimes } from './timeOfDay';
import type { TrackerData } from './types';
import { isDoseLog, isPerson, isPrescription, isRecord } from './validateRecords';
import { sortDays } from './weekdays';

const BACKUP_FORMAT = 'med-tracker-backup';
const BACKUP_VERSION = 1;
/** Years of daily doses fit in well under this; anything larger is almost certainly the wrong file. */
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: TrackerData;
}

export function createBackup(data: TrackerData, now: Date): { fileName: string; json: string } {
  const backup: BackupFile = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    data: { people: data.people, prescriptions: data.prescriptions, doseLogs: data.doseLogs },
  };
  return { fileName: `med-tracker-backup-${toDateKey(now)}.json`, json: JSON.stringify(backup, null, 2) };
}

type BackupParseResult = { ok: true; data: TrackerData } | { ok: false; message: string };

function invalid(message: string): BackupParseResult {
  return { ok: false, message };
}

/**
 * Checks a backup file thoroughly before anything is replaced: the wrapper, every record's shape,
 * and that every prescription and log points at something that exists.
 */
export function parseBackup(text: string): BackupParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return invalid('This file is not valid JSON.');
  }

  if (!isRecord(parsed) || parsed.format !== BACKUP_FORMAT) {
    return invalid('This is not a Med Tracker backup file.');
  }
  if (parsed.version !== BACKUP_VERSION) {
    return invalid(`This backup was made by a different version of Med Tracker (version ${String(parsed.version)}).`);
  }

  const { data } = parsed;
  if (!isRecord(data) || !Array.isArray(data.people) || !Array.isArray(data.prescriptions) || !Array.isArray(data.doseLogs)) {
    return invalid('The backup is missing its people, prescriptions or dose history.');
  }

  const badPerson = data.people.findIndex((person) => !isPerson(person));
  if (badPerson !== -1) return invalid(`Person ${badPerson + 1} in the backup is incomplete or damaged.`);
  const badPrescription = data.prescriptions.findIndex((prescription) => !isPrescription(prescription));
  if (badPrescription !== -1) return invalid(`Prescription ${badPrescription + 1} in the backup is incomplete or damaged.`);
  const badLog = data.doseLogs.findIndex((log) => !isDoseLog(log));
  if (badLog !== -1) return invalid(`Dose record ${badLog + 1} in the backup is incomplete or damaged.`);

  const people = data.people.filter(isPerson);
  const prescriptions = data.prescriptions.filter(isPrescription).map((prescription) => ({
    ...prescription,
    times: sortTimes(prescription.times),
    daysOfWeek: sortDays(prescription.daysOfWeek),
  }));
  const doseLogs = data.doseLogs.filter(isDoseLog);

  const personIds = new Set(people.map((person) => person.id));
  if (prescriptions.some((prescription) => !personIds.has(prescription.personId))) {
    return invalid('A prescription in the backup belongs to a person who is not in it.');
  }
  const prescriptionIds = new Set(prescriptions.map((prescription) => prescription.id));
  const isConsistentLog = (log: (typeof doseLogs)[number]) =>
    prescriptionIds.has(log.prescriptionId) && log.id === occurrenceKey(log.prescriptionId, log.date, log.time);
  if (!doseLogs.every(isConsistentLog)) {
    return invalid('A dose record in the backup does not match any prescription.');
  }

  return { ok: true, data: { people, prescriptions, doseLogs } };
}
