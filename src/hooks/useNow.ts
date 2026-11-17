import { useEffect, useState } from 'react';

/** Fine enough for "due now" and overdue states without re-rendering every second. */
const NOW_TICK_MS = 30_000;

/** The current time, refreshed on a timer and whenever the app comes back into view. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const update = () => setNow(new Date());
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') update();
    };
    const timer = window.setInterval(update, NOW_TICK_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return now;
}
