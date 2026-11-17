import { createContext } from 'react';
import type { AsyncState } from './asyncState';
import type { DoseOccurrence } from './schedule';
import type { AppSnapshot, DoseLogStatus, Person, Prescription, TrackerData } from './types';

export interface Toast {
  id: number;
  kind: 'info' | 'error';
  message: string;
}

/** Every write the UI can make. Each resolves to false (after showing an error) instead of throwing. */
export interface AppDataActions {
  recordDose: (occurrence: DoseOccurrence, status: DoseLogStatus) => Promise<boolean>;
  undoDose: (occurrence: DoseOccurrence) => Promise<boolean>;
  savePrescription: (prescription: Prescription, newPerson?: Person) => Promise<boolean>;
  setArchived: (prescription: Prescription, archived: boolean) => Promise<boolean>;
  savePerson: (person: Person) => Promise<boolean>;
  deletePerson: (person: Person) => Promise<boolean>;
  setRemindersEnabled: (enabled: boolean) => Promise<boolean>;
  replaceData: (data: TrackerData, successMessage: string) => Promise<boolean>;
  clearAllData: () => Promise<boolean>;
}

export interface AppDataContextValue {
  state: AsyncState<AppSnapshot>;
  actions: AppDataActions;
  retry: () => void;
  toast: Toast | null;
  dismissToast: () => void;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);
