export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL ?? 'admin@sachurchfinder.com';

export const SUPPORT_LINKS = [
  { label: 'Help Center', to: '/help-center' },
  { label: 'Safety information', to: '/safety-information' },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Report a concern', to: '/report-a-concern' },
] as const;

export const buildSupportMailto = (subject: string, body: string) =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
