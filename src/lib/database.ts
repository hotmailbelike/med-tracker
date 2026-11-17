import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { DoseLog, Person, Prescription } from './types';

const DATABASE_NAME = 'med-tracker';
const DATABASE_VERSION = 1;

export const STORES = {
  people: 'people',
  prescriptions: 'prescriptions',
  doseLogs: 'doseLogs',
  settings: 'settings',
} as const;

interface SettingRecord {
  key: string;
  value: unknown;
}

interface MedTrackerSchema extends DBSchema {
  people: { key: string; value: Person };
  prescriptions: { key: string; value: Prescription; indexes: { byPerson: string } };
  doseLogs: { key: string; value: DoseLog; indexes: { byPrescription: string } };
  settings: { key: string; value: SettingRecord };
}

type MedTrackerDatabase = IDBPDatabase<MedTrackerSchema>;

let databasePromise: Promise<MedTrackerDatabase> | null = null;

function open(): Promise<MedTrackerDatabase> {
  return openDB<MedTrackerSchema>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      database.createObjectStore(STORES.people, { keyPath: 'id' });
      const prescriptions = database.createObjectStore(STORES.prescriptions, { keyPath: 'id' });
      prescriptions.createIndex('byPerson', 'personId');
      const doseLogs = database.createObjectStore(STORES.doseLogs, { keyPath: 'id' });
      doseLogs.createIndex('byPrescription', 'prescriptionId');
      database.createObjectStore(STORES.settings, { keyPath: 'key' });
    },
    blocking(_currentVersion, _blockedVersion, event) {
      // A newer version of the app opened in another tab: let it upgrade, then reconnect lazily.
      (event.target as IDBDatabase | null)?.close();
      databasePromise = null;
    },
    terminated() {
      databasePromise = null;
    },
  });
}

/** One shared connection, reopened if the browser closes it. */
export function getDatabase(): Promise<MedTrackerDatabase> {
  if (databasePromise === null) {
    databasePromise = open().catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}
