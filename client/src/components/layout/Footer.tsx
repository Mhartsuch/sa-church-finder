import { Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUPPORT_LINKS } from '@/constants/support';

const FOOTER_LEGAL_LINKS = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Sitemap', to: '/sitemap' },
] as const;

const FOOTER_COLUMNS = [
  {
    title: 'Support',
    links: ['Help Center', 'Safety information', 'Accessibility', 'Report a concern'],
  },
  {
    title: 'Community',
    links: ['Church leaders portal', 'Volunteer opportunities', 'Community events', 'Forum'],
  },
  {
    title: 'Discovering',
    links: ['San Antonio churches', 'Historic missions', 'Megachurches', 'Community churches'],
  },
  {
    title: 'ChurchFinder',
    links: ['About us', 'List your church', 'Careers', 'Blog'],
  },
];

export const Footer = () => {
  const supportLinksByLabel = new Map<string, string>(
    SUPPORT_LINKS.map((link) => [link.label, link.to]),
  );

  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto max-w-[1760px] px-10 py-12">
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
                  <li key={link}>
                    {supportLinksByLabel.has(link) ? (
                      <Link
                        to={supportLinksByLabel.get(link) ?? '/'}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                      >
                        {link}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                      >
                        {link}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-foreground transition-colors hover:text-muted-foreground"
            >
              <Globe className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground"
            >
              English (US)
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
