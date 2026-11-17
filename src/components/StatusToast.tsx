import { useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';

const INFO_TOAST_MS = 4000;

/**
 * Confirms each write in a polite live region; errors stay until dismissed and are announced
 * assertively. The live regions are always rendered so screen readers pick up new messages.
 */
export function StatusToast() {
  const { toast, dismissToast } = useAppData();

  useEffect(() => {
    if (toast?.kind !== 'info') return;
    const timer = window.setTimeout(dismissToast, INFO_TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast, dismissToast]);

  return (
    <div className="toast-region">
      <div role="status" aria-live="polite">
        {toast?.kind === 'info' && (
          <p key={toast.id} className="toast">
            {toast.message}
          </p>
        )}
      </div>
      <div role="alert">
        {toast?.kind === 'error' && (
          <div key={toast.id} className="toast toast--error">
            <p>{toast.message}</p>
            <button type="button" className="button button--ghost button--small" onClick={dismissToast}>
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
