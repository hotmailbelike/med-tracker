import type { PrescriptionColor } from './types';

/**
 * Identification colours for prescriptions, shown only as small markers next to a name. They are
 * soft tints chosen to stay distinct on the dark surface; the brand accent is not among them so
 * overdue doses keep it to themselves.
 */
export const PRESCRIPTION_COLOR_DETAILS: Record<PrescriptionColor, { label: string; value: string }> = {
  rose: { label: 'Rose', value: '#f4a5b8' },
  amber: { label: 'Amber', value: '#f2c46d' },
  lime: { label: 'Lime', value: '#b9df7c' },
  teal: { label: 'Teal', value: '#6fd6c4' },
  sky: { label: 'Sky', value: '#8cbcf5' },
  violet: { label: 'Violet', value: '#bea2f2' },
  sand: { label: 'Sand', value: '#d8c3a0' },
  slate: { label: 'Slate', value: '#a9b4c2' },
};
