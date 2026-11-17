import { PATHS, type Route } from '../lib/routes';
import { AppNav } from './AppNav';
import { NavLink } from './NavLink';

export function AppHeader({ route }: { route: Route }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <NavLink href={PATHS.today} className="brand">
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__name">Med Tracker</span>
        </NavLink>
        <AppNav route={route} />
      </div>
      <p className="app-header__disclaimer">Not medical advice. For tracking only.</p>
    </header>
  );
}
