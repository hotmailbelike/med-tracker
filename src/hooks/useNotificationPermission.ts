import { useCallback, useEffect, useState } from 'react';

export type NotificationPermissionState = NotificationPermission | 'unsupported';

const readPermission = (): NotificationPermissionState =>
  typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermissionState>(readPermission);

  // The user can change the permission from browser settings at any time; follow it where supported.
  useEffect(() => {
    if (!('permissions' in navigator)) return;
    let status: PermissionStatus | null = null;
    const update = () => setPermission(readPermission());
    navigator.permissions
      .query({ name: 'notifications' })
      .then((result) => {
        status = result;
        result.addEventListener('change', update);
      })
      .catch(() => undefined);
    return () => status?.removeEventListener('change', update);
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
    if (typeof Notification === 'undefined') return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  return { permission, requestPermission };
}
