import { formatLongWeekday, formatShortWeekday } from '../lib/formatters';
import type { DayOfWeek } from '../lib/types';
import { WEEK_ORDER } from '../lib/weekdays';
import { FieldError } from './FieldError';

interface DaysFieldProps {
  everyDay: boolean;
  days: readonly DayOfWeek[];
  onEveryDayChange: (everyDay: boolean) => void;
  onDaysChange: (days: DayOfWeek[]) => void;
  error: string | undefined;
}

const ERROR_ID = 'rx-days-error';
export const firstDayFieldId = `rx-day-${WEEK_ORDER[0]}`;

export function DaysField({ everyDay, days, onEveryDayChange, onDaysChange, error }: DaysFieldProps) {
  const toggleDay = (day: DayOfWeek, checked: boolean) =>
    onDaysChange(checked ? [...days, day] : days.filter((existing) => existing !== day));

  return (
    <fieldset className="field-group" aria-describedby={error === undefined ? undefined : ERROR_ID}>
      <legend className="field-group__legend">Days</legend>
      <div className="choice-row">
        <label className="choice">
          <input type="radio" name="rx-days-mode" checked={everyDay} onChange={() => onEveryDayChange(true)} />
          <span>Every day</span>
        </label>
        <label className="choice">
          <input type="radio" name="rx-days-mode" checked={!everyDay} onChange={() => onEveryDayChange(false)} />
          <span>Only on some days</span>
        </label>
      </div>
      {!everyDay && (
        <div className="day-picker">
          {WEEK_ORDER.map((day) => (
            <label key={day} className="day-toggle">
              <input
                id={`rx-day-${day}`}
                type="checkbox"
                checked={days.includes(day)}
                onChange={(event) => toggleDay(day, event.target.checked)}
              />
              <span aria-hidden="true">{formatShortWeekday(day)}</span>
              <span className="visually-hidden">{formatLongWeekday(day)}</span>
            </label>
          ))}
        </div>
      )}
      <FieldError id={ERROR_ID} message={error} />
    </fieldset>
  );
}
