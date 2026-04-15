import { useEffect, useId, useRef, useState } from 'react';
import { Check, CalendarClock, Copy } from 'lucide-react';

type SubscribeToCalendarButtonProps = {
  /**
   * Absolute HTTPS URL to the ICS feed. When building the webcal:// variant
   * for Apple Calendar we swap the scheme so the OS hands the URL off to the
   * Calendar app instead of downloading it in a browser.
   */
  feedUrl: string;
  /** Optional label override, e.g. "Subscribe to calendar" (default). */
  label?: string;
  /** Visual weight of the trigger. */
  variant?: 'subtle' | 'pill';
  className?: string;
};

const BUTTON_CLASSES: Record<NonNullable<SubscribeToCalendarButtonProps['variant']>, string> = {
  subtle:
    'inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C]',
  pill: 'inline-flex items-center gap-1.5 rounded-full bg-[#FF385C] px-4 py-2 text-[13px] font-semibold text-white shadow-airbnb-subtle transition-colors hover:bg-[#D70466] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF385C]',
};

const buildWebcalUrl = (httpsUrl: string): string => httpsUrl.replace(/^https?:\/\//, 'webcal://');

const buildGoogleSubscribeUrl = (httpsUrl: string): string =>
  `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(httpsUrl)}`;

const buildOutlookSubscribeUrl = (httpsUrl: string): string =>
  `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(
    httpsUrl,
  )}&name=${encodeURIComponent('SA Church Finder')}`;

export const SubscribeToCalendarButton = ({
  feedUrl,
  label = 'Subscribe to calendar',
  variant = 'subtle',
  className,
}: SubscribeToCalendarButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (e: MouseEvent | TouchEvent): void => {
      const target = e.target as Node | null;
      if (wrapperRef.current && target && !wrapperRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return (): void => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!copied) return undefined;
    const handle = window.setTimeout(() => setCopied(false), 2000);
    return (): void => window.clearTimeout(handle);
  }, [copied]);

  const webcalUrl = buildWebcalUrl(feedUrl);
  const googleUrl = buildGoogleSubscribeUrl(feedUrl);
  const outlookUrl = buildOutlookSubscribeUrl(feedUrl);

  const closeMenu = (): void => setIsOpen(false);

  const handleCopy = async (): Promise<void> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(feedUrl);
        setCopied(true);
        return;
      }
    } catch {
      // Fall through to the selection fallback so users on older browsers
      // or denied clipboard permissions can still grab the URL.
    }
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = feedUrl;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const triggerClass = `${BUTTON_CLASSES[variant]}${className ? ` ${className}` : ''}`;

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((prev) => !prev)}
        className={triggerClass}
      >
        <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{label}</span>
      </button>
      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Subscribe to this calendar feed"
          className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-airbnb"
        >
          <a
            role="menuitem"
            href={webcalUrl}
            onClick={closeMenu}
            className="block px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            Apple Calendar
            <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
              Opens with webcal:// for one-tap subscribe
            </span>
          </a>
          <a
            role="menuitem"
            href={googleUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={closeMenu}
            className="block px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            Google Calendar
            <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
              Adds the feed to your Google account
            </span>
          </a>
          <a
            role="menuitem"
            href={outlookUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={closeMenu}
            className="block px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            Outlook.com
            <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
              Opens Outlook web &ldquo;Add from web&rdquo;
            </span>
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              void handleCopy();
            }}
            className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-left text-[13px] font-medium text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{copied ? 'Feed URL copied' : 'Copy feed URL'}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};
