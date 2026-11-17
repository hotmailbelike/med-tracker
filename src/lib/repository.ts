import { getDatabase, STORES } from './database';
import { DEFAULT_SETTINGS, SETTING_KEYS } from './settingsKeys';
import type { AppSettings, AppSnapshot, DoseLog, Person, Prescription, TrackerData } from './types';

const DATA_STORES = [STORES.people, STORES.prescriptions, STORES.doseLogs] as const;

export async function loadSnapshot(): Promise<AppSnapshot> {
  const database = await getDatabase();
  const transaction = database.transaction([...DATA_STORES, STORES.settings], 'readonly');
  const [people, prescriptions, doseLogs, remindersSetting] = await Promise.all([
    transaction.objectStore(STORES.people).getAll(),
    transaction.objectStore(STORES.prescriptions).getAll(),
    transaction.objectStore(STORES.doseLogs).getAll(),
    transaction.objectStore(STORES.settings).get(SETTING_KEYS.remindersEnabled),
  ]);
  await transaction.done;

  const settings: AppSettings = {
    remindersEnabled:
      typeof remindersSetting?.value === 'boolean' ? remindersSetting.value : DEFAULT_SETTINGS.remindersEnabled,
  };
  return {
    people: people.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    prescriptions,
    doseLogs,
    settings,
  };
}

export async function savePerson(person: Person): Promise<void> {
  const database = await getDatabase();
  await database.put(STORES.people, person);
}

/** Removes a person with every prescription and dose log that belongs to them, all or nothing. */
export async function deletePerson(personId: string): Promise<void> {
  const database = await getDatabase();
  const transaction = database.transaction(DATA_STORES, 'readwrite');
  const prescriptionIds = await transaction.objectStore(STORES.prescriptions).index('byPerson').getAllKeys(personId);
  const logIndex = transaction.objectStore(STORES.doseLogs).index('byPrescription');
  for (const prescriptionId of prescriptionIds) {
    for (const logId of await logIndex.getAllKeys(prescriptionId)) {
      await transaction.objectStore(STORES.doseLogs).delete(logId);
    }
    await transaction.objectStore(STORES.prescriptions).delete(prescriptionId);
  }
  await transaction.objectStore(STORES.people).delete(personId);
  await transaction.done;
}

export async function savePrescription(prescription: Prescription, newPerson?: Person): Promise<void> {
  const database = await getDatabase();
  const transaction = database.transaction([STORES.people, STORES.prescriptions], 'readwrite');
  if (newPerson !== undefined) await transaction.objectStore(STORES.people).put(newPerson);
  await transaction.objectStore(STORES.prescriptions).put(prescription);
  await transaction.done;
}

export async function saveDoseLog(log: DoseLog): Promise<void> {
  const database = await getDatabase();
  await database.put(STORES.doseLogs, log);
}

export async function deleteDoseLog(logId: string): Promise<void> {
  const database = await getDatabase();
  await database.delete(STORES.doseLogs, logId);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const database = await getDatabase();
  await database.put(STORES.settings, { key: SETTING_KEYS.remindersEnabled, value: settings.remindersEnabled });
}

/** Swaps every record for `data` in one transaction, so a failed import leaves the old data intact. */
export async function replaceAllData(data: TrackerData): Promise<void> {
  const database = await getDatabase();
  const transaction = database.transaction(DATA_STORES, 'readwrite');
  const people = transaction.objectStore(STORES.people);
  const prescriptions = transaction.objectStore(STORES.prescriptions);
  const doseLogs = transaction.objectStore(STORES.doseLogs);
  await Promise.all([people.clear(), prescriptions.clear(), doseLogs.clear()]);
  await Promise.all([
    ...data.people.map((person) => people.put(person)),
    ...data.prescriptions.map((prescription) => prescriptions.put(prescription)),
    ...data.doseLogs.map((log) => doseLogs.put(log)),
  ]);
  await transaction.done;
}

/** Deletes every record and setting on this device. */
export async function clearAllData(): Promise<void> {
  const database = await getDatabase();
  const transaction = database.transaction([...DATA_STORES, STORES.settings], 'readwrite');
  await Promise.all([...DATA_STORES, STORES.settings].map((store) => transaction.objectStore(store).clear()));
  await transaction.done;
}
