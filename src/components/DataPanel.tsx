import { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useLoadSampleData } from '../hooks/useLoadSampleData';
import { ConfirmDialog } from './ConfirmDialog';
import { SettingsSection } from './SettingsSection';

type PendingAction = 'sample' | 'clear' | null;

export function DataPanel({ hasData }: { hasData: boolean }) {
  const { actions } = useAppData();
  const loadSampleData = useLoadSampleData();
  const [pending, setPending] = useState<PendingAction>(null);
  const [isWorking, setIsWorking] = useState(false);

  const run = async (action: () => Promise<boolean>) => {
    setIsWorking(true);
    await action();
    setIsWorking(false);
    setPending(null);
  };

  const requestSample = () => {
    // Nothing to lose on an empty device, so no confirmation is needed.
    if (hasData) setPending('sample');
    else void run(loadSampleData);
  };

  return (
    <SettingsSection
      title="Data on this device"
      description={<p>Try the app with a fictional household, or start over.</p>}
    >
      <div className="settings-actions">
        <button type="button" className="button button--secondary" onClick={requestSample} disabled={isWorking}>
          Load sample data
        </button>
        <button type="button" className="button button--danger-outline" onClick={() => setPending('clear')} disabled={!hasData}>
          Clear all data
        </button>
      </div>

      <ConfirmDialog
        isOpen={pending === 'sample'}
        title="Replace your data with sample data?"
        confirmLabel="Load sample data"
        tone="danger"
        isBusy={isWorking}
        onConfirm={() => void run(loadSampleData)}
        onCancel={() => setPending(null)}
      >
        <p>Your people, prescriptions and history on this device are replaced with a demo household. Export a backup first if you want to keep them.</p>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={pending === 'clear'}
        title="Clear all data?"
        confirmLabel="Clear everything"
        tone="danger"
        isBusy={isWorking}
        onConfirm={() => void run(actions.clearAllData)}
        onCancel={() => setPending(null)}
      >
        <p>Every person, prescription, dose record and setting on this device is deleted. This cannot be undone.</p>
      </ConfirmDialog>
    </SettingsSection>
  );
}
