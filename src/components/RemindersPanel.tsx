import { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import type { NotificationPermissionState } from '../hooks/useNotificationPermission';
import { showNotification } from '../lib/showNotification';
import { SettingsSection } from './SettingsSection';

interface RemindersPanelProps {
  enabled: boolean;
  permission: NotificationPermissionState;
  requestPermission: () => Promise<NotificationPermissionState>;
}

const TEST_REMINDER = {
  title: 'Med Tracker reminders are on',
  body: 'This is how a reminder looks when a dose is due.',
  tag: 'med-tracker-test',
};

export function RemindersPanel({ enabled, permission, requestPermission }: RemindersPanelProps) {
  const { actions } = useAppData();
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isActive = enabled && permission === 'granted';

  const turnOn = async () => {
    setError(null);
    setIsWorking(true);
    try {
      const result = permission === 'granted' ? permission : await requestPermission();
      if (result === 'granted') await actions.setRemindersEnabled(true);
    } catch {
      // Some embedded browsers and webviews reject the permission request instead of answering it.
      setError('This browser could not ask for notification permission. Try opening Med Tracker in your main browser.');
    } finally {
      setIsWorking(false);
    }
  };

  const turnOff = async () => {
    setIsWorking(true);
    try {
      // Storage failures are reported by the data layer's own toast.
      await actions.setRemindersEnabled(false);
    } finally {
      setIsWorking(false);
    }
  };

  const sendTest = async () => {
    setError(null);
    try {
      await showNotification(TEST_REMINDER);
    } catch {
      setError('The test reminder could not be shown. Check notification settings for this site.');
    }
  };

  return (
    <SettingsSection
      title="Reminders"
      description={
        <p>
          Get a notification when doses are due, while Med Tracker is open in a tab or as an installed app. Reminders
          with the app fully closed would need push messages from a server, and this app deliberately has none.
        </p>
      }
    >
      {permission === 'unsupported' && <p className="settings-note">This browser does not support notifications.</p>}

      {permission === 'denied' && (
        <p className="settings-note settings-note--alert">
          Notifications are blocked for this site. Allow them in your browser&apos;s site settings, then come back here.
        </p>
      )}

      {(permission === 'default' || permission === 'granted') && (
        <div className="settings-actions">
          {isActive ? (
            <>
              <p className="settings-status">
                <span className="status-dot status-dot--on" aria-hidden="true" /> Reminders are on
              </p>
              <button type="button" className="button button--secondary" onClick={() => void sendTest()}>
                Send a test reminder
              </button>
              <button type="button" className="button button--ghost" onClick={() => void turnOff()} disabled={isWorking}>
                Turn off
              </button>
            </>
          ) : (
            <button type="button" className="button button--primary" onClick={() => void turnOn()} disabled={isWorking}>
              Turn on reminders
            </button>
          )}
        </div>
      )}
      {error !== null && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </SettingsSection>
  );
}
