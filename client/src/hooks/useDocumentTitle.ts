import { useEffect } from 'react';

const SITE_NAME = 'SA Church Finder';

/** Sets the page title and meta description for the current route. */
export const useDocumentTitle = (title?: string, description?: string) => {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · Find your church home`;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
  }, [title, description]);
};
