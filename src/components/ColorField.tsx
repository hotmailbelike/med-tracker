import type { CSSProperties } from 'react';
import { PRESCRIPTION_COLOR_DETAILS } from '../lib/prescriptionColors';
import { PRESCRIPTION_COLORS, type PrescriptionColor } from '../lib/types';

interface ColorFieldProps {
  value: PrescriptionColor;
  onChange: (color: PrescriptionColor) => void;
}

export function ColorField({ value, onChange }: ColorFieldProps) {
  return (
    <fieldset className="field-group" aria-describedby="rx-color-hint">
      <legend className="field-group__legend">Color</legend>
      <p className="field__hint" id="rx-color-hint">
        A marker that helps tell medicines apart at a glance.
      </p>
      <div className="swatches">
        {PRESCRIPTION_COLORS.map((color) => {
          const style = { '--swatch-color': PRESCRIPTION_COLOR_DETAILS[color].value } as CSSProperties;
          return (
            <label key={color} className="swatch" style={style}>
              <input type="radio" name="rx-color" checked={value === color} onChange={() => onChange(color)} />
              <span className="visually-hidden">{PRESCRIPTION_COLOR_DETAILS[color].label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
