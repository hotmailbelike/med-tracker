export const PATHS = {
  today: '/',
  medications: '/medications',
  newPrescription: '/medications/new',
  history: '/history',
  settings: '/settings',
} as const;

export const editPrescriptionPath = (id: string) => `${PATHS.medications}/${encodeURIComponent(id)}/edit`;

export type Route =
  | { name: 'today' }
  | { name: 'medications' }
  | { name: 'new-prescription' }
  | { name: 'edit-prescription'; prescriptionId: string }
  | { name: 'history' }
  | { name: 'settings' }
  | { name: 'not-found' };

const EDIT_PRESCRIPTION_PATTERN = /^\/medications\/([^/]+)\/edit$/;

export function parseRoute(pathname: string): Route {
  // Tolerate a trailing slash, which some links and hosts add.
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  switch (path) {
    case PATHS.today:
      return { name: 'today' };
    case PATHS.medications:
      return { name: 'medications' };
    case PATHS.newPrescription:
      return { name: 'new-prescription' };
    case PATHS.history:
      return { name: 'history' };
    case PATHS.settings:
      return { name: 'settings' };
  }
  const editMatch = EDIT_PRESCRIPTION_PATTERN.exec(path);
  if (editMatch?.[1] !== undefined) {
    try {
      return { name: 'edit-prescription', prescriptionId: decodeURIComponent(editMatch[1]) };
    } catch {
      return { name: 'not-found' };
    }
  }
  return { name: 'not-found' };
}
