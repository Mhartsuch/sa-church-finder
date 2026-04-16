import { Link } from 'react-router-dom';
import { buildSupportMailto, SUPPORT_EMAIL } from '@/constants/support';
import {
  SupportCard,
  SupportPageLayout,
  SupportPageSection,
} from '@/components/support/SupportPageLayout';
import { useDocumentHead } from '@/hooks/useDocumentHead';

const informationCollected = [
  {
    title: 'Account details',
    description:
      'If you create an account, we store information like your name, email address, and authentication details needed to keep your access secure.',
  },
  {
    title: 'Church discovery activity',
    description:
      'Searches, saved churches, compare selections, and review activity help power the experience you see while using the product.',
  },
  {
    title: 'Support and safety reports',
    description:
      'Messages you send through support or concern-reporting workflows may include contact details and the issue context you choose to share.',
  },
] as const;

const informationUse = [
  {
    title: 'Operate the platform',
    description:
      'We use your information to let you browse churches, sign in, recover accounts, and use member features like reviews or saved churches.',
  },
  {
    title: 'Improve quality and safety',
    description:
      'Usage signals and reports help us investigate abuse, improve accessibility, and prioritize fixes where the product is falling short.',
  },
  {
    title: 'Communicate when needed',
    description:
      'We may email you about account verification, password resets, support follow-up, or important service-related updates.',
  },
] as const;

const privacyNotes = [
  'Church listing information may come from church representatives, public sources, or platform submissions and should still be verified directly before you visit.',
  'Third-party providers such as authentication, maps, hosting, analytics, and payment tools may process limited data when their services are used.',
  'We do not treat this page as legal advice. If your church or organization needs formal compliance guidance, consult qualified counsel.',
] as const;

export const PrivacyPage = () => {
  useDocumentHead({
    title: 'Privacy Policy',
    description: 'How SA Church Finder collects, uses, and protects your personal information.',
    canonicalPath: '/privacy',
  });

  return (
    <SupportPageLayout
      eyebrow="Legal"
      title="Privacy"
      description="This overview explains the kinds of information SA Church Finder uses, why we use it, and the practical choices you have when you use the platform."
      actions={[
        { label: 'Contact support', href: buildSupportMailto('Privacy question', '') },
        { label: 'View Terms', to: '/terms' },
      ]}
      heroAside={
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            At a glance
          </p>
          <ul className="mt-3 space-y-2">
            <li>We collect the minimum needed to operate accounts and core features.</li>
            <li>We review reports and abuse signals to protect the community.</li>
            <li>You can contact us if you need help with privacy questions.</li>
          </ul>
        </div>
      }
      aside={
        <>
          <SupportCard title="Questions about your data?" tone="sage">
            <p className="text-sm leading-7 text-muted-foreground">
              Email {SUPPORT_EMAIL} with the address tied to your account and a short description of
              what you need help with.
            </p>
            <a
              href={buildSupportMailto(
                'Privacy request',
                `Hello SA Church Finder team,\n\nI have a privacy question or request.\n\nAccount email:\n\nWhat I need help with:\n\n`,
              )}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Email privacy support
            </a>
          </SupportCard>

          <SupportCard title="Related pages" tone="amber">
            <div className="flex flex-col gap-3 text-sm font-semibold">
              <Link
                to="/terms"
                className="rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-foreground hover:bg-muted"
              >
                Terms
              </Link>
              <Link
                to="/sitemap"
                className="rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-foreground hover:bg-muted"
              >
                Sitemap
              </Link>
            </div>
          </SupportCard>
        </>
      }
    >
      <SupportPageSection
        title="Information we collect"
        description="The data involved depends on how you use the product."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {informationCollected.map((item) => (
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
        title="How we use it"
        description="We use information to keep the product functional, safer, and easier to improve."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {informationUse.map((item) => (
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
        title="Additional notes"
        description="A few practical limits and expectations are worth calling out clearly."
      >
        <SupportCard title="Important context" tone="sage">
          <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
            {privacyNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </SupportCard>
      </SupportPageSection>
    </SupportPageLayout>
  );
};

export default PrivacyPage;
