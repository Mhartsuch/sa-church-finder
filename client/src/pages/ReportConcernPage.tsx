import { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildSupportMailto, SUPPORT_EMAIL } from '@/constants/support';
import { useToast } from '@/hooks/useToast';
import {
  SupportCard,
  SupportPageLayout,
  SupportPageSection,
} from '@/components/support/SupportPageLayout';

const concernCategories = [
  'Unsafe behavior',
  'Spam or scam listing',
  'Harassment or hate speech',
  'Inaccurate accessibility information',
  'Impersonation or fraudulent claim',
  'Other',
] as const;

const fieldClassName =
  'mt-2 w-full rounded-[24px] border border-border bg-card px-4 py-3 text-sm leading-6 text-foreground outline-none transition-colors focus:border-foreground';

export const ReportConcernPage = () => {
  const { addToast } = useToast();
  const [category, setCategory] = useState<(typeof concernCategories)[number]>('Unsafe behavior');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [details, setDetails] = useState('');

  const concernSummary = [
    `Concern type: ${category}`,
    `Page, church, or URL: ${location || 'Not provided'}`,
    `Your contact info: ${contact || 'Prefer not to share'}`,
    '',
    'What happened?',
    details || '[Add as much detail as you can, including timing and any quoted text.]',
    '',
    'If anyone is in immediate danger, contact emergency services first.',
  ].join('\n');

  const reportMailto = buildSupportMailto(`Concern report: ${category}`, concernSummary);

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      addToast({
        message: 'Clipboard access is not available here. You can still email the report draft.',
        variant: 'info',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(concernSummary);
      addToast({ message: 'Concern summary copied to your clipboard.', variant: 'success' });
    } catch {
      addToast({
        message: 'We could not copy the summary. You can still use the email draft link below.',
        variant: 'error',
      });
    }
  };

  return (
    <SupportPageLayout
      eyebrow="Report"
      title="Report a concern"
      description="Share unsafe, misleading, fraudulent, or otherwise problematic activity connected to a listing, review, or account so we can review it quickly."
      actions={[
        { label: 'Safety information', to: '/safety-information' },
        { label: `Email ${SUPPORT_EMAIL}`, href: reportMailto },
      ]}
      heroAside={
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            Best reports include
          </p>
          <ul className="mt-3 space-y-2">
            <li>The exact church name or page URL</li>
            <li>What happened and when it happened</li>
            <li>Screenshots or quoted text when available</li>
          </ul>
        </div>
      }
      callout={
        <SupportCard
          title="Immediate danger should not wait for platform review"
          description="If someone is in immediate danger or you believe emergency help is needed right now, call 911 or local emergency services first."
          tone="rose"
        />
      }
      aside={
        <>
          <SupportCard title="What we can review" tone="amber">
            <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
              <li>Threatening or unsafe conduct tied to a listing or review</li>
              <li>Impersonation, fraudulent claims, or deceptive church details</li>
              <li>Harassment, hate speech, spam, or scam-like behavior</li>
              <li>Accessibility details that appear materially inaccurate</li>
            </ul>
          </SupportCard>

          <SupportCard title="Other ways to report" tone="sage">
            <p className="text-sm leading-7 text-muted-foreground">
              If the issue is a specific review, use the report action directly from the church
              profile. For broader listing or account issues, use the draft below.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/help-center"
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-muted"
              >
                Visit Help Center
              </Link>
              <Link
                to="/accessibility"
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-muted"
              >
                Accessibility support
              </Link>
            </div>
          </SupportCard>
        </>
      }
    >
      <SupportPageSection
        title="Prepare your report"
        description="This page does not fake a backend submit. It builds a clean draft you can copy or send through your email app right now."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <SupportCard
            title="Concern details"
            description="Add whatever context will help our review team verify the issue."
          >
            <form className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                What are you reporting?
                <select
                  aria-label="What are you reporting?"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as (typeof concernCategories)[number])
                  }
                  className={fieldClassName}
                >
                  {concernCategories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-foreground">
                Page, church, or URL
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Example: Grace Community Church profile"
                  className={fieldClassName}
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                Your contact info (optional)
                <input
                  type="text"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="Email or phone if you want a follow-up"
                  className={fieldClassName}
                />
              </label>

              <label className="block text-sm font-medium text-foreground">
                What happened?
                <textarea
                  aria-label="What happened?"
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Describe what happened, when it happened, and anything we should review."
                  rows={8}
                  className={fieldClassName}
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-muted"
                >
                  Copy concern summary
                </button>
                <a
                  href={reportMailto}
                  className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                >
                  Email the moderation team
                </a>
              </div>
            </form>
          </SupportCard>

          <SupportCard
            title="Draft preview"
            tone="sky"
            description="This is the summary that will be copied or included in your email draft."
          >
            <pre className="whitespace-pre-wrap rounded-[24px] border border-border bg-background px-4 py-4 text-sm leading-7 text-muted-foreground">
              {concernSummary}
            </pre>
          </SupportCard>
        </div>
      </SupportPageSection>
    </SupportPageLayout>
  );
};

export default ReportConcernPage;
