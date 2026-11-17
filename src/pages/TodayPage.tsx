import { useMemo } from 'react';
import { NavLink } from '../components/NavLink';
import { PersonFilter } from '../components/PersonFilter';
import { StatusPanel } from '../components/StatusPanel';
import { TimelineSection } from '../components/TimelineSection';
import { TodaySummary } from '../components/TodaySummary';
import { WelcomeCard } from '../components/WelcomeCard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatLongDay } from '../lib/formatters';
import { groupTimeline } from '../lib/groupTimeline';
import { EVERYONE, matchesPersonFilter } from '../lib/personFilter';
import { PATHS } from '../lib/routes';
import type { DoseOccurrence } from '../lib/schedule';
import type { AppSnapshot, DateKey } from '../lib/types';

interface TodayPageProps {
  snapshot: AppSnapshot;
  now: Date;
  today: DateKey;
  todaysDoses: readonly DoseOccurrence[];
  personFilter: string;
  onPersonFilterChange: (filter: string) => void;
  remindersActive: boolean;
}

export function TodayPage({
  snapshot,
  now,
  today,
  todaysDoses,
  personFilter,
  onPersonFilterChange,
  remindersActive,
}: TodayPageProps) {
  useDocumentTitle('Today');
  const sections = useMemo(
    () =>
      groupTimeline(
        todaysDoses.filter((dose) => matchesPersonFilter(personFilter, dose.prescription.personId)),
        now,
      ),
    [todaysDoses, personFilter, now],
  );

  const isFirstRun = snapshot.people.length === 0 && snapshot.prescriptions.length === 0;
  const showPerson = personFilter === EVERYONE && snapshot.people.length > 1;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Today</h1>
          <p className="page-subtitle">{formatLongDay(today)}</p>
        </div>
        {!isFirstRun && (
          <NavLink href={PATHS.newPrescription} className="button button--secondary button--small">
            Add prescription
          </NavLink>
        )}
      </div>

      {isFirstRun ? (
        <WelcomeCard />
      ) : (
        <>
          <PersonFilter people={snapshot.people} value={personFilter} onChange={onPersonFilterChange} />
          {sections.length === 0 ? (
            <StatusPanel title="Nothing scheduled today">
              <p>
                No doses are due today{personFilter === EVERYONE ? '' : ' for this person'}. Schedules and end dates are
                on the <NavLink href={PATHS.medications}>Medications</NavLink> page.
              </p>
            </StatusPanel>
          ) : (
            <>
              <TodaySummary sections={sections} now={now} />
              {!remindersActive && (
                <p className="inline-hint">
                  Want a nudge when a dose is due? <NavLink href={PATHS.settings}>Turn on reminders</NavLink>.
                </p>
              )}
              <div className="timeline">
                {sections.map((section) => (
                  <TimelineSection key={section.phase} section={section} now={now} showPerson={showPerson} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
