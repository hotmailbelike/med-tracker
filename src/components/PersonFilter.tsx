import { useId } from 'react';
import { EVERYONE } from '../lib/personFilter';
import type { Person } from '../lib/types';

interface PersonFilterProps {
  people: readonly Person[];
  value: string;
  onChange: (value: string) => void;
}

/** Native radios styled as pills: arrow keys, labels and focus all work without extra code. */
export function PersonFilter({ people, value, onChange }: PersonFilterProps) {
  const name = useId();
  if (people.length < 2) return null;

  const options = [{ id: EVERYONE, name: 'Everyone' }, ...people];
  return (
    <fieldset className="pill-group">
      <legend className="visually-hidden">Show doses for</legend>
      {options.map((option) => (
        <label key={option.id} className="pill">
          <input
            type="radio"
            name={name}
            value={option.id}
            checked={value === option.id}
            onChange={() => onChange(option.id)}
          />
          <span>{option.name}</span>
        </label>
      ))}
    </fieldset>
  );
}
