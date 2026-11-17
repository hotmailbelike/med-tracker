const ICON_URL = '/icons/icon-192.png';
/** Android draws the status bar badge from the alpha channel only, so it needs a white-on-transparent shape. */
const BADGE_URL = '/icons/badge-96.png';

interface ReminderNotification {
  title: string;
  body: string;
  /** Notifications with the same tag replace each other, so a reminder is never shown twice. */
  tag: string;
}

/**
 * Shows a notification through the service worker when there is one: Chrome on Android only allows
 * `registration.showNotification`, and `new Notification()` throws there. Falls back to the page
 * API elsewhere (and in development, where no service worker is registered).
 */
export async function showNotification({ title, body, tag }: ReminderNotification): Promise<void> {
  const options: NotificationOptions = { body, tag, icon: ICON_URL, badge: BADGE_URL };
  const registration =
    'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
  if (registration !== undefined) {
    await registration.showNotification(title, options);
    return;
  }
  new Notification(title, options);
}
