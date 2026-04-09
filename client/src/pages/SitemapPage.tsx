import { Link } from 'react-router-dom';
import {
  SupportCard,
  SupportPageLayout,
  SupportPageSection,
} from '@/components/support/SupportPageLayout';

const sitemapSections = [
  {
    title: 'Discover',
    description: 'Core browsing routes for finding and comparing churches.',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Search churches', to: '/search' },
      { label: 'Compare churches', to: '/compare' },
    ],
  },
  {
    title: 'Support',
    description: 'Guidance, safety, and accessibility resources for visitors and members.',
    links: [
      { label: 'Help Center', to: '/help-center' },
      { label: 'Safety information', to: '/safety-information' },
      { label: 'Accessibility', to: '/accessibility' },
      { label: 'Report a concern', to: '/report-a-concern' },
    ],
  },
  {
    title: 'Account',
    description: 'Authentication and member account entry points.',
    links: [
      { label: 'Login', to: '/login' },
      { label: 'Register', to: '/register' },
      { label: 'Forgot password', to: '/forgot-password' },
    ],
  },
  {
    title: 'Legal',
    description: 'Policy and site-structure pages linked from the footer.',
    links: [
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
      { label: 'Sitemap', to: '/sitemap' },
    ],
  },
] as const;

const contextualRoutes = [
  'Church profile pages live under /churches/:slug and depend on the specific church you open from search or featured sections.',
  'Account, password reset, and email verification flows may require a signed-in session or an email link before they become relevant.',
] as const;

export const SitemapPage = () => {
  return (
    <SupportPageLayout
      eyebrow="Site Map"
      title="Sitemap"
      description="A quick index of the major public routes across SA Church Finder so people can jump straight to the part of the site they need."
      actions={[
        { label: 'Search churches', to: '/search' },
        { label: 'View Privacy', to: '/privacy' },
      ]}
      heroAside={
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            Quick access
          </p>
          <p className="mt-3 text-sm leading-7 text-white/90">
            This page focuses on the main public routes, plus the support and legal pages linked
            from the footer.
          </p>
        </div>
      }
      aside={
        <SupportCard title="Need a specific church page?" tone="amber">
          <p className="text-sm leading-7 text-muted-foreground">
            Church profile URLs are generated from each church listing. Start from search or the
            homepage to open the right profile.
          </p>
          <Link
            to="/search"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Browse churches
          </Link>
        </SupportCard>
      }
    >
      <SupportPageSection
        title="Main routes"
        description="Use these links to move around the public parts of the site."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {sitemapSections.map((section) => (
            <SupportCard
              key={section.title}
              title={section.title}
              description={section.description}
              tone="default"
            >
              <div className="flex flex-col gap-3 text-sm font-semibold">
                {section.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="rounded-2xl border border-border bg-background px-4 py-3 transition-colors hover:border-foreground hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SupportCard>
          ))}
        </div>
      </SupportPageSection>

      <SupportPageSection
        title="Contextual routes"
        description="A couple of parts of the product depend on the user journey or a specific listing."
      >
        <SupportCard title="How dynamic pages work" tone="sky">
          <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
            {contextualRoutes.map((route) => (
              <li key={route}>{route}</li>
            ))}
          </ul>
        </SupportCard>
      </SupportPageSection>
    </SupportPageLayout>
  );
};

export default SitemapPage;
