import { useMemo } from 'react';
import { DailyAdherenceChart } from '../components/DailyAdherenceChart';
import { NavLink } from '../components/NavLink';
import { PersonFilter } from '../components/PersonFilter';
import { PrescriptionAdherenceList } from '../components/PrescriptionAdherenceList';
import { StatTile } from '../components/StatTile';
import { StatusPanel } from '../components/StatusPanel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { adherenceRatio, buildAdherenceReport } from '../lib/adherence';
import { formatPercent } from '../lib/formatters';
import { EVERYONE, matchesPersonFilter } from '../lib/personFilter';
import { PATHS } from '../lib/routes';
import type { AppSnapshot, DateKey, DoseLog } from '../lib/types';

const HISTORY_DAYS = 7;

interface HistoryPageProps {
  snapshot: AppSnapshot;
  now: Date;
  today: DateKey;
  logsById: ReadonlyMap<string, DoseLog>;
  personFilter: string;
  onPersonFilterChange: (filter: string) => void;
}

export function HistoryPage({ snapshot, now, today, logsById, personFilter, onPersonFilterChange }: HistoryPageProps) {
  useDocumentTitle('History');
  const report = useMemo(
    () =>
      buildAdherenceReport(today, HISTORY_DAYS, now, {
        prescriptions: snapshot.prescriptions.filter((prescription) =>
          matchesPersonFilter(personFilter, prescription.personId),
        ),
        people: snapshot.people,
        logsById,
      }),
    [today, now, snapshot.prescriptions, snapshot.people, logsById, personFilter],
  );
  const overallRatio = adherenceRatio(report.overall);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">History</h1>
          <p className="page-subtitle">Last {HISTORY_DAYS} days, including today so far</p>
        </div>
      </div>

      <PersonFilter people={snapshot.people} value={personFilter} onChange={onPersonFilterChange} />

      {overallRatio === null ? (
        <StatusPanel title="No doses in the last week yet">
          <p>
            Adherence appears here once doses come due. Add a prescription on the{' '}
            <NavLink href={PATHS.medications}>Medications</NavLink> page, or load sample data from the Today page.
          </p>
        </StatusPanel>
      ) : (
        <>
          <section aria-labelledby="overall-heading" className="history-section">
            <h2 id="overall-heading" className="section-heading">
              Overall
            </h2>
            <dl className="stat-grid">
              <StatTile label="Adherence" value={formatPercent(overallRatio)} />
              <StatTile label="Taken" value={String(report.overall.taken)} />
              <StatTile label="Skipped" value={String(report.overall.skipped)} />
              <StatTile label="Not logged" value={String(report.overall.missed)} tone={report.overall.missed > 0 ? 'alert' : 'default'} />
            </dl>
            <DailyAdherenceChart days={report.days} today={today} />
          </section>

          <section aria-labelledby="by-medicine-heading" className="history-section">
            <h2 id="by-medicine-heading" className="section-heading">
              By prescription
            </h2>
            <PrescriptionAdherenceList
              entries={report.prescriptions}
              showPerson={personFilter === EVERYONE && snapshot.people.length > 1}
            />
          </section>
          <p className="inline-hint">
            Adherence is doses marked taken out of doses that were logged or are over an hour late. Skipped doses
            count as not taken.
          </p>
        </>
      )}
    </div>
  );
}
