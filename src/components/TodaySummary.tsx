import type { CSSProperties } from 'react';
import { formatRelativeMinutes, formatTimeOfDay } from '../lib/formatters';
import { minutesUntil } from '../lib/doseTiming';
import type { TimelineSection } from '../lib/groupTimeline';

interface TodaySummaryProps {
  sections: readonly TimelineSection[];
  now: Date;
}

export function TodaySummary({ sections, now }: TodaySummaryProps) {
  const doses = sections.flatMap((section) => section.slots.flatMap((slot) => slot.doses));
  const total = doses.length;
  const taken = doses.filter((dose) => dose.state === 'taken').length;
  const skipped = doses.filter((dose) => dose.state === 'skipped').length;
  const overdue = doses.filter((dose) => dose.state === 'overdue').length;
  const next = doses.find((dose) => dose.state === 'due' || dose.state === 'upcoming');
  const progressStyle = { '--progress': total === 0 ? 0 : taken / total } as CSSProperties;

  return (
    <section className="today-summary card" aria-label="Today's progress">
      <p className="today-summary__headline">
        <span className="today-summary__count">{taken}</span> of {total} {total === 1 ? 'dose' : 'doses'} taken
      </p>
      <div className="progress-track" style={progressStyle} aria-hidden="true">
        <div className="progress-track__fill" />
      </div>
      <ul className="today-summary__facts">
        {overdue > 0 && <li className="today-summary__fact--alert">{overdue} overdue</li>}
        {skipped > 0 && <li>{skipped} skipped</li>}
        {next !== undefined ? (
          <li>
            Next: {next.occurrence.prescription.medicineName} at {formatTimeOfDay(next.occurrence.time)} (
            {formatRelativeMinutes(minutesUntil(next.occurrence, now))})
          </li>
        ) : (
          <li>No more doses due today</li>
        )}
      </ul>
    </section>
  );
}
