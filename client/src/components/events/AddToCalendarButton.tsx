import { useEffect, useId, useRef, useState } from 'react';
import { CalendarPlus } from 'lucide-react';

import {
  buildGoogleCalendarUrl,
  buildIcsDataUri,
  buildIcsFilename,
  buildOutlookCalendarUrl,
  type CalendarEventInput,
} from '@/lib/calendar-links';

type AddToCalendarButtonProps = {
  event: CalendarEventInput;
  /** Visual weight of the trigger. Defaults to 'subtle'. */
  variant?: 'subtle' | 'pill';
  className?: string;
};

const BUTTON_CLASSES: Record<NonNullable<AddToCalendarButtonProps['variant']>, string> = {
  subtle:
    'inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C]',
  pill: 'inline-flex items-center gap-1.5 rounded-full bg-[#FF385C] px-4 py-2 text-[13px] font-semibold text-white shadow-airbnb-subtle transition-colors hover:bg-[#D70466] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF385C]',
};

export const AddToCalendarButton = ({
  event,
  variant = 'subtle',
  className,
}: AddToCalendarButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const googleUrl = buildGoogleCalendarUrl(event);
  const outlookUrl = buildOutlookCalendarUrl(event);
  const icsUri = buildIcsDataUri(event);
  const icsFilename = buildIcsFilename(event);

  const closeMenu = (): void => setIsOpen(false);

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
        <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Add to calendar</span>
      </button>
      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Add this event to your calendar"
          className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-airbnb"
        >
          <a
            role="menuitem"
            href={googleUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={closeMenu}
            className="block px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            Google Calendar
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
          </a>
          <a
            role="menuitem"
            href={icsUri}
            download={icsFilename}
            onClick={closeMenu}
            className="block px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            Apple Calendar (.ics)
          </a>
        </div>
      ) : null}
    </div>
  );
};
