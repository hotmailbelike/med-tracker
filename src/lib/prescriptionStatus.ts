import type { DateKey, Prescription } from './types';

type PrescriptionStatus = 'active' | 'not-started' | 'ended' | 'archived';

export function prescriptionStatus(prescription: Prescription, today: DateKey): PrescriptionStatus {
  if (prescription.archivedAt !== null) return 'archived';
  if (today < prescription.startDate) return 'not-started';
  if (prescription.endDate !== null && today > prescription.endDate) return 'ended';
  return 'active';
}

export const PRESCRIPTION_STATUS_LABELS: Record<PrescriptionStatus, string> = {
  active: 'Active',
  'not-started': 'Not started',
  ended: 'Course ended',
  archived: 'Archived',
};
