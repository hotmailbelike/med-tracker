import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  tone?: 'default' | 'danger';
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A native modal <dialog>: the browser traps focus, makes the page behind it inert and restores
 * focus when it closes. Open state stays in React; Escape is routed through onCancel.
 */
export function ConfirmDialog({
  isOpen,
  title,
  children,
  confirmLabel,
  tone = 'default',
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!isBusy) onCancel();
      }}
    >
      <h2 id={titleId} className="dialog__title">
        {title}
      </h2>
      <div className="dialog__body">{children}</div>
      <div className="dialog__actions">
        <button type="button" className="button button--ghost" onClick={onCancel} disabled={isBusy}>
          Cancel
        </button>
        <button
          type="button"
          className={tone === 'danger' ? 'button button--danger' : 'button button--primary'}
          onClick={onConfirm}
          disabled={isBusy}
        >
          {isBusy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
