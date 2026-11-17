import { useState } from 'react';
import { useInstallState } from '../hooks/useInstallState';
import { promptInstall } from '../lib/installPrompt';
import { readStoredFlag, storeFlag } from '../lib/safeStorage';

const DISMISSED_KEY = 'med-tracker:install-hint-dismissed';

/** Offered only when the browser says the app can be installed, and never again once dismissed. */
export function InstallBanner() {
  const { canInstall } = useInstallState();
  const [isDismissed, setIsDismissed] = useState(() => readStoredFlag(DISMISSED_KEY));

  if (!canInstall || isDismissed) return null;

  const dismiss = () => {
    storeFlag(DISMISSED_KEY, true);
    setIsDismissed(true);
  };

  return (
    <aside className="install-banner" aria-label="Install app">
      <p className="install-banner__text">
        <strong>Install Med Tracker</strong> for a home screen icon and full offline use.
      </p>
      <div className="install-banner__actions">
        <button type="button" className="button button--primary button--small" onClick={() => void promptInstall()}>
          Install app
        </button>
        <button type="button" className="button button--ghost button--small" onClick={dismiss}>
          Not now
        </button>
      </div>
    </aside>
  );
}
