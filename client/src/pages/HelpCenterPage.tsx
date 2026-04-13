import { Link } from 'react-router-dom';
import { buildSupportMailto, SUPPORT_EMAIL } from '@/constants/support';
import {
  SupportCard,
  SupportPageLayout,
  SupportPageSection,
} from '@/components/support/SupportPageLayout';
import { useDocumentHead } from '@/hooks/useDocumentHead';

const gettingStartedItems = [
  {
    title: 'Find churches by fit',
    description:
      'Use search and filters to narrow by tradition, day, time, language, and amenities like parking or wheelchair accessibility.',
  },
  {
    title: 'Compare a few favorites',
    description:
      'Add churches to Compare from listing cards or profile pages when you want to review a few options side by side.',
  },
  {
    title: 'Browse before signing in',
    description:
      'You can search and read listings without an account. Sign in only when you want saved churches, reviews, or church claim requests.',
  },
] as const;

const accountItems = [
  {
    title: 'Saved churches and shortlists',
    description:
      'Accounts let you save churches you want to revisit later and keep a more deliberate shortlist as you explore.',
  },
  {
    title: 'Reviews and moderation',
    description:
      'Signed-in members can leave reviews and flag inappropriate ones for moderation if something feels misleading or unsafe.',
  },
  {
    title: 'Password recovery',
    description:
      'Use the password recovery flow from the sign-in pages if you lose access to your account or need a fresh reset link.',
  },
] as const;

const representativeItems = [
  {
    title: 'Claim an unclaimed listing',
    description:
      'Church representatives can request ownership from a church profile so the listing can be tied back to a verified account.',
  },
  {
    title: 'Keep details accurate',
    description:
      'Service times, descriptions, and contact details should reflect what visitors can expect right now so first visits feel easier.',
  },
  {
    title: 'More management tools are rolling out',
    description:
      'Claimed listings are the foundation for future church-admin tooling, including richer profile and event management workflows.',
  },
] as const;

export const HelpCenterPage = () => {
  useDocumentHead({
    title: 'Help Center',
    description:
      'Get help with SA Church Finder — search tips, account management, reviews, and church claim requests.',
    canonicalPath: '/help-center',
  });

  return (
    <SupportPageLayout
      eyebrow="Support"
      title="Help Center"
      description="Practical help for browsing churches, comparing options, managing your account, and understanding what the platform can do today."
      actions={[
        { label: 'Explore churches', to: '/search' },
        { label: 'Report a concern', to: '/report-a-concern' },
      ]}
      heroAside={
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            Popular tasks
          </p>
          <ul className="mt-3 space-y-2">
            <li>Use filters to narrow by language, service time, and amenities.</li>
            <li>Compare several churches before you plan a visit.</li>
            <li>Claim a listing if you represent an unclaimed church.</li>
          </ul>
        </div>
      }
      aside={
        <>
          <SupportCard title="Need a direct handoff?" tone="sage">
            <p className="text-sm leading-7 text-muted-foreground">
              If you are stuck or something looks off, email our team and include the church name,
              the page URL, and what you expected to happen.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href={buildSupportMailto(
                  'Help Center request',
                  `Hello SA Church Finder team,\n\nI need help with:\n\nRelevant church or page:\n\nWhat I already tried:\n\n`,
                )}
                className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Email {SUPPORT_EMAIL}
              </a>
              <Link
                to="/report-a-concern"
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-muted"
              >
                Open concern reporting
              </Link>
            </div>
          </SupportCard>

          <SupportCard title="Related pages" tone="amber">
            <div className="flex flex-col gap-3 text-sm font-semibold">
              <Link
                to="/safety-information"
                className="rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-foreground hover:bg-muted"
              >
                Safety information
              </Link>
              <Link
                to="/accessibility"
                className="rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-foreground hover:bg-muted"
              >
                Accessibility
              </Link>
            </div>
          </SupportCard>
        </>
      }
    >
      <SupportPageSection
        title="Getting started"
        description="These are the fastest ways to get value from the platform if you are visiting for the first time."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {gettingStartedItems.map((item) => (
            <SupportCard
              key={item.title}
              title={item.title}
              description={item.description}
              tone="default"
            />
          ))}
        </div>
      </SupportPageSection>

      <SupportPageSection
        title="Accounts and reviews"
        description="An account adds personal tools, but it is not required for general church discovery."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {accountItems.map((item) => (
            <SupportCard
              key={item.title}
              title={item.title}
              description={item.description}
              tone="sky"
            />
          ))}
        </div>
      </SupportPageSection>

      <SupportPageSection
        title="For church representatives"
        description="If you help lead or manage a congregation, the claim workflow is the right place to start."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {representativeItems.map((item) => (
            <SupportCard
              key={item.title}
              title={item.title}
              description={item.description}
              tone="sage"
            />
          ))}
        </div>
      </SupportPageSection>
    </SupportPageLayout>
  );
};

export default HelpCenterPage;
