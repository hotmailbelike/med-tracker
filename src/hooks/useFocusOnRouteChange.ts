import { useEffect, useRef, type RefObject } from 'react';
import type { Route } from '../lib/routes';

/**
 * Moves focus to the main region after client-side navigation, so screen readers announce the new
 * view and keyboard users start at its top. Skipped on first load, where the browser handles focus.
 */
export function useFocusOnRouteChange(route: Route, mainRef: RefObject<HTMLElement | null>): void {
  const isFirstRender = useRef(true);
  const routeKey = route.name === 'edit-prescription' ? `${route.name}:${route.prescriptionId}` : route.name;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [routeKey, mainRef]);
}
