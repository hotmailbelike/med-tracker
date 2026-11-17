import { useState, type FormEvent } from 'react';
import { useAppData } from '../hooks/useAppData';
import { DRAFT_LIMITS } from '../lib/prescriptionDraft';
import type { Person, Prescription } from '../lib/types';
import { ConfirmDialog } from './ConfirmDialog';
import { PersonRow } from './PersonRow';
import { SettingsSection } from './SettingsSection';

interface PeoplePanelProps {
  people: readonly Person[];
  prescriptions: readonly Prescription[];
}

const NEW_PERSON_INPUT_ID = 'new-person-name';

export function PeoplePanel({ people, prescriptions }: PeoplePanelProps) {
  const { actions } = useAppData();
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [personToRemove, setPersonToRemove] = useState<Person | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const countFor = (personId: string) => prescriptions.filter((prescription) => prescription.personId === personId).length;

  const addPerson = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newName.trim();
    if (name === '') {
      setAddError('Enter a name.');
      return;
    }
    setAddError(null);
    const saved = await actions.savePerson({ id: crypto.randomUUID(), name, createdAt: new Date().toISOString() });
    if (saved) setNewName('');
  };

  const confirmRemove = async () => {
    if (personToRemove === null) return;
    setIsRemoving(true);
    await actions.deletePerson(personToRemove);
    setIsRemoving(false);
    setPersonToRemove(null);
  };

  const removeCount = personToRemove === null ? 0 : countFor(personToRemove.id);

  return (
    <SettingsSection title="People" description={<p>Track medicines for yourself and anyone you care for.</p>}>
      {people.length > 0 && (
        <ul className="person-list">
          {people.map((person) => (
            <PersonRow key={person.id} person={person} prescriptionCount={countFor(person.id)} onRemove={setPersonToRemove} />
          ))}
        </ul>
      )}

      <form className="inline-form" onSubmit={(event) => void addPerson(event)} noValidate>
        <label htmlFor={NEW_PERSON_INPUT_ID} className="visually-hidden">
          Name of person to add
        </label>
        <input
          id={NEW_PERSON_INPUT_ID}
          className="input"
          type="text"
          placeholder="Add a person, e.g. Dad"
          value={newName}
          maxLength={DRAFT_LIMITS.personName}
          aria-invalid={addError === null ? undefined : true}
          aria-describedby={addError === null ? undefined : `${NEW_PERSON_INPUT_ID}-error`}
          onChange={(event) => setNewName(event.target.value)}
        />
        <button type="submit" className="button button--secondary button--small">
          Add person
        </button>
      </form>
      {addError !== null && (
        <p id={`${NEW_PERSON_INPUT_ID}-error`} className="field-error">
          {addError}
        </p>
      )}

      <ConfirmDialog
        isOpen={personToRemove !== null}
        title={`Remove ${personToRemove?.name ?? 'person'}?`}
        confirmLabel="Remove"
        tone="danger"
        isBusy={isRemoving}
        onConfirm={() => void confirmRemove()}
        onCancel={() => setPersonToRemove(null)}
      >
        <p>
          {removeCount === 0
            ? 'They have no prescriptions.'
            : `Their ${removeCount === 1 ? 'prescription' : `${removeCount} prescriptions`} and all dose history will be deleted too.`}{' '}
          This cannot be undone.
        </p>
      </ConfirmDialog>
    </SettingsSection>
  );
}
