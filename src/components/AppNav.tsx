import { PATHS, type Route } from '../lib/routes';
import { NavIcon, type NavIconName } from './NavIcon';
import { NavLink } from './NavLink';

interface NavItem {
  href: string;
  label: string;
  icon: NavIconName;
  isCurrent: (route: Route) => boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: PATHS.today, label: 'Today', icon: 'today', isCurrent: (route) => route.name === 'today' },
  {
    href: PATHS.medications,
    label: 'Medications',
    icon: 'medications',
    isCurrent: (route) =>
      route.name === 'medications' || route.name === 'new-prescription' || route.name === 'edit-prescription',
  },
  { href: PATHS.history, label: 'History', icon: 'history', isCurrent: (route) => route.name === 'history' },
  { href: PATHS.settings, label: 'Settings', icon: 'settings', isCurrent: (route) => route.name === 'settings' },
];

/** Top navigation on wide screens, a thumb-reachable tab bar on phones (see .app-nav in CSS). */
export function AppNav({ route }: { route: Route }) {
  return (
    <nav className="app-nav" aria-label="Main">
      <ul className="app-nav__list">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <NavLink
              href={item.href}
              className="app-nav__link"
              aria-current={item.isCurrent(route) ? 'page' : undefined}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
