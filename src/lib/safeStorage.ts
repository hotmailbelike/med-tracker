// localStorage can throw (blocked site data, some private modes); these preferences are optional,
// so failures fall back to defaults instead of breaking the app.

export function readStoredFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

export function storeFlag(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Not remembered across visits; nothing else depends on it.
  }
}
