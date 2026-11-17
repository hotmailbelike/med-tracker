import { useRef } from 'react';
import { AppContent } from './components/AppContent';
import { AppDataProvider } from './components/AppDataProvider';
import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';
import { InstallBanner } from './components/InstallBanner';
import { StatusToast } from './components/StatusToast';
import { useFocusOnRouteChange } from './hooks/useFocusOnRouteChange';
import { useRoute } from './hooks/useRoute';

export function App() {
  const route = useRoute();
  const mainRef = useRef<HTMLElement>(null);
  useFocusOnRouteChange(route, mainRef);

  return (
    <AppDataProvider>
      <div className="app">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <AppHeader route={route} />
        <InstallBanner />
        <main id="main" ref={mainRef} className="app-main" tabIndex={-1}>
          <AppContent route={route} />
        </main>
        <AppFooter />
        <StatusToast />
      </div>
    </AppDataProvider>
  );
}
