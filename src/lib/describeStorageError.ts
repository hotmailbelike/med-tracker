/** Plain-language message for a failed IndexedDB operation. */
export function describeStorageError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError') {
      return 'Your device is out of storage space for this app. Free some space, or export a backup and clear old data.';
    }
    if (error.name === 'InvalidStateError' || error.name === 'SecurityError') {
      return 'This browser is blocking on-device storage (private browsing can do this). Open Med Tracker in a normal window.';
    }
  }
  if (typeof indexedDB === 'undefined') {
    return 'This browser does not support on-device storage, which Med Tracker needs to keep your data.';
  }
  return 'Something went wrong while reading or saving data on this device. Please try again.';
}
