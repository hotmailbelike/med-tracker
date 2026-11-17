import { useSyncExternalStore } from 'react';
import { getInstallState, subscribeToInstallState, type InstallState } from '../lib/installPrompt';

export function useInstallState(): InstallState {
  return useSyncExternalStore(subscribeToInstallState, getInstallState);
}
