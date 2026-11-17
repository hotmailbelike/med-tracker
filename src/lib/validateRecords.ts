import { isDateKey } from './dateKeys';
import { isTimeOfDay } from './timeOfDay';
import {
  DOSE_LOG_STATUSES,
  MEDICINE_FORMS,
  PRESCRIPTION_COLORS,
  type DoseLog,
  type Person,
  type Prescription,
} from './types';
import { isDayOfWeek } from './weekdays';

// Runtime guards for data that comes from outside the app's own writes (an imported backup file).

type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const isString = (value: unknown): value is string => typeof value === 'string';
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.trim() !== '';

function isTimestamp(value: unknown): value is string {
  return isString(value) && !Number.isNaN(Date.parse(value));
}

function isOneOf<T extends string>(options: readonly T[], value: unknown): value is T {
  return isString(value) && (options as readonly string[]).includes(value);
}

export function isPerson(value: unknown): value is Person {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.name) && isTimestamp(value.createdAt);
}

export function isPrescription(value: unknown): value is Prescription {
  if (!isRecord(value)) return false;
  const { times, daysOfWeek, doseAmount, endDate, archivedAt } = value;
  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.personId) &&
    isNonEmptyString(value.medicineName) &&
    isString(value.strength) &&
    isOneOf(MEDICINE_FORMS, value.form) &&
    typeof doseAmount === 'number' &&
    Number.isFinite(doseAmount) &&
    doseAmount > 0 &&
    Array.isArray(times) &&
    times.length > 0 &&
    times.every(isTimeOfDay) &&
    Array.isArray(daysOfWeek) &&
    daysOfWeek.length > 0 &&
    daysOfWeek.every(isDayOfWeek) &&
    isDateKey(value.startDate) &&
    (endDate === null || isDateKey(endDate)) &&
    isString(value.notes) &&
    isOneOf(PRESCRIPTION_COLORS, value.color) &&
    (archivedAt === null || isTimestamp(archivedAt)) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt)
  );
}

export function isDoseLog(value: unknown): value is DoseLog {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.prescriptionId) &&
    isDateKey(value.date) &&
    isTimeOfDay(value.time) &&
    isOneOf(DOSE_LOG_STATUSES, value.status) &&
    isTimestamp(value.recordedAt)
  );
}
