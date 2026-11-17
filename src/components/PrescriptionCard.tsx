import { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { describeArchived, describeDateRange, describeSchedule } from '../lib/describeSchedule';
import { formatDose, MEDICINE_FORM_DETAILS } from '../lib/medicineForms';
import { PRESCRIPTION_STATUS_LABELS, prescriptionStatus } from '../lib/prescriptionStatus';
import { editPrescriptionPath } from '../lib/routes';
import type { DateKey, Prescription } from '../lib/types';
import { ColorDot } from './ColorDot';
import { NavLink } from './NavLink';

interface PrescriptionCardProps {
  prescription: Prescription;
  today: DateKey;
  /** Shown where the list is not already grouped by person. */
  personName?: string;
}

export function PrescriptionCard({ prescription, today, personName }: PrescriptionCardProps) {
  const { actions } = useAppData();
  const [isSaving, setIsSaving] = useState(false);
  const status = prescriptionStatus(prescription, today);
  const isArchived = status === 'archived';
  const nameSuffix = <span className="visually-hidden"> {prescription.medicineName}</span>;

  const toggleArchived = async () => {
    setIsSaving(true);
    await actions.setArchived(prescription, !isArchived);
    setIsSaving(false);
  };

  return (
    <li className={`prescription-card card${isArchived ? ' prescription-card--archived' : ''}`}>
      <div className="prescription-card__header">
        <ColorDot color={prescription.color} />
        <h3 className="prescription-card__name">
          {prescription.medicineName}
          {prescription.strength !== '' && <span className="prescription-card__strength"> {prescription.strength}</span>}
        </h3>
        {status !== 'active' && <span className={`badge badge--${status}`}>{PRESCRIPTION_STATUS_LABELS[status]}</span>}
      </div>
      <dl className="prescription-card__details">
        {personName !== undefined && (
          <div>
            <dt>For</dt>
            <dd>{personName}</dd>
          </div>
        )}
        <div>
          <dt>Dose</dt>
          <dd>
            {formatDose(prescription.doseAmount, prescription.form)} ({MEDICINE_FORM_DETAILS[prescription.form].label.toLowerCase()})
          </dd>
        </div>
        <div>
          <dt>When</dt>
          <dd>{describeSchedule(prescription)}</dd>
        </div>
        <div>
          <dt>Dates</dt>
          <dd>{describeArchived(prescription) ?? describeDateRange(prescription)}</dd>
        </div>
        {prescription.notes !== '' && (
          <div>
            <dt>Notes</dt>
            <dd>{prescription.notes}</dd>
          </div>
        )}
      </dl>
      <div className="prescription-card__actions">
        <NavLink href={editPrescriptionPath(prescription.id)} className="button button--secondary button--small">
          Edit{nameSuffix}
        </NavLink>
        <button type="button" className="button button--ghost button--small" onClick={() => void toggleArchived()} disabled={isSaving}>
          {isArchived ? 'Restore' : 'Archive'}
          {nameSuffix}
        </button>
      </div>
    </li>
  );
}
