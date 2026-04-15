import { Link } from 'react-router-dom';
import { buildSupportMailto } from '@/constants/support';
import {
  SupportCard,
  SupportPageLayout,
  SupportPageSection,
} from '@/components/support/SupportPageLayout';
import { useDocumentHead } from '@/hooks/useDocumentHead';

const termsPrinciples = [
  {
    title: 'Use the platform lawfully',
    description:
      'Do not use SA Church Finder for harassment, impersonation, fraud, hate speech, or anything else that violates the law or community safety.',
  },
  {
    title: 'Keep submissions honest',
    description:
      'If you post reviews, claim a church, or send updates, the information should be accurate and based on real experience or authorized representation.',
  },
  {
    title: 'Respect the product',
    description:
      'Do not attempt to break, overload, scrape, reverse engineer, or interfere with the service in ways that harm other users or the platform.',
  },
] as const;

const contentExpectations = [
  {
    title: 'Reviews and reports',
    description:
      'Community submissions may be moderated, removed, or restricted if they appear abusive, deceptive, irrelevant, or unsafe.',
  },
  {
    title: 'Church data accuracy',
    description:
      'We work to keep listings useful, but churches, schedules, accessibility details, and ministries can change and still need direct confirmation.',
  },
  {
    title: 'Availability and updates',
    description:
      'Features may evolve, pause, or change over time as the product grows, and some tools may be limited while they are still being built out.',
  },
] as const;

const legalNotes = [
  'SA Church Finder helps people discover churches, but it does not replace direct communication with a church before visiting, donating, or sharing sensitive information.',
  'The service is provided on an as-available basis, and we cannot guarantee uninterrupted access, complete accuracy, or fitness for every specific purpose.',
  'We may suspend access or remove content when needed to protect users, investigate misuse, or comply with legal obligations.',
] as const;

export const TermsPage = () => {
  useDocumentHead({
    title: 'Terms of Service',
    description:
      'Terms and conditions for using SA Church Finder, including acceptable use and content policies.',
    canonicalPath: '/terms',
  });

  return (
    <SupportPageLayout
      eyebrow="Legal"
      title="Terms"
      description="These plain-language terms describe the basic expectations for using SA Church Finder and the limits of what the platform promises."
      actions={[
        { label: 'View Privacy', to: '/privacy' },
        {
          label: 'Ask a question',
          href: buildSupportMailto(
            'Terms question',
            `Hello SA Church Finder team,\n\nI have a question about the platform terms.\n\nMy question:\n\n`,
          ),
        },
      ]}
      heroAside={
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            Core expectations
          </p>
          <ul className="mt-3 space-y-2">
            <li>Use the service honestly and respectfully.</li>
            <li>Verify critical church details directly before acting on them.</li>
            <li>Report misuse instead of escalating risky situations on your own.</li>
          </ul>
        </div>
      }
      callout={
        <SupportCard
          title="Emergency situations are outside normal platform support"
          description="If someone is in immediate danger or a crime is in progress, contact 911 or local emergency services before using any in-product report or support workflow."
          tone="rose"
        />
      }
      aside={
        <>
          <SupportCard title="Related pages" tone="amber">
            <div className="flex flex-col gap-3 text-sm font-semibold">
              <Link
                to="/privacy"
                className="rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-foreground hover:bg-muted"
              >
                Privacy
              </Link>
              <Link
                to="/safety-information"
                className="rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-foreground hover:bg-muted"
              >
                Safety information
              </Link>
            </div>
          </SupportCard>

          <SupportCard title="Need to report misuse?" tone="sage">
            <p className="text-sm leading-7 text-muted-foreground">
              If someone is abusing the platform, impersonating a church, or using deceptive
              information, send a report so we can review it.
            </p>
            <Link
              to="/report-a-concern"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Report a concern
            </Link>
          </SupportCard>
        </>
      }
    >
      <SupportPageSection
        title="Using the service"
        description="These are the baseline rules for participating on the platform."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {termsPrinciples.map((item) => (
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
        title="Content and platform limits"
        description="Not every piece of information on the site is guaranteed to stay current or complete."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {contentExpectations.map((item) => (
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
        title="Important legal context"
        description="This page summarizes practical expectations, not a custom agreement for every organization."
      >
        <SupportCard title="Before you rely on the service" tone="sage">
          <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
            {legalNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </SupportCard>
      </SupportPageSection>
    </SupportPageLayout>
  );
};

export default TermsPage;
