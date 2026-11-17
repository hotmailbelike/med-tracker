import { useId, useState } from 'react';
import { FoldHeading } from '../components/FoldHeading';
import { NavLink } from '../components/NavLink';
import { PrescriptionCard } from '../components/PrescriptionCard';
import { StatusPanel } from '../components/StatusPanel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLoadSampleData } from '../hooks/useLoadSampleData';
import { PATHS } from '../lib/routes';
import type { AppSnapshot, DateKey, Prescription } from '../lib/types';

interface MedicationsPageProps {
  snapshot: AppSnapshot;
  today: DateKey;
}

const byName = (a: Prescription, b: Prescription) => a.medicineName.localeCompare(b.medicineName);

export function MedicationsPage({ snapshot, today }: MedicationsPageProps) {
  useDocumentTitle('Medications');
  const loadSampleData = useLoadSampleData();
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const archivedHeadingId = useId();
  const archivedListId = useId();
  const active = snapshot.prescriptions.filter((prescription) => prescription.archivedAt === null).sort(byName);
  const archived = snapshot.prescriptions.filter((prescription) => prescription.archivedAt !== null).sort(byName);
  const peopleById = new Map(snapshot.people.map((person) => [person.id, person]));
  // Only offered on an empty device: Settings asks for confirmation before replacing existing data.
  const canLoadSample = snapshot.people.length === 0 && snapshot.prescriptions.length === 0;
  const groups = snapshot.people
    .map((person) => ({ person, prescriptions: active.filter((prescription) => prescription.personId === person.id) }))
    .filter((group) => group.prescriptions.length > 0);

  const loadSample = async () => {
    setIsLoadingSample(true);
    await loadSampleData();
    setIsLoadingSample(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Medications</h1>
          <p className="page-subtitle">
            {active.length} active {active.length === 1 ? 'prescription' : 'prescriptions'}
          </p>
        </div>
        <NavLink href={PATHS.newPrescription} className="button button--primary button--small">
          Create prescription
        </NavLink>
      </div>

      {active.length === 0 && (
        <StatusPanel title="No active prescriptions">
          <p>Create a prescription to start seeing doses on the Today page.</p>
          {canLoadSample && (
            <button
              type="button"
              className="button button--secondary"
              onClick={() => void loadSample()}
              disabled={isLoadingSample}
            >
              {isLoadingSample ? 'Loading sample data…' : 'Load sample data'}
            </button>
          )}
        </StatusPanel>
      )}

      {groups.map(({ person, prescriptions }) => (
        <section key={person.id} className="person-group" aria-labelledby={`person-${person.id}`}>
          <h2 id={`person-${person.id}`} className="section-heading">
            {person.name}
            <span className="section-heading__count">{prescriptions.length}</span>
          </h2>
          <ul className="prescription-list">
            {prescriptions.map((prescription) => (
              <PrescriptionCard key={prescription.id} prescription={prescription} today={today} />
            ))}
          </ul>
        </section>
      ))}

      {archived.length > 0 && (
        <section className="archived-group" aria-labelledby={archivedHeadingId}>
          <FoldHeading
            id={archivedHeadingId}
            className="section-heading"
            isOpen={showArchived}
            controlsId={archivedListId}
            onToggle={() => setShowArchived((open) => !open)}
          >
            Archived
            <span className="section-heading__count">{archived.length}</span>
          </FoldHeading>
          <div id={archivedListId} className="archived-group__content" hidden={!showArchived}>
            <p className="archived-group__hint">Archived prescriptions keep their history but schedule no new doses.</p>
            <ul className="prescription-list">
              {archived.map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  today={today}
                  personName={peopleById.get(prescription.personId)?.name}
                />
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
