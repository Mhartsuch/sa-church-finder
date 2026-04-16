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

    // Track all tags created/updated so we can clean them up on unmount
    const managedTags: HTMLElement[] = [];

    // Title
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    // Meta description
    managedTags.push(setMeta('description', description));

    // Robots
    managedTags.push(setMeta('robots', noindex ? 'noindex,nofollow' : 'index,follow'));

    // Canonical
    if (canonicalPath !== undefined) {
      managedTags.push(setLink('canonical', `${SITE_URL}${canonicalPath}`));
    }

    // Open Graph
    managedTags.push(setMetaProperty('og:title', title ?? SITE_NAME));
    managedTags.push(setMetaProperty('og:description', description));
    managedTags.push(setMetaProperty('og:type', ogType));
    if (canonicalPath !== undefined) {
      managedTags.push(setMetaProperty('og:url', `${SITE_URL}${canonicalPath}`));
    }
    if (ogImage) {
      managedTags.push(setMetaProperty('og:image', ogImage));
    }

    // Twitter Card
    managedTags.push(setMeta('twitter:card', ogImage ? 'summary_large_image' : 'summary'));
    managedTags.push(setMeta('twitter:title', title ?? SITE_NAME));
    managedTags.push(setMeta('twitter:description', description));
    if (ogImage) {
      managedTags.push(setMeta('twitter:image', ogImage));
    }

    return () => {
      if (previousTitle.current !== null) {
        document.title = previousTitle.current;
      }
      // Remove all meta/link tags to prevent stale tags when navigating away
      for (const tag of managedTags) {
        tag.parentNode?.removeChild(tag);
      }
    };
  }, [title, description, canonicalPath, ogType, ogImage, noindex]);
}

function setMeta(name: string, content: string): HTMLMetaElement {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
  return el;
}

function setMetaProperty(property: string, content: string): HTMLMetaElement {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
  return el;
}

function setLink(rel: string, href: string): HTMLLinkElement {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  return el;
}
