import { isDateKey } from './dateKeys';
import { isTimeOfDay, sortTimes } from './timeOfDay';
import { PRESCRIPTION_COLORS, type DayOfWeek, type MedicineForm, type Person, type Prescription, type PrescriptionColor } from './types';
import { ALL_DAYS, isEveryDay, sortDays } from './weekdays';

/** Person select value meaning "create a new person with this prescription". */
export const NEW_PERSON = 'new-person';
const DEFAULT_NEW_PERSON_NAME = 'Me';
const DEFAULT_FORM: MedicineForm = 'tablet';
const DEFAULT_DOSE_AMOUNT = '1';

export const DRAFT_LIMITS = {
  personName: 40,
  medicineName: 60,
  strength: 30,
  notes: 300,
  maxDoseAmount: 1000,
  maxTimesPerDay: 6,
} as const;

/** Sensible spreads through a waking day for each number of doses. */
const DEFAULT_TIMES_BY_COUNT: Record<number, readonly string[]> = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '14:00', '20:00'],
  4: ['08:00', '12:00', '16:00', '20:00'],
  5: ['07:00', '10:00', '13:00', '16:00', '19:00'],
  6: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
};

export interface PrescriptionDraft {
  personId: string;
  newPersonName: string;
  medicineName: string;
  strength: string;
  form: MedicineForm;
  /** Kept as typed text so a half-typed number such as "0." is not rewritten under the cursor. */
  doseAmount: string;
  times: string[];
  everyDay: boolean;
  daysOfWeek: DayOfWeek[];
  startDate: string;
  endDate: string;
  notes: string;
  color: PrescriptionColor;
}

export type DraftField =
  | 'personId'
  | 'newPersonName'
  | 'medicineName'
  | 'strength'
  | 'doseAmount'
  | 'times'
  | 'daysOfWeek'
  | 'startDate'
  | 'endDate'
  | 'notes';

export type DraftErrors = Partial<Record<DraftField, string>>;

/** The first color no active prescription uses yet, so new ones are easy to tell apart. */
function suggestColor(prescriptions: readonly Prescription[]): PrescriptionColor {
  const used = new Set(prescriptions.filter((p) => p.archivedAt === null).map((p) => p.color));
  return PRESCRIPTION_COLORS.find((color) => !used.has(color)) ?? PRESCRIPTION_COLORS[0];
}

export function emptyDraft(people: readonly Person[], prescriptions: readonly Prescription[], today: string): PrescriptionDraft {
  return {
    personId: people[0]?.id ?? NEW_PERSON,
    newPersonName: people.length === 0 ? DEFAULT_NEW_PERSON_NAME : '',
    medicineName: '',
    strength: '',
    form: DEFAULT_FORM,
    doseAmount: DEFAULT_DOSE_AMOUNT,
    times: [...(DEFAULT_TIMES_BY_COUNT[1] ?? [])],
    everyDay: true,
    daysOfWeek: [...ALL_DAYS],
    startDate: today,
    endDate: '',
    notes: '',
    color: suggestColor(prescriptions),
  };
}

export function draftFromPrescription(prescription: Prescription): PrescriptionDraft {
  return {
    personId: prescription.personId,
    newPersonName: '',
    medicineName: prescription.medicineName,
    strength: prescription.strength,
    form: prescription.form,
    doseAmount: String(prescription.doseAmount),
    times: [...prescription.times],
    everyDay: isEveryDay(prescription.daysOfWeek),
    daysOfWeek: [...prescription.daysOfWeek],
    startDate: prescription.startDate,
    endDate: prescription.endDate ?? '',
    notes: prescription.notes,
    color: prescription.color,
  };
}

/** Changes how many doses a day there are, keeping times already chosen and filling in defaults. */
export function resizeTimes(times: readonly string[], count: number): string[] {
  const kept = times.slice(0, count);
  const defaults = DEFAULT_TIMES_BY_COUNT[count] ?? [];
  for (const time of defaults) {
    if (kept.length >= count) break;
    if (!kept.includes(time)) kept.push(time);
  }
  return sortTimes(kept);
}

export function validateDraft(draft: PrescriptionDraft): DraftErrors {
  const errors: DraftErrors = {};
  const amount = Number(draft.doseAmount);

  if (draft.personId === NEW_PERSON) {
    const name = draft.newPersonName.trim();
    if (name === '') errors.newPersonName = 'Enter who this prescription is for.';
    else if (name.length > DRAFT_LIMITS.personName) errors.newPersonName = `Keep the name to ${DRAFT_LIMITS.personName} characters or fewer.`;
  }

  const medicineName = draft.medicineName.trim();
  if (medicineName === '') errors.medicineName = 'Enter the medicine name.';
  else if (medicineName.length > DRAFT_LIMITS.medicineName) errors.medicineName = `Keep the name to ${DRAFT_LIMITS.medicineName} characters or fewer.`;

  if (draft.strength.trim().length > DRAFT_LIMITS.strength) {
    errors.strength = `Keep the strength to ${DRAFT_LIMITS.strength} characters or fewer.`;
  }

  if (draft.doseAmount.trim() === '' || !Number.isFinite(amount) || amount <= 0) {
    errors.doseAmount = 'Enter a dose amount greater than 0.';
  } else if (amount > DRAFT_LIMITS.maxDoseAmount) {
    errors.doseAmount = `Enter a dose amount of ${DRAFT_LIMITS.maxDoseAmount} or less.`;
  }

  if (draft.times.some((time) => !isTimeOfDay(time))) {
    errors.times = 'Enter a time for every dose.';
  } else if (new Set(draft.times).size !== draft.times.length) {
    errors.times = 'Each dose needs a different time.';
  }

  if (!draft.everyDay && draft.daysOfWeek.length === 0) errors.daysOfWeek = 'Choose at least one day.';

  if (!isDateKey(draft.startDate)) errors.startDate = 'Enter a start date.';
  if (draft.endDate !== '') {
    if (!isDateKey(draft.endDate)) errors.endDate = 'Enter a valid end date, or leave it empty.';
    else if (isDateKey(draft.startDate) && draft.endDate < draft.startDate) errors.endDate = 'The end date must be on or after the start date.';
  }

  if (draft.notes.trim().length > DRAFT_LIMITS.notes) errors.notes = `Keep notes to ${DRAFT_LIMITS.notes} characters or fewer.`;

  return errors;
}

interface BuildOptions {
  personId: string;
  existing: Prescription | undefined;
  now: Date;
}

/** Turns a validated draft into a stored prescription, keeping identity and history of an edited one. */
export function buildPrescription(draft: PrescriptionDraft, { personId, existing, now }: BuildOptions): Prescription {
  const timestamp = now.toISOString();
  return {
    id: existing?.id ?? crypto.randomUUID(),
    personId,
    medicineName: draft.medicineName.trim(),
    strength: draft.strength.trim(),
    form: draft.form,
    doseAmount: Number(draft.doseAmount),
    times: sortTimes(draft.times),
    daysOfWeek: draft.everyDay ? [...ALL_DAYS] : sortDays(draft.daysOfWeek),
    startDate: draft.startDate,
    endDate: draft.endDate === '' ? null : draft.endDate,
    notes: draft.notes.trim(),
    color: draft.color,
    archivedAt: existing?.archivedAt ?? null,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}
