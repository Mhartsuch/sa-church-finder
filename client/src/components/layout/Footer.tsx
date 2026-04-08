import { Globe } from 'lucide-react';

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
  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto max-w-[1760px] px-10 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-sm font-bold">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} ChurchFinder, Inc.</span>
            <span>&middot;</span>
            <button type="button" className="hover:underline">
              Privacy
            </button>
            <span>&middot;</span>
            <button type="button" className="hover:underline">
              Terms
            </button>
            <span>&middot;</span>
            <button type="button" className="hover:underline">
              Sitemap
            </button>
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
