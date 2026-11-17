import { useState, type FormEvent } from 'react';
import { useAppData } from '../hooks/useAppData';
import { DRAFT_LIMITS } from '../lib/prescriptionDraft';
import type { Person } from '../lib/types';

interface PersonRowProps {
  person: Person;
  prescriptionCount: number;
  onRemove: (person: Person) => void;
}

export function PersonRow({ person, prescriptionCount, onRemove }: PersonRowProps) {
  const { actions } = useAppData();
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(person.name);
  const [error, setError] = useState<string | null>(null);
  const inputId = `rename-${person.id}`;

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '') {
      setError('Enter a name.');
      return;
    }
    if (await actions.savePerson({ ...person, name: trimmed })) setIsRenaming(false);
  };

  const cancel = () => {
    setName(person.name);
    setError(null);
    setIsRenaming(false);
  };

  if (isRenaming) {
    return (
      <li className="person-row">
        <form className="inline-form" onSubmit={(event) => void save(event)} noValidate>
          <label htmlFor={inputId} className="visually-hidden">
            New name for {person.name}
          </label>
          <input
            id={inputId}
            className="input"
            type="text"
            value={name}
            maxLength={DRAFT_LIMITS.personName}
            autoFocus
            aria-invalid={error === null ? undefined : true}
            aria-describedby={error === null ? undefined : `${inputId}-error`}
            onChange={(event) => setName(event.target.value)}
          />
          <button type="submit" className="button button--primary button--small">
            Save
          </button>
          <button type="button" className="button button--ghost button--small" onClick={cancel}>
            Cancel
          </button>
        </form>
        {error !== null && (
          <p id={`${inputId}-error`} className="field-error">
            {error}
          </p>
        )}
      </li>
    );
  }

  return (
    <li className="person-row">
      <div className="person-row__text">
        <p className="person-row__name">{person.name}</p>
        <p className="person-row__meta">
          {prescriptionCount} {prescriptionCount === 1 ? 'prescription' : 'prescriptions'}
        </p>
      </div>
      <div className="person-row__actions">
        <button type="button" className="button button--ghost button--small" onClick={() => setIsRenaming(true)}>
          Rename<span className="visually-hidden"> {person.name}</span>
        </button>
        <button type="button" className="button button--ghost button--small" onClick={() => onRemove(person)}>
          Remove<span className="visually-hidden"> {person.name}</span>
        </button>
      </div>
    </li>
  );
}
