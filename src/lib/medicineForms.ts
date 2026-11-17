import type { MedicineForm } from './types';

interface FormDetails {
  label: string;
  /** The unit a dose is counted in, singular and plural. */
  unit: { one: string; other: string };
}

export const MEDICINE_FORM_DETAILS: Record<MedicineForm, FormDetails> = {
  tablet: { label: 'Tablet', unit: { one: 'tablet', other: 'tablets' } },
  capsule: { label: 'Capsule', unit: { one: 'capsule', other: 'capsules' } },
  liquid: { label: 'Liquid', unit: { one: 'ml', other: 'ml' } },
  drops: { label: 'Drops', unit: { one: 'drop', other: 'drops' } },
  inhaler: { label: 'Inhaler', unit: { one: 'puff', other: 'puffs' } },
  injection: { label: 'Injection', unit: { one: 'ml', other: 'ml' } },
};

const pluralRules = new Intl.PluralRules('en');
const amountFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

/** "2 tablets", "0.5 tablet", "5 ml". */
export function formatDose(amount: number, form: MedicineForm): string {
  const { unit } = MEDICINE_FORM_DETAILS[form];
  const word = pluralRules.select(amount) === 'one' ? unit.one : unit.other;
  return `${amountFormatter.format(amount)} ${word}`;
}

export function unitLabel(form: MedicineForm): string {
  return MEDICINE_FORM_DETAILS[form].unit.other;
}
