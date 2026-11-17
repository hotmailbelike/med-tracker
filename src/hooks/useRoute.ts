import { useMemo, useSyncExternalStore } from 'react';
import { currentLocation, subscribeToNavigation } from '../lib/navigation';
import { parseRoute, type Route } from '../lib/routes';

export function useRoute(): Route {
  const location = useSyncExternalStore(subscribeToNavigation, currentLocation);
  return useMemo(() => parseRoute(new URL(location, window.location.origin).pathname), [location]);
}
