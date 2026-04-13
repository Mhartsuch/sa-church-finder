import { useEffect } from 'react';

const SITE_NAME = 'SA Church Finder';
const DEFAULT_DESCRIPTION =
  'Discover churches across San Antonio with neighborhood search, detailed profiles, and community-driven reviews.';
const BASE_URL = 'https://sachurchfinder.com';

interface DocumentHeadOptions {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'place';
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
}

const setMetaTag = (attr: 'name' | 'property', key: string, content: string): void => {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
};

const setCanonical = (href: string): void => {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
};

export function useDocumentHead({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  noIndex,
}: DocumentHeadOptions = {}): void {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonicalUrl = canonicalPath ? `${BASE_URL}${canonicalPath}` : BASE_URL;

    document.title = fullTitle;

    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', canonicalUrl);

    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
      setMetaTag('property', 'og:image:alt', ogImageAlt ?? fullTitle);
    }

    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:card', ogImage ? 'summary_large_image' : 'summary');

    if (ogImage) {
      setMetaTag('name', 'twitter:image', ogImage);
    }

    setCanonical(canonicalUrl);
  }, [title, description, canonicalPath, ogType, ogImage, ogImageAlt, noIndex]);
}
