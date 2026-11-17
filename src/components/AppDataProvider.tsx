import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppDataContext, type AppDataActions, type Toast } from '../lib/appDataContext';
import type { AsyncState } from '../lib/asyncState';
import { announceDataChanged, subscribeToDataChanges } from '../lib/dataChannel';
import { describeStorageError } from '../lib/describeStorageError';
import * as repository from '../lib/repository';
import type { AppSnapshot } from '../lib/types';

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AsyncState<AppSnapshot>>({ status: 'loading' });
  const [toast, setToast] = useState<Toast | null>(null);
  const nextToastId = useRef(0);

  const showToast = useCallback((kind: Toast['kind'], message: string) => {
    nextToastId.current += 1;
    setToast({ id: nextToastId.current, kind, message });
  }, []);

  const load = useCallback(async () => {
    try {
      setState({ status: 'ready', data: await repository.loadSnapshot() });
    } catch (error) {
      setState({ status: 'error', message: describeStorageError(error) });
    }
  }, []);

  useEffect(() => {
    void load();
    return subscribeToDataChanges(() => void load());
  }, [load]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    void load();
  }, [load]);

  const actions = useMemo((): AppDataActions => {
    /** Runs a write, refreshes the snapshot and tells other tabs; a failure becomes an error toast. */
    const run = async (write: () => Promise<void>, successMessage?: string): Promise<boolean> => {
      try {
        await write();
        setState({ status: 'ready', data: await repository.loadSnapshot() });
        announceDataChanged();
        if (successMessage !== undefined) showToast('info', successMessage);
        return true;
      } catch (error) {
        showToast('error', describeStorageError(error));
        return false;
      }
    };

    return {
      recordDose: (occurrence, status) =>
        run(
          () =>
            repository.saveDoseLog({
              id: occurrence.key,
              prescriptionId: occurrence.prescription.id,
              date: occurrence.date,
              time: occurrence.time,
              status,
              recordedAt: new Date().toISOString(),
            }),
          `${occurrence.prescription.medicineName} marked ${status}.`,
        ),
      undoDose: (occurrence) =>
        run(() => repository.deleteDoseLog(occurrence.key), `${occurrence.prescription.medicineName} set back to not logged.`),
      savePrescription: (prescription, newPerson) =>
        run(() => repository.savePrescription(prescription, newPerson), `${prescription.medicineName} saved.`),
      setArchived: (prescription, archived) =>
        run(
          () =>
            repository.savePrescription({
              ...prescription,
              archivedAt: archived ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString(),
            }),
          archived ? `${prescription.medicineName} archived.` : `${prescription.medicineName} restored.`,
        ),
      savePerson: (person) => run(() => repository.savePerson(person), `${person.name} saved.`),
      deletePerson: (person) => run(() => repository.deletePerson(person.id), `${person.name} removed.`),
      setRemindersEnabled: (enabled) =>
        run(
          () => repository.saveSettings({ remindersEnabled: enabled }),
          enabled ? 'Reminders turned on.' : 'Reminders turned off.',
        ),
      replaceData: (data, successMessage) => run(() => repository.replaceAllData(data), successMessage),
      clearAllData: () => run(() => repository.clearAllData(), 'All data cleared from this device.'),
    };
  }, [showToast]);

  const dismissToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({ state, actions, retry, toast, dismissToast }),
    [state, actions, retry, toast, dismissToast],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
