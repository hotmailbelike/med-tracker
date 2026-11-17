import { useEffect, useRef, useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { minutesUntil, type DoseState } from '../lib/doseTiming';
import { formatClockTime, formatRelativeMinutes, formatTimeOfDay } from '../lib/formatters';
import type { TimelineDose } from '../lib/groupTimeline';
import { formatDose } from '../lib/medicineForms';
import type { DoseOccurrence } from '../lib/schedule';
import type { DoseLogStatus } from '../lib/types';
import { ColorDot } from './ColorDot';

interface DoseCardProps {
  dose: TimelineDose;
  now: Date;
  showPerson: boolean;
}

function describeState(state: DoseState, occurrence: DoseOccurrence, now: Date): string {
  const relative = formatRelativeMinutes(minutesUntil(occurrence, now));
  switch (state) {
    case 'taken':
      return occurrence.log === undefined ? 'Taken' : `Taken at ${formatClockTime(new Date(occurrence.log.recordedAt))}`;
    case 'skipped':
      return 'Skipped';
    case 'overdue':
      return `Overdue, was due ${relative}`;
    case 'due':
    case 'upcoming':
      return `Due ${relative}`;
  }
}

export function DoseCard({ dose, now, showPerson }: DoseCardProps) {
  const { actions } = useAppData();
  const [isSaving, setIsSaving] = useState(false);
  const { occurrence, state } = dose;
  const { prescription } = occurrence;
  const isLogged = occurrence.log !== undefined;
  const accessibleSuffix = `: ${prescription.medicineName}, ${formatTimeOfDay(occurrence.time)}`;

  // Logging swaps Taken/Skip for Undo (and back). Without this, focus would fall to the page body
  // and keyboard and screen reader users would lose their place in the list.
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocus = useRef(false);
  useEffect(() => {
    if (!shouldRestoreFocus.current) return;
    shouldRestoreFocus.current = false;
    firstActionRef.current?.focus();
  }, [isLogged]);

  const save = async (write: () => Promise<boolean>) => {
    setIsSaving(true);
    // Armed before the write: the re-render that swaps the buttons can land before `await` resumes.
    shouldRestoreFocus.current = true;
    const saved = await write();
    if (!saved) shouldRestoreFocus.current = false;
    setIsSaving(false);
  };
  const record = (status: DoseLogStatus) => save(() => actions.recordDose(occurrence, status));

  return (
    <li className={`dose-card dose-card--${state}`}>
      <ColorDot color={prescription.color} />
      <div className="dose-card__body">
        <p className="dose-card__name">
          {prescription.medicineName}
          {prescription.strength !== '' && <span className="dose-card__strength"> {prescription.strength}</span>}
        </p>
        <p className="dose-card__meta">
          {formatDose(prescription.doseAmount, prescription.form)}
          {showPerson && occurrence.person !== undefined && <> · {occurrence.person.name}</>}
        </p>
        {prescription.notes !== '' && <p className="dose-card__notes">{prescription.notes}</p>}
        <p className={`dose-state dose-state--${state}`}>{describeState(state, occurrence, now)}</p>
      </div>
      <div className="dose-card__actions">
        {!isLogged ? (
          <>
            <button
              ref={firstActionRef}
              type="button"
              className="button button--primary button--small"
              disabled={isSaving}
              onClick={() => void record('taken')}
            >
              Taken<span className="visually-hidden">{accessibleSuffix}</span>
            </button>
            <button
              type="button"
              className="button button--secondary button--small"
              disabled={isSaving}
              onClick={() => void record('skipped')}
            >
              Skip<span className="visually-hidden">{accessibleSuffix}</span>
            </button>
          </>
        ) : (
          <button
            ref={firstActionRef}
            type="button"
            className="button button--ghost button--small"
            disabled={isSaving}
            onClick={() => void save(() => actions.undoDose(occurrence))}
          >
            Undo<span className="visually-hidden">{accessibleSuffix}</span>
          </button>
        )}
      </div>
    </li>
  );
}
