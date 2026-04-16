import { useEffect, useId, useRef, useState } from 'react';
import { Check, Copy, Facebook, Link2, Mail, Share2, Twitter } from 'lucide-react';

import { useToast } from '@/hooks/useToast';
import {
  buildFacebookShareUrl,
  buildMailtoShareUrl,
  buildTwitterShareUrl,
  canUseNativeShare,
  copyTextToClipboard,
  type ShareTarget,
} from '@/lib/share-links';

export type ShareButtonTarget = ShareTarget;

type ShareButtonVariant = 'inline' | 'subtle' | 'pill';

type ShareButtonProps = {
  target: ShareTarget;
  /** Visual style of the trigger. */
  variant?: ShareButtonVariant;
  /** Optional label override for the trigger. */
  label?: string;
  className?: string;
};

const TRIGGER_CLASSES: Record<ShareButtonVariant, string> = {
  inline:
    'flex items-center gap-2 text-sm font-semibold text-foreground underline hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C] focus-visible:ring-offset-2 rounded',
  subtle:
    'inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF385C]',
  pill: 'inline-flex items-center gap-1.5 rounded-full bg-[#FF385C] px-4 py-2 text-[13px] font-semibold text-white shadow-airbnb-subtle transition-colors hover:bg-[#D70466] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF385C]',
};

export const ShareButton = ({
  target,
  variant = 'inline',
  label = 'Share',
  className,
}: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();
  const { addToast } = useToast();

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (e: MouseEvent | TouchEvent): void => {
      const node = e.target as Node | null;
      if (wrapperRef.current && node && !wrapperRef.current.contains(node)) {
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
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return (): void => window.clearTimeout(timer);
  }, [copied]);

  const handleTriggerClick = async (): Promise<void> => {
    if (canUseNativeShare(target)) {
      try {
        await navigator.share({ title: target.title, text: target.text, url: target.url });
        return;
      } catch (err) {
        // AbortError = user dismissed the share sheet. Silently ignore; don't open the fallback menu.
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        // Any other failure: fall back to the menu.
      }
    }
    setIsOpen((prev) => !prev);
  };

  const handleCopy = async (): Promise<void> => {
    const ok = await copyTextToClipboard(target.url);
    if (ok) {
      setCopied(true);
      addToast({ message: 'Link copied to clipboard', variant: 'success', duration: 2500 });
    } else {
      addToast({ message: 'Unable to copy link', variant: 'error' });
    }
    setIsOpen(false);
  };

  const closeMenu = (): void => setIsOpen(false);

  const triggerClass = `${TRIGGER_CLASSES[variant]}${className ? ` ${className}` : ''}`;

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className={triggerClass}
        onClick={() => {
          void handleTriggerClick();
        }}
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        <span>{label}</span>
      </button>
      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          aria-label={`Share ${target.title}`}
          className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-border bg-card shadow-airbnb"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              void handleCopy();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-medium text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <a
            role="menuitem"
            href={buildTwitterShareUrl(target)}
            target="_blank"
            rel="noreferrer noopener"
            onClick={closeMenu}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            <Twitter className="h-4 w-4" aria-hidden="true" />
            Share on X
          </a>
          <a
            role="menuitem"
            href={buildFacebookShareUrl(target)}
            target="_blank"
            rel="noreferrer noopener"
            onClick={closeMenu}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            <Facebook className="h-4 w-4" aria-hidden="true" />
            Share on Facebook
          </a>
          <a
            role="menuitem"
            href={buildMailtoShareUrl(target)}
            onClick={closeMenu}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Share via email
          </a>
          <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Link2 className="h-3 w-3" aria-hidden="true" />
              <span className="truncate">{target.url}</span>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
