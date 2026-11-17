const SERVICE_WORKER_URL = '/sw.js';

/** Production only: in development Vite serves unbundled modules that must never be cached. */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  const register = () => {
    navigator.serviceWorker.register(SERVICE_WORKER_URL).catch((error: unknown) => {
      // The app still works online without it; offline support is what is lost.
      console.warn('Med Tracker: offline support is unavailable because the service worker failed to register.', error);
    });
  };
  // Registering after load keeps precaching from competing with the first render for bandwidth.
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
