import { useRef, useState, type FormEvent } from 'react';
import { useAppData } from '../hooks/useAppData';
import { MEDICINE_FORM_DETAILS, unitLabel } from '../lib/medicineForms';
import { navigate } from '../lib/navigation';
import {
  buildPrescription,
  DRAFT_LIMITS,
  NEW_PERSON,
  validateDraft,
  type DraftErrors,
  type DraftField,
  type PrescriptionDraft,
} from '../lib/prescriptionDraft';
import { PATHS } from '../lib/routes';
import { MEDICINE_FORMS, type MedicineForm, type Person, type Prescription } from '../lib/types';
import { ColorField } from './ColorField';
import { DaysField, firstDayFieldId } from './DaysField';
import { FieldError } from './FieldError';
import { FormErrorSummary, type SummaryError } from './FormErrorSummary';
import { NavLink } from './NavLink';
import { TimesField } from './TimesField';

const FIELD_IDS: Record<DraftField, string> = {
  personId: 'rx-person',
  newPersonName: 'rx-new-person',
  medicineName: 'rx-medicine',
  strength: 'rx-strength',
  doseAmount: 'rx-dose',
  times: 'rx-time-0',
  daysOfWeek: firstDayFieldId,
  startDate: 'rx-start',
  endDate: 'rx-end',
  notes: 'rx-notes',
};
/** Summary order follows the order of the fields on screen. */
const FIELD_ORDER = Object.keys(FIELD_IDS) as DraftField[];
const DOSE_STEP = 0.25;

const errorId = (field: DraftField) => `${FIELD_IDS[field]}-error`;

interface PrescriptionFormProps {
  people: readonly Person[];
  initialDraft: PrescriptionDraft;
  existing: Prescription | undefined;
}

export function PrescriptionForm({ people, initialDraft, existing }: PrescriptionFormProps) {
  const { actions } = useAppData();
  const [draft, setDraft] = useState(initialDraft);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Errors appear after the first save attempt, then update live as the user fixes them.
  const errors: DraftErrors = hasTriedSubmit ? validateDraft(draft) : {};
  const summaryErrors: SummaryError[] = FIELD_ORDER.flatMap((field) => {
    const message = errors[field];
    return message === undefined ? [] : [{ fieldId: FIELD_IDS[field], message }];
  });

  const update = <K extends keyof PrescriptionDraft>(key: K, value: PrescriptionDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const fieldProps = (field: DraftField) => ({
    id: FIELD_IDS[field],
    'aria-invalid': errors[field] === undefined ? undefined : true,
    'aria-describedby': errors[field] === undefined ? undefined : errorId(field),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasTriedSubmit(true);
    if (Object.keys(validateDraft(draft)).length > 0) {
      // Wait for the summary to render before moving focus to it.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    const now = new Date();
    const newPerson: Person | undefined =
      draft.personId === NEW_PERSON
        ? { id: crypto.randomUUID(), name: draft.newPersonName.trim(), createdAt: now.toISOString() }
        : undefined;
    const prescription = buildPrescription(draft, { personId: newPerson?.id ?? draft.personId, existing, now });

    setIsSaving(true);
    const saved = await actions.savePrescription(prescription, newPerson);
    setIsSaving(false);
    if (saved) navigate(PATHS.medications, { replace: true });
  };

  return (
    <form className="form card" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <FormErrorSummary ref={summaryRef} errors={summaryErrors} />

      <div className="field">
        <label htmlFor={FIELD_IDS.personId} className="field__label">
          For
        </label>
        <select
          {...fieldProps('personId')}
          className="input"
          value={draft.personId}
          onChange={(event) => update('personId', event.target.value)}
        >
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
          <option value={NEW_PERSON}>New person…</option>
        </select>
      </div>

      {draft.personId === NEW_PERSON && (
        <div className="field">
          <label htmlFor={FIELD_IDS.newPersonName} className="field__label">
            Name
          </label>
          <input
            {...fieldProps('newPersonName')}
            className="input"
            type="text"
            autoComplete="off"
            maxLength={DRAFT_LIMITS.personName}
            value={draft.newPersonName}
            onChange={(event) => update('newPersonName', event.target.value)}
          />
          <FieldError id={errorId('newPersonName')} message={errors.newPersonName} />
        </div>
      )}

      <div className="field">
        <label htmlFor={FIELD_IDS.medicineName} className="field__label">
          Medicine name
        </label>
        <input
          {...fieldProps('medicineName')}
          className="input"
          type="text"
          autoComplete="off"
          autoCapitalize="words"
          maxLength={DRAFT_LIMITS.medicineName}
          value={draft.medicineName}
          onChange={(event) => update('medicineName', event.target.value)}
        />
        <FieldError id={errorId('medicineName')} message={errors.medicineName} />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor={FIELD_IDS.strength} className="field__label">
            Strength <span className="field__optional">(optional)</span>
          </label>
          <input
            {...fieldProps('strength')}
            className="input"
            type="text"
            autoComplete="off"
            placeholder="e.g. 500 mg"
            maxLength={DRAFT_LIMITS.strength}
            value={draft.strength}
            onChange={(event) => update('strength', event.target.value)}
          />
          <FieldError id={errorId('strength')} message={errors.strength} />
        </div>
        <div className="field">
          <label htmlFor="rx-form" className="field__label">
            Form
          </label>
          <select
            id="rx-form"
            className="input"
            value={draft.form}
            onChange={(event) => update('form', event.target.value as MedicineForm)}
          >
            {MEDICINE_FORMS.map((form) => (
              <option key={form} value={form}>
                {MEDICINE_FORM_DETAILS[form].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor={FIELD_IDS.doseAmount} className="field__label">
          Dose amount
        </label>
        <div className="input-with-unit">
          <input
            {...fieldProps('doseAmount')}
            className="input input--narrow"
            type="number"
            inputMode="decimal"
            min={DOSE_STEP}
            max={DRAFT_LIMITS.maxDoseAmount}
            step={DOSE_STEP}
            value={draft.doseAmount}
            onChange={(event) => update('doseAmount', event.target.value)}
          />
          <span className="input-with-unit__unit">{unitLabel(draft.form)} per dose</span>
        </div>
        <FieldError id={errorId('doseAmount')} message={errors.doseAmount} />
      </div>

      <TimesField
        times={draft.times}
        onChange={(times) => update('times', times)}
        error={errors.times}
        firstTimeId={FIELD_IDS.times}
      />

      <DaysField
        everyDay={draft.everyDay}
        days={draft.daysOfWeek}
        onEveryDayChange={(everyDay) => update('everyDay', everyDay)}
        onDaysChange={(days) => update('daysOfWeek', days)}
        error={errors.daysOfWeek}
      />

      <div className="field-row">
        <div className="field">
          <label htmlFor={FIELD_IDS.startDate} className="field__label">
            Start date
          </label>
          <input
            {...fieldProps('startDate')}
            className="input"
            type="date"
            value={draft.startDate}
            onChange={(event) => update('startDate', event.target.value)}
          />
          <FieldError id={errorId('startDate')} message={errors.startDate} />
        </div>
        <div className="field">
          <label htmlFor={FIELD_IDS.endDate} className="field__label">
            End date <span className="field__optional">(optional)</span>
          </label>
          <input
            {...fieldProps('endDate')}
            className="input"
            type="date"
            min={draft.startDate}
            value={draft.endDate}
            onChange={(event) => update('endDate', event.target.value)}
          />
          <FieldError id={errorId('endDate')} message={errors.endDate} />
        </div>
      </div>

      <ColorField value={draft.color} onChange={(color) => update('color', color)} />

      <div className="field">
        <label htmlFor={FIELD_IDS.notes} className="field__label">
          Notes <span className="field__optional">(optional)</span>
        </label>
        <textarea
          {...fieldProps('notes')}
          className="input input--textarea"
          rows={3}
          maxLength={DRAFT_LIMITS.notes}
          placeholder="e.g. Take with food"
          value={draft.notes}
          onChange={(event) => update('notes', event.target.value)}
        />
        <FieldError id={errorId('notes')} message={errors.notes} />
      </div>

      <div className="form__actions">
        <button type="submit" className="button button--primary" disabled={isSaving}>
          {isSaving ? 'Saving…' : existing === undefined ? 'Create prescription' : 'Save changes'}
        </button>
        <NavLink href={PATHS.medications} className="button button--ghost">
          Cancel
        </NavLink>
      </div>
    </form>
  );
}
