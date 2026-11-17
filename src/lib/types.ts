/** A calendar day in the user's local time zone, as `YYYY-MM-DD`. */
export type DateKey = string;

/** A local wall-clock time, as 24-hour `HH:MM`. */
export type TimeOfDay = string;

/** Matches `Date.prototype.getDay()`: 0 is Sunday. */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const MEDICINE_FORMS = ['tablet', 'capsule', 'liquid', 'drops', 'inhaler', 'injection'] as const;
export type MedicineForm = (typeof MEDICINE_FORMS)[number];

export const PRESCRIPTION_COLORS = ['rose', 'amber', 'lime', 'teal', 'sky', 'violet', 'sand', 'slate'] as const;
export type PrescriptionColor = (typeof PRESCRIPTION_COLORS)[number];

export const DOSE_LOG_STATUSES = ['taken', 'skipped'] as const;
export type DoseLogStatus = (typeof DOSE_LOG_STATUSES)[number];

export interface Person {
  id: string;
  name: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  personId: string;
  medicineName: string;
  /** Free text such as "500 mg" or "1000 IU"; empty when it does not apply. */
  strength: string;
  form: MedicineForm;
  /** How many units of the form make one dose, such as 2 (tablets) or 5 (ml). */
  doseAmount: number;
  /** One entry per dose of the day, sorted and unique. */
  times: TimeOfDay[];
  /** The days doses are due; all seven means every day. */
  daysOfWeek: DayOfWeek[];
  startDate: DateKey;
  endDate: DateKey | null;
  notes: string;
  color: PrescriptionColor;
  /** When the prescription was archived (ISO timestamp); archived ones schedule nothing from that day on. */
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DoseLog {
  /** The occurrence key from `occurrenceKey()`, so a dose has at most one log. */
  id: string;
  prescriptionId: string;
  date: DateKey;
  time: TimeOfDay;
  status: DoseLogStatus;
  recordedAt: string;
}

export interface AppSettings {
  remindersEnabled: boolean;
}

export interface TrackerData {
  people: Person[];
  prescriptions: Prescription[];
  doseLogs: DoseLog[];
}

export interface AppSnapshot extends TrackerData {
  settings: AppSettings;
}
