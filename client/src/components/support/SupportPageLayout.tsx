import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type SupportAction = {
  label: string;
  href?: string;
  to?: string;
};

type SupportCardTone = 'default' | 'sage' | 'rose' | 'amber' | 'sky';

interface SupportPageLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: SupportAction[];
  heroAside?: ReactNode;
  callout?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}

interface SupportCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: SupportCardTone;
  children?: ReactNode;
}

interface SupportPageSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const ACTION_CLASS_NAME =
  'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors';

const CARD_TONE_CLASS_NAMES: Record<SupportCardTone, string> = {
  default: 'border border-border bg-card',
  sage: 'border border-[#d7e6dc] bg-[#f5faf7]',
  rose: 'border border-[#f3c7d0] bg-[#fff2f5]',
  amber: 'border border-[#ecd8ad] bg-[#fff8e7]',
  sky: 'border border-[#d5e7f4] bg-[#f3f9ff]',
};

const renderAction = (action: SupportAction, index: number) => {
  const className =
    index === 0
      ? `${ACTION_CLASS_NAME} bg-foreground text-background hover:opacity-90`
      : `${ACTION_CLASS_NAME} border border-white/30 bg-white/10 text-white hover:bg-white/15`;

  if (action.href) {
    return (
      <a key={action.label} href={action.href} className={className}>
        {action.label}
        <ArrowRight className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link key={action.label} to={action.to ?? '/'} className={className}>
      {action.label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
};

export const SupportPageLayout = ({
  eyebrow,
  title,
  description,
  actions,
  heroAside,
  callout,
  aside,
  children,
}: SupportPageLayoutProps) => {
  return (
    <main className="flex-1 bg-background">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <section className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#1f4d45_0%,#2f6d61_55%,#f0c98b_100%)] px-6 py-8 text-white shadow-[0_24px_80px_-44px_rgba(31,77,69,0.65)] sm:px-10 sm:py-12">
          <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_320px] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                {eyebrow}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 sm:text-[17px]">
                {description}
              </p>
              {actions && actions.length > 0 ? (
                <div className="mt-8 flex flex-wrap gap-3">{actions.map(renderAction)}</div>
              ) : null}
            </div>
            {heroAside ? (
              <div className="rounded-[28px] border border-white/20 bg-white/10 p-5 text-sm leading-6 text-white/90 backdrop-blur-sm">
                {heroAside}
              </div>
            ) : null}
          </div>
        </section>

        {callout ? <div className="mt-6">{callout}</div> : null}

        <div className={`mt-8 grid gap-6 ${aside ? 'lg:grid-cols-[minmax(0,1fr)_320px]' : ''}`}>
          <div className="space-y-6">{children}</div>
          {aside ? <aside className="space-y-6">{aside}</aside> : null}
        </div>
      </div>
    </main>
  );
};

export const SupportCard = ({
  eyebrow,
  title,
  description,
  tone = 'default',
  children,
}: SupportCardProps) => {
  return (
    <section className={`rounded-[32px] p-6 shadow-airbnb-subtle ${CARD_TONE_CLASS_NAMES[tone]}`}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h3
        className={`${eyebrow ? 'mt-3' : ''} text-xl font-semibold tracking-tight text-foreground`}
      >
        {title}
      </h3>
      {description ? (
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
};

export const SupportPageSection = ({ title, description, children }: SupportPageSectionProps) => {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
};
