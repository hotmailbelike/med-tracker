import { useEffect } from 'react';

const APP_NAME = 'Med Tracker';

export function useDocumentTitle(pageTitle: string): void {
  useEffect(() => {
    document.title = `${pageTitle} · ${APP_NAME}`;
  }, [pageTitle]);
}
