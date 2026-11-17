import { useAppData } from '../hooks/useAppData';
import type { Route } from '../lib/routes';
import { AppRoutes } from './AppRoutes';
import { StatusPanel } from './StatusPanel';

export function AppContent({ route }: { route: Route }) {
  const { state, retry } = useAppData();

  if (state.status === 'loading') {
    return <StatusPanel role="status" title="Opening your medications…" />;
  }

  if (state.status === 'error') {
    return (
      <StatusPanel role="alert" tone="error" title="Med Tracker could not open its data">
        <p>{state.message}</p>
        <button type="button" className="button button--secondary" onClick={retry}>
          Try again
        </button>
      </StatusPanel>
    );
  }

  return <AppRoutes route={route} snapshot={state.data} />;
}
