import { useInstallState } from '../hooks/useInstallState';
import { usePersistentStorage } from '../hooks/usePersistentStorage';
import { promptInstall } from '../lib/installPrompt';
import { SettingsSection } from './SettingsSection';

function InstallStatus() {
  const { canInstall, isInstalled } = useInstallState();
  if (isInstalled) return <p className="settings-status">Running as an installed app.</p>;
  if (canInstall) {
    return (
      <button type="button" className="button button--secondary" onClick={() => void promptInstall()}>
        Install app
      </button>
    );
  }
  return (
    <p className="settings-note">
      To install, use your browser&apos;s menu: <strong>Install app</strong> or <strong>Add to Home Screen</strong>. On
      iPhone and iPad, tap Share, then Add to Home Screen.
    </p>
  );
}

function StorageStatus() {
  const { persistence, requestPersistence } = usePersistentStorage();
  switch (persistence) {
    case 'checking':
      return null;
    case 'unsupported':
      return <p className="settings-note">This browser decides on its own how long to keep site data.</p>;
    case 'persisted':
      return <p className="settings-status">Storage is persistent: the browser will not clear it to save space.</p>;
    case 'best-effort':
      return (
        <div className="settings-actions">
          <p className="settings-note">The browser may clear this data if the device runs low on space.</p>
          <button type="button" className="button button--secondary" onClick={() => void requestPersistence()}>
            Keep data on this device
          </button>
        </div>
      );
  }
}

export function DevicePanel() {
  return (
    <SettingsSection
      title="App and storage"
      description={<p>Med Tracker works offline once loaded, and installs like a native app.</p>}
    >
      <InstallStatus />
      <StorageStatus />
    </SettingsSection>
  );
}
