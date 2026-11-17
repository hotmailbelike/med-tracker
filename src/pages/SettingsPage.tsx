import { BackupPanel } from '../components/BackupPanel';
import { DataPanel } from '../components/DataPanel';
import { DevicePanel } from '../components/DevicePanel';
import { PeoplePanel } from '../components/PeoplePanel';
import { RemindersPanel } from '../components/RemindersPanel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { NotificationPermissionState } from '../hooks/useNotificationPermission';
import type { AppSnapshot } from '../lib/types';

interface SettingsPageProps {
  snapshot: AppSnapshot;
  permission: NotificationPermissionState;
  requestPermission: () => Promise<NotificationPermissionState>;
}

export function SettingsPage({ snapshot, permission, requestPermission }: SettingsPageProps) {
  useDocumentTitle('Settings');
  const hasData = snapshot.people.length > 0 || snapshot.prescriptions.length > 0 || snapshot.doseLogs.length > 0;

  return (
    <div className="page page--narrow">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>
      <div className="settings-stack">
        <RemindersPanel
          enabled={snapshot.settings.remindersEnabled}
          permission={permission}
          requestPermission={requestPermission}
        />
        <PeoplePanel people={snapshot.people} prescriptions={snapshot.prescriptions} />
        <BackupPanel data={snapshot} />
        <DevicePanel />
        <DataPanel hasData={hasData} />
        <section className="settings-section settings-section--plain" aria-labelledby="privacy-heading">
          <h2 id="privacy-heading" className="settings-section__title">
            Privacy and safety
          </h2>
          <p>
            Med Tracker has no account, no server database and no analytics. Everything you enter is stored in this
            browser&apos;s IndexedDB and never sent anywhere.
          </p>
          <p>
            <strong>Not medical advice. For tracking only.</strong> Always follow the instructions from your doctor or
            pharmacist.
          </p>
        </section>
      </div>
    </div>
  );
}
