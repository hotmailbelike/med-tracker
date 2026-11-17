import { DRAFT_LIMITS, resizeTimes } from '../lib/prescriptionDraft';
import { FieldError } from './FieldError';

interface TimesFieldProps {
  times: readonly string[];
  onChange: (times: string[]) => void;
  error: string | undefined;
  /** Id of the first time input, which the error summary links to. */
  firstTimeId: string;
}

const COUNT_OPTIONS = Array.from({ length: DRAFT_LIMITS.maxTimesPerDay }, (_, index) => index + 1);
const ERROR_ID = 'rx-times-error';

export function TimesField({ times, onChange, error, firstTimeId }: TimesFieldProps) {
  const updateTime = (index: number, value: string) => onChange(times.map((time, i) => (i === index ? value : time)));

  return (
    <fieldset className="field-group" aria-describedby={error === undefined ? undefined : ERROR_ID}>
      <legend className="field-group__legend">Times</legend>
      <div className="field">
        <label htmlFor="rx-times-per-day" className="field__label">
          Doses per day
        </label>
        <select
          id="rx-times-per-day"
          className="input input--narrow"
          value={times.length}
          onChange={(event) => onChange(resizeTimes(times, Number(event.target.value)))}
        >
          {COUNT_OPTIONS.map((count) => (
            <option key={count} value={count}>
              {count === 1 ? 'Once a day' : `${count} times a day`}
            </option>
          ))}
        </select>
      </div>
      <ol className="times-grid">
        {times.map((time, index) => {
          const id = index === 0 ? firstTimeId : `rx-time-${index}`;
          return (
            <li key={index} className="field">
              <label htmlFor={id} className="field__label">
                Dose {index + 1}
              </label>
              <input
                id={id}
                type="time"
                className="input"
                value={time}
                required
                aria-invalid={error === undefined ? undefined : true}
                onChange={(event) => updateTime(index, event.target.value)}
              />
            </li>
          );
        })}
      </ol>
      <FieldError id={ERROR_ID} message={error} />
    </fieldset>
  );
}
