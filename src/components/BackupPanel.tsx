import { useRef, useState, type ChangeEvent } from 'react';
import { useAppData } from '../hooks/useAppData';
import { createBackup, MAX_BACKUP_BYTES, parseBackup } from '../lib/backup';
import { downloadTextFile } from '../lib/downloadTextFile';
import type { TrackerData } from '../lib/types';
import { ConfirmDialog } from './ConfirmDialog';
import { SettingsSection } from './SettingsSection';

interface BackupPanelProps {
  data: TrackerData;
}

interface PendingImport {
  fileName: string;
  data: TrackerData;
}

const IMPORT_INPUT_ID = 'backup-file';
const JSON_MIME_TYPE = 'application/json';

export function BackupPanel({ data }: BackupPanelProps) {
  const { actions } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const isEmpty = data.people.length === 0 && data.prescriptions.length === 0;

  const exportBackup = () => {
    const { fileName, json } = createBackup(data, new Date());
    downloadTextFile(fileName, json, JSON_MIME_TYPE);
  };

  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so choosing the same file again still fires a change event.
    event.target.value = '';
    if (file === undefined) return;
    setImportError(null);

    if (file.size > MAX_BACKUP_BYTES) {
      setImportError('That file is too large to be a Med Tracker backup.');
      return;
    }
    try {
      const result = parseBackup(await file.text());
      if (result.ok) setPendingImport({ fileName: file.name, data: result.data });
      else setImportError(result.message);
    } catch {
      setImportError('That file could not be read.');
    }
  };

  const confirmImport = async () => {
    if (pendingImport === null) return;
    setIsImporting(true);
    await actions.replaceData(pendingImport.data, 'Backup restored.');
    setIsImporting(false);
    setPendingImport(null);
  };

  return (
    <SettingsSection
      title="Backup"
      description={
        <p>
          Your data lives only in this browser. Export a backup file now and then, and import it to restore on this or
          another device.
        </p>
      }
    >
      <div className="settings-actions">
        <button type="button" className="button button--secondary" onClick={exportBackup} disabled={isEmpty}>
          Export backup (.json)
        </button>
        <button type="button" className="button button--secondary" onClick={() => fileInputRef.current?.click()}>
          Import backup
        </button>
        <label htmlFor={IMPORT_INPUT_ID} className="visually-hidden">
          Backup file to import
        </label>
        <input
          ref={fileInputRef}
          id={IMPORT_INPUT_ID}
          className="visually-hidden"
          type="file"
          accept={`.json,${JSON_MIME_TYPE}`}
          tabIndex={-1}
          onChange={(event) => void readFile(event)}
        />
      </div>
      {importError !== null && (
        <p className="field-error" role="alert">
          {importError}
        </p>
      )}

      <ConfirmDialog
        isOpen={pendingImport !== null}
        title="Replace all data with this backup?"
        confirmLabel="Replace and restore"
        tone="danger"
        isBusy={isImporting}
        onConfirm={() => void confirmImport()}
        onCancel={() => setPendingImport(null)}
      >
        {pendingImport !== null && (
          <>
            <p>
              <strong>{pendingImport.fileName}</strong> contains {pendingImport.data.people.length} people,{' '}
              {pendingImport.data.prescriptions.length} prescriptions and {pendingImport.data.doseLogs.length} dose
              records.
            </p>
            <p>Everything currently on this device is replaced. Export a backup first if you want to keep it.</p>
          </>
        )}
      </ConfirmDialog>
    </SettingsSection>
  );
}
