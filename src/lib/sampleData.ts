import { addDays, toDateKey } from './dateKeys';
import { OVERDUE_AFTER_MINUTES } from './doseTiming';
import { indexLogs, occurrencesForDay } from './schedule';
import { createSeededRandom } from './seededRandom';
import type { DateKey, DayOfWeek, DoseLog, Person, Prescription, TrackerData } from './types';
import { ALL_DAYS } from './weekdays';

const SAMPLE_SEED = 20210614;
const HISTORY_DAYS = 7;
/** Rough real-world shape of the demo week: most doses taken, a few skipped, a few forgotten. */
const TAKEN_SHARE = 0.86;
const SKIPPED_SHARE = 0.06;
/** Doses are logged up to this long after their time, like a real person would. */
const MAX_LOG_DELAY_MINUTES = 25;
const MS_PER_MINUTE = 60_000;

const MONDAY: DayOfWeek = 1;
const WEDNESDAY: DayOfWeek = 3;
const FRIDAY: DayOfWeek = 5;

interface SampleRecipe {
  person: 'me' | 'mum';
  medicineName: string;
  strength: string;
  form: Prescription['form'];
  doseAmount: number;
  times: string[];
  daysOfWeek: readonly DayOfWeek[];
  /** Relative to today. */
  startOffsetDays: number;
  endOffsetDays: number | null;
  archivedOffsetDays: number | null;
  notes: string;
  color: Prescription['color'];
}

// Fictional household, common over-the-counter style products. Not dosing guidance.
const RECIPES: readonly SampleRecipe[] = [
  {
    person: 'me', medicineName: 'Vitamin D3', strength: '1000 IU', form: 'capsule', doseAmount: 1,
    times: ['08:00'], daysOfWeek: ALL_DAYS, startOffsetDays: -60, endOffsetDays: null, archivedOffsetDays: null,
    notes: 'With breakfast.', color: 'amber',
  },
  {
    person: 'me', medicineName: 'Omega-3 fish oil', strength: '1000 mg', form: 'capsule', doseAmount: 1,
    times: ['13:00'], daysOfWeek: ALL_DAYS, startOffsetDays: -45, endOffsetDays: null, archivedOffsetDays: null,
    notes: 'With lunch.', color: 'sky',
  },
  {
    person: 'me', medicineName: 'Paracetamol', strength: '500 mg', form: 'tablet', doseAmount: 2,
    times: ['08:00', '14:00', '20:00'], daysOfWeek: ALL_DAYS, startOffsetDays: -4, endOffsetDays: 2, archivedOffsetDays: null,
    notes: 'Short course for a sprained ankle. Take with water.', color: 'rose',
  },
  {
    person: 'me', medicineName: 'Cetirizine', strength: '10 mg', form: 'tablet', doseAmount: 1,
    times: ['21:30'], daysOfWeek: ALL_DAYS, startOffsetDays: -20, endOffsetDays: null, archivedOffsetDays: null,
    notes: 'Hay fever season.', color: 'lime',
  },
  {
    person: 'mum', medicineName: 'Calcium + vitamin D', strength: '600 mg', form: 'tablet', doseAmount: 1,
    times: ['09:00', '21:00'], daysOfWeek: ALL_DAYS, startOffsetDays: -90, endOffsetDays: null, archivedOffsetDays: null,
    notes: '', color: 'sand',
  },
  {
    person: 'mum', medicineName: 'Lubricating eye drops', strength: '0.3%', form: 'drops', doseAmount: 2,
    times: ['08:30', '13:00', '18:00'], daysOfWeek: ALL_DAYS, startOffsetDays: -30, endOffsetDays: null, archivedOffsetDays: null,
    notes: 'One drop in each eye.', color: 'teal',
  },
  {
    person: 'mum', medicineName: 'Magnesium', strength: '250 mg', form: 'tablet', doseAmount: 1,
    times: ['21:00'], daysOfWeek: [MONDAY, WEDNESDAY, FRIDAY], startOffsetDays: -30, endOffsetDays: null, archivedOffsetDays: null,
    notes: '', color: 'violet',
  },
  {
    person: 'mum', medicineName: 'Cough syrup', strength: '', form: 'liquid', doseAmount: 10,
    times: ['08:00', '20:00'], daysOfWeek: ALL_DAYS, startOffsetDays: -21, endOffsetDays: -14, archivedOffsetDays: -13,
    notes: 'Finished.', color: 'slate',
  },
];

/** A plausible mid-morning timestamp on a sample day, for createdAt, updatedAt and archivedAt. */
function sampleTimestampOn(day: DateKey): string {
  return new Date(`${day}T09:00:00`).toISOString();
}

/**
 * A believable household: two people, everyday supplements and a short paracetamol course, with the
 * past week of doses logged (mostly taken, some skipped or forgotten) so History has something real
 * to show. Today's doses up to an hour ago are logged too; the rest are left for the visitor.
 */
export function buildSampleData(now: Date): TrackerData {
  const today = toDateKey(now);
  const random = createSeededRandom(SAMPLE_SEED);
  const createdAt = sampleTimestampOn(addDays(today, -90));

  const me: Person = { id: crypto.randomUUID(), name: 'Me', createdAt };
  const mum: Person = { id: crypto.randomUUID(), name: 'Mum', createdAt: new Date(Date.parse(createdAt) + MS_PER_MINUTE).toISOString() };
  const people = [me, mum];

  const prescriptions: Prescription[] = RECIPES.map((recipe) => {
    const startDate = addDays(today, recipe.startOffsetDays);
    return {
      id: crypto.randomUUID(),
      personId: recipe.person === 'me' ? me.id : mum.id,
      medicineName: recipe.medicineName,
      strength: recipe.strength,
      form: recipe.form,
      doseAmount: recipe.doseAmount,
      times: [...recipe.times],
      daysOfWeek: [...recipe.daysOfWeek],
      startDate,
      endDate: recipe.endOffsetDays === null ? null : addDays(today, recipe.endOffsetDays),
      notes: recipe.notes,
      color: recipe.color,
      archivedAt: recipe.archivedOffsetDays === null ? null : sampleTimestampOn(addDays(today, recipe.archivedOffsetDays)),
      createdAt: sampleTimestampOn(startDate),
      updatedAt: sampleTimestampOn(startDate),
    };
  });

  const doseLogs: DoseLog[] = [];
  const sources = { prescriptions, people, logsById: indexLogs([]) };
  const loggedUntil = now.getTime() - OVERDUE_AFTER_MINUTES * MS_PER_MINUTE;

  for (let offset = -(HISTORY_DAYS - 1); offset <= 0; offset += 1) {
    for (const occurrence of occurrencesForDay(addDays(today, offset), sources)) {
      if (occurrence.scheduledAt.getTime() > loggedUntil) continue;
      const roll = random();
      if (roll >= TAKEN_SHARE + SKIPPED_SHARE) continue;
      const delay = Math.round(random() * MAX_LOG_DELAY_MINUTES) * MS_PER_MINUTE;
      doseLogs.push({
        id: occurrence.key,
        prescriptionId: occurrence.prescription.id,
        date: occurrence.date,
        time: occurrence.time,
        status: roll < TAKEN_SHARE ? 'taken' : 'skipped',
        recordedAt: new Date(Math.min(occurrence.scheduledAt.getTime() + delay, now.getTime())).toISOString(),
      });
    }
  }

  return { people, prescriptions, doseLogs };
}
