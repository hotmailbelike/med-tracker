import { NavLink } from '../components/NavLink';
import { StatusPanel } from '../components/StatusPanel';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PATHS } from '../lib/routes';

export function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="page">
      <h1 className="page-title">Page not found</h1>
      <StatusPanel title="There is nothing at this address">
        <p>
          Go to <NavLink href={PATHS.today}>today&apos;s doses</NavLink> instead.
        </p>
      </StatusPanel>
    </div>
  );
}
