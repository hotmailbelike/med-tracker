/** Chromium's install event; not in the DOM typings because it is not a standard yet. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface InstallState {
  canInstall: boolean;
  isInstalled: boolean;
}

const STANDALONE_QUERY = '(display-mode: standalone)';

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let state: InstallState = { canInstall: false, isInstalled: isRunningInstalled() };
const listeners = new Set<() => void>();

function isRunningInstalled(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return window.matchMedia(STANDALONE_QUERY).matches || iosStandalone;
}

function setState(next: InstallState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

// The event fires once, early, possibly before React renders; capture it at module load.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event as BeforeInstallPromptEvent;
  setState({ ...state, canInstall: true });
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  setState({ canInstall: false, isInstalled: true });
});

export const getInstallState = () => state;

export function subscribeToInstallState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Shows the browser's install dialog; the event can only be used once. */
export async function promptInstall(): Promise<void> {
  if (deferredPrompt === null) return;
  const prompt = deferredPrompt;
  deferredPrompt = null;
  setState({ ...state, canInstall: false });
  await prompt.prompt();
  await prompt.userChoice;
}
