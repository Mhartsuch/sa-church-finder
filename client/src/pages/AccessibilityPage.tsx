import { Link } from 'react-router-dom';
import { buildSupportMailto } from '@/constants/support';
import {
  SupportCard,
  SupportPageLayout,
  SupportPageSection,
} from '@/components/support/SupportPageLayout';

const accessibilityCommitments = [
  {
    title: 'Keyboard-friendly navigation',
    description:
      'We aim to keep primary navigation, forms, dialogs, and core browsing flows workable without a mouse.',
  },
  {
    title: 'Clear structure and labels',
    description:
      'We use headings, form labels, and semantic structure to make the experience more understandable for assistive technologies.',
  },
  {
    title: 'Readable visual design',
    description:
      'We review contrast, spacing, and responsive behavior so content remains legible across screen sizes and zoom levels.',
  },
] as const;

const focusAreas = [
  {
    title: 'Map-heavy experiences',
    description:
      'Interactive maps can create extra complexity for keyboard and screen reader users, so we continue refining alternate browsing paths.',
  },
  {
    title: 'Church-supplied listing details',
    description:
      'Accessibility details like entrances, parking, restrooms, or assistive listening may vary by church and should still be confirmed directly.',
  },
  {
    title: 'Real-world feedback loops',
    description:
      'Accessibility issues are often easiest to improve when they come with concrete steps, device details, or assistive technology context.',
  },
] as const;

const planningTips = [
  'Use search filters such as Wheelchair Accessible when they match your needs, then confirm specifics with the church before visiting.',
  'Ask about entrances, seating, parking, restrooms, translation, and childcare accommodations if any of those details matter for your visit.',
  'Report inaccurate or missing accessibility details so we can improve the listing and follow up where appropriate.',
] as const;

export const AccessibilityPage = () => {
  return (
    <SupportPageLayout
      eyebrow="Accessibility"
      title="Accessibility"
      description="We are actively working toward a more inclusive church discovery experience and we use feedback to prioritize the places where access needs are most acute."
      actions={[
        { label: 'Explore churches', to: '/search' },
        {
          label: 'Request accessibility help',
          href: buildSupportMailto(
            'Accessibility support request',
            `Hello SA Church Finder team,\n\nI need accessibility support with:\n\nPage or church involved:\n\nDevice or assistive technology (if relevant):\n\nWhat would make this easier:\n\n`,
          ),
        },
      ]}
      heroAside={
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            Accessibility focus
          </p>
          <p className="mt-3 text-sm leading-7 text-white/90">
            We target WCAG 2.1 AA principles for the core browsing experience and keep iterating as
            new feedback comes in.
          </p>
        </div>
      }
      callout={
        <SupportCard
          title="Please tell us where the experience breaks down"
          description="We want specific accessibility issues, not just generic frustration. If a page, control, map, or content area becomes hard to use, that feedback helps us fix the right thing."
          tone="sky"
        />
      }
      aside={
        <>
          <SupportCard title="Need help planning a visit?" tone="sage">
            <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
              {planningTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </SupportCard>

          <SupportCard title="Report an accessibility issue" tone="amber">
            <p className="text-sm leading-7 text-muted-foreground">
              If a listing, page, or feature creates an access barrier, send us the page URL and
              what assistive setup you were using if you can.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <a
                href={buildSupportMailto(
                  'Accessibility issue report',
                  `Hello SA Church Finder team,\n\nI found an accessibility issue.\n\nPage or church involved:\n\nAssistive technology or device:\n\nWhat happened:\n\n`,
                )}
                className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Email accessibility support
              </a>
              <Link
                to="/report-a-concern"
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-muted"
              >
                Open concern reporting
              </Link>
            </div>
          </SupportCard>
        </>
      }
    >
      <SupportPageSection
        title="What we are designing for"
        description="These are the standards we try to keep in view as the product grows."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {accessibilityCommitments.map((item) => (
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
        title="Where feedback matters most"
        description="Some accessibility issues only show up in real use, especially around maps, church-supplied content, and device-specific workflows."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {focusAreas.map((item) => (
            <SupportCard
              key={item.title}
              title={item.title}
              description={item.description}
              tone="sky"
            />
          ))}
        </div>
      </SupportPageSection>
    </SupportPageLayout>
  );
};

export default AccessibilityPage;
