import { useEffect, useRef } from 'react';

const SITE_NAME = 'SA Church Finder';
const DEFAULT_DESCRIPTION =
  'Discover churches across San Antonio with neighborhood search, detailed profiles, and community-driven reviews.';
const SITE_URL = 'https://sachurchfinder.com';

interface DocumentHeadOptions {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
}

/**
 * Sets document title, meta description, canonical URL, and Open Graph tags.
 * Restores previous values on unmount so pages don't leak tags.
 */
export function useDocumentHead(options: DocumentHeadOptions): void {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    canonicalPath,
    ogType = 'website',
    ogImage,
    noindex = false,
  } = options;

  const previousTitle = useRef<string | null>(null);

  useEffect(() => {
    previousTitle.current = document.title;

    // Title
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    // Meta description
    setMeta('description', description);

    // Robots
    setMeta('robots', noindex ? 'noindex,nofollow' : 'index,follow');

    // Canonical
    if (canonicalPath !== undefined) {
      setLink('canonical', `${SITE_URL}${canonicalPath}`);
    }

    // Open Graph
    setMetaProperty('og:title', title ?? SITE_NAME);
    setMetaProperty('og:description', description);
    setMetaProperty('og:type', ogType);
    if (canonicalPath !== undefined) {
      setMetaProperty('og:url', `${SITE_URL}${canonicalPath}`);
    }
    if (ogImage) {
      setMetaProperty('og:image', ogImage);
    }

    // Twitter
    setMeta('twitter:title', title ?? SITE_NAME);
    setMeta('twitter:description', description);
    if (ogImage) {
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:image', ogImage);
    }

    return () => {
      if (previousTitle.current !== null) {
        document.title = previousTitle.current;
      }
    };
  }, [title, description, canonicalPath, ogType, ogImage, noindex]);
}

function setMeta(name: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setMetaProperty(property: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string): void {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}
