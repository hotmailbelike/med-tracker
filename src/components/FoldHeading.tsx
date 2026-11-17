import type { ReactNode } from 'react';

interface FoldHeadingProps {
  id: string;
  className: string;
  isOpen: boolean;
  /** The id of the content this heading shows and hides. */
  controlsId: string;
  onToggle: () => void;
  children: ReactNode;
}

/**
 * A heading that wraps a disclosure button. Unlike a heading inside <summary>, which screen readers
 * flatten into a button, this keeps the section reachable by heading navigation.
 */
export function FoldHeading({ id, className, isOpen, controlsId, onToggle, children }: FoldHeadingProps) {
  return (
    <h2 id={id} className={className}>
      <button type="button" className="fold-toggle" aria-expanded={isOpen} aria-controls={controlsId} onClick={onToggle}>
        {children}
      </button>
    </h2>
  );
}
