import type { CSSProperties } from 'react';
import { adherenceRatio, type PrescriptionAdherence } from '../lib/adherence';
import { formatPercent } from '../lib/formatters';
import { ColorDot } from './ColorDot';

interface PrescriptionAdherenceListProps {
  entries: readonly PrescriptionAdherence[];
  showPerson: boolean;
}

export function PrescriptionAdherenceList({ entries, showPerson }: PrescriptionAdherenceListProps) {
  return (
    <ul className="adherence-list">
      {entries.map(({ prescription, person, tally }) => {
        const ratio = adherenceRatio(tally) ?? 0;
        const barStyle = { '--progress': ratio } as CSSProperties;
        return (
          <li key={prescription.id} className="adherence-row card">
            <div className="adherence-row__header">
              <ColorDot color={prescription.color} />
              <p className="adherence-row__name">
                {prescription.medicineName}
                {showPerson && person !== undefined && <span className="adherence-row__person"> · {person.name}</span>}
              </p>
              <p className="adherence-row__percent">{formatPercent(ratio)}</p>
            </div>
            <div className="progress-track" style={barStyle} aria-hidden="true">
              <div className="progress-track__fill" />
            </div>
            <p className="adherence-row__counts">
              {tally.taken} of {tally.counted} taken
              {tally.skipped > 0 && `, ${tally.skipped} skipped`}
              {tally.missed > 0 && `, ${tally.missed} not logged`}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
