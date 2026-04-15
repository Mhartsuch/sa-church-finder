import { Link } from 'react-router-dom';
import { buildSupportMailto } from '@/constants/support';
import {
  SupportCard,
  SupportPageLayout,
  SupportPageSection,
} from '@/components/support/SupportPageLayout';
import { useDocumentHead } from '@/hooks/useDocumentHead';

const visitTips = [
  {
    title: 'Confirm details before you go',
    description:
      'Service times, parking instructions, and childcare availability can change. Check the church profile and official website before you head out.',
  },
  {
    title: 'Plan first visits thoughtfully',
    description:
      'If you are visiting somewhere unfamiliar, consider bringing a friend, sharing your plans, and arriving during clearly public service hours.',
  },
  {
    title: 'Use staffed, public settings first',
    description:
      'A first interaction should happen in a normal public church setting or another staffed environment, not a private or isolated meetup.',
  },
] as const;

const digitalSafetyTips = [
  {
    title: 'Protect personal information',
    description:
      'Be cautious with sensitive documents, financial details, or anything you would not normally share through a church’s public channels.',
  },
  {
    title: 'Verify off-platform requests',
    description:
      'If someone asks for money, private contact details, or unusual follow-up outside the listing, confirm that request with the church directly.',
  },
  {
    title: 'Trust your instincts',
    description:
      'If details feel inconsistent, overly urgent, or manipulative, pause and report the issue instead of trying to resolve it alone.',
  },
] as const;

const moderationSteps = [
  'Flag inappropriate reviews directly from the church profile when they violate community expectations.',
  'Use the concern reporting page for unsafe behavior, impersonation, spam, or patterns that need a broader platform review.',
  'Our team may review context, contact involved parties when needed, and remove or restrict content that breaks platform standards.',
] as const;

export const SafetyInformationPage = () => {
  useDocumentHead({
    title: 'Safety Information',
    description:
      'Tips for visiting churches safely in San Antonio — planning your visit, online safety, and reporting concerns.',
    canonicalPath: '/safety-information',
  });

  return (
    <SupportPageLayout
      eyebrow="Trust & Safety"
      title="Safety information"
      description="Helpful guidance for first visits, protecting your personal information, and knowing when to report a church, review, or broader platform concern."
      actions={[
        { label: 'Report a concern', to: '/report-a-concern' },
        { label: 'Browse churches', to: '/search' },
      ]}
      heroAside={
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            Quick checklist
          </p>
          <ul className="mt-3 space-y-2">
            <li>Confirm time and location before attending.</li>
            <li>Use public, staffed settings for first visits.</li>
            <li>Report suspicious or unsafe behavior quickly.</li>
          </ul>
        </div>
      }
      callout={
        <SupportCard
          title="Immediate danger should go to emergency services first"
          description="If someone is in immediate danger or you believe a crime is in progress, call 911 or contact local emergency services before using any platform report."
          tone="rose"
        />
      }
      aside={
        <>
          <SupportCard title="When to contact us" tone="amber">
            <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
              <li>Unsafe or threatening conduct tied to a listing or review</li>
              <li>Impersonation, fraud, or church claim misuse</li>
              <li>Spam, harassment, hate speech, or deceptive information</li>
            </ul>
            <a
              href={buildSupportMailto(
                'Safety concern',
                `Hello SA Church Finder team,\n\nI need to report a safety concern.\n\nChurch or page involved:\n\nWhat happened:\n\nWhen it happened:\n\n`,
              )}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Email the safety team
            </a>
          </SupportCard>

          <SupportCard title="What helps us review faster" tone="sky">
            <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
              <li>The exact church name or page URL</li>
              <li>What happened and when it happened</li>
              <li>Any screenshots, quoted text, or identifying details</li>
            </ul>
            <Link
              to="/report-a-concern"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-muted"
            >
              Open report form
            </Link>
          </SupportCard>
        </>
      }
    >
      <SupportPageSection
        title="Before you visit"
        description="The platform helps you discover churches, but your first visit still benefits from a few simple real-world checks."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {visitTips.map((item) => (
            <SupportCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </SupportPageSection>

      <SupportPageSection
        title="Protect your information"
        description="SA Church Finder does not process donations in-app, so treat unusual requests for money or personal documents with extra caution."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {digitalSafetyTips.map((item) => (
            <SupportCard
              key={item.title}
              title={item.title}
              description={item.description}
              tone="amber"
            />
          ))}
        </div>
      </SupportPageSection>

      <SupportPageSection
        title="How reporting works"
        description="Reports help us review content and behavior that may violate community expectations."
      >
        <SupportCard title="What happens after you report" tone="sage">
          <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
            {moderationSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </SupportCard>
      </SupportPageSection>
    </SupportPageLayout>
  );
};

export default SafetyInformationPage;
