import { useCallback, useEffect, useState } from 'react';

type StoragePersistence = 'checking' | 'unsupported' | 'persisted' | 'best-effort';

/**
 * Browsers may evict site data under storage pressure unless it is marked persistent. For an app
 * whose only copy of the data is on the device, asking for persistence matters.
 */
export function usePersistentStorage() {
  const [persistence, setPersistence] = useState<StoragePersistence>('checking');

  useEffect(() => {
    if (navigator.storage?.persisted === undefined) {
      setPersistence('unsupported');
      return;
    }
    let isCurrent = true;
    navigator.storage
      .persisted()
      .then((persisted) => {
        if (isCurrent) setPersistence(persisted ? 'persisted' : 'best-effort');
      })
      .catch(() => {
        if (isCurrent) setPersistence('unsupported');
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  const requestPersistence = useCallback(async (): Promise<boolean> => {
    if (navigator.storage?.persist === undefined) return false;
    const granted = await navigator.storage.persist();
    setPersistence(granted ? 'persisted' : 'best-effort');
    return granted;
  }, []);

  return { persistence, requestPersistence };
}
