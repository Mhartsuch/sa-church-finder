import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUPPORT_LINKS } from '@/constants/support';

const FOOTER_LEGAL_LINKS = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Sitemap', to: '/sitemap' },
] as const;

const FOOTER_COLUMNS: ReadonlyArray<{
  title: string;
  links: ReadonlyArray<{ label: string; to: string }>;
}> = [
  {
    title: 'Support',
    links: SUPPORT_LINKS,
  },
  {
    title: 'Community',
    links: [
      { label: 'Church leaders portal', to: '/leaders' },
      { label: 'Community events', to: '/events' },
      { label: 'Forum', to: '/forum' },
    ],
  },
  {
    title: 'Discovering',
    links: [
      { label: 'All San Antonio churches', to: '/search' },
      { label: 'Historic missions', to: '/search?q=mission' },
      { label: 'Catholic parishes', to: '/search?q=catholic' },
      { label: 'Baptist churches', to: '/search?q=baptist' },
    ],
  },
  {
    title: 'ChurchFinder',
    links: [
      { label: 'List your church', to: '/leaders' },
      { label: 'Compare churches', to: '/compare' },
      { label: 'Church passport', to: '/passport' },
      { label: 'My account', to: '/account' },
    ],
  },
];

export const Footer = () => {
  return (
    <footer aria-label="Site footer" className="border-t border-border bg-muted">
      <div className="mx-auto max-w-[1760px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
        {import.meta.env.VITE_STRIPE_DONATION_URL && (
          <div className="mb-8 flex flex-col items-center gap-3 border-b border-border pb-6 text-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-primary" />
              <span>Help us keep SA Church Finder free for everyone</span>
            </div>
            <a
              href={import.meta.env.VITE_STRIPE_DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              Support Us
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-sm font-bold">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} ChurchFinder, Inc.</span>
          {FOOTER_LEGAL_LINKS.map((link) => (
            <div key={link.to} className="flex items-center gap-2">
              <span>&middot;</span>
              <Link to={link.to} className="hover:underline">
                {link.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};
