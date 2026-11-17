import type { MouseEvent, Ref } from 'react';

export interface SummaryError {
  fieldId: string;
  message: string;
}

interface FormErrorSummaryProps {
  errors: readonly SummaryError[];
  ref?: Ref<HTMLDivElement>;
}

/** Fragment links scroll but do not move focus to a field, so do both explicitly. */
function focusField(event: MouseEvent<HTMLAnchorElement>, fieldId: string): void {
  const field = document.getElementById(fieldId);
  if (field === null) return;
  event.preventDefault();
  field.focus();
  field.scrollIntoView({ block: 'center' });
}

/** Lists every problem with a link to its field; focused on a failed submit so it is read out first. */
export function FormErrorSummary({ errors, ref }: FormErrorSummaryProps) {
  if (errors.length === 0) return null;
  return (
    <div ref={ref} className="error-summary" tabIndex={-1} aria-labelledby="error-summary-title">
      <h2 id="error-summary-title" className="error-summary__title">
        {errors.length === 1 ? 'There is 1 problem to fix' : `There are ${errors.length} problems to fix`}
      </h2>
      <ul>
        {errors.map((error) => (
          <li key={error.fieldId}>
            <a href={`#${error.fieldId}`} onClick={(event) => focusField(event, error.fieldId)}>
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
