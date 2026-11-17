import type { CSSProperties } from 'react';
import { PRESCRIPTION_COLOR_DETAILS } from '../lib/prescriptionColors';
import type { PrescriptionColor } from '../lib/types';

/** Decorative: the medicine's name always carries the meaning. */
export function ColorDot({ color }: { color: PrescriptionColor }) {
  const style = { '--dot-color': PRESCRIPTION_COLOR_DETAILS[color].value } as CSSProperties;
  return <span className="color-dot" style={style} aria-hidden="true" />;
}
