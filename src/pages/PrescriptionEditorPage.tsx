import { NavLink } from '../components/NavLink';
import { PrescriptionForm } from '../components/PrescriptionForm';
import { StatusPanel } from '../components/StatusPanel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { draftFromPrescription, emptyDraft } from '../lib/prescriptionDraft';
import { PATHS } from '../lib/routes';
import type { AppSnapshot, DateKey } from '../lib/types';

interface PrescriptionEditorPageProps {
  snapshot: AppSnapshot;
  today: DateKey;
  /** Undefined when creating a new prescription. */
  prescriptionId: string | undefined;
}

export function PrescriptionEditorPage({ snapshot, today, prescriptionId }: PrescriptionEditorPageProps) {
  const existing =
    prescriptionId === undefined ? undefined : snapshot.prescriptions.find((prescription) => prescription.id === prescriptionId);
  const isEditing = prescriptionId !== undefined;
  useDocumentTitle(isEditing ? 'Edit prescription' : 'Create prescription');

  // Only read on the form's first render (it seeds useState), so a later snapshot refresh, such as
  // a dose logged in another tab, never resets what the user is typing.
  const initialDraft =
    existing === undefined ? emptyDraft(snapshot.people, snapshot.prescriptions, today) : draftFromPrescription(existing);

  if (isEditing && existing === undefined) {
    return (
      <div className="page">
        <StatusPanel title="Prescription not found">
          <p>It may have been removed, or the link is out of date.</p>
          <NavLink href={PATHS.medications}>Back to medications</NavLink>
        </StatusPanel>
      </div>
    );
  }

  return (
    <div className="page page--narrow">
      <NavLink href={PATHS.medications} className="back-link">
        <span aria-hidden="true">←</span> Medications
      </NavLink>
      <div className="page-header">
        <h1 className="page-title">{isEditing ? `Edit ${existing?.medicineName ?? 'prescription'}` : 'Create prescription'}</h1>
      </div>
      {isEditing && (
        <p className="inline-hint">
          History is worked out from the current schedule, so changing times or days also changes how past days are
          scored.
        </p>
      )}
      <PrescriptionForm key={existing?.id ?? 'new'} people={snapshot.people} initialDraft={initialDraft} existing={existing} />
    </div>
  );
}
