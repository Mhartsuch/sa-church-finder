import { X } from 'lucide-react';
import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'full';
}

/** Accessible dialog with an Airbnb-style centered sheet (full-height on phones). */
export const Modal = ({ open, onClose, title, children, footer, size = 'md' }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/50 animate-fade" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl outline-none animate-rise sm:rounded-2xl',
          size === 'md' && 'sm:max-w-xl',
          size === 'lg' && 'sm:max-w-3xl',
          size === 'full' && 'h-full max-h-none rounded-none sm:max-w-none sm:rounded-none',
        )}
      >
        <header className="relative flex h-16 shrink-0 items-center justify-center border-b border-gray-200 px-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute left-4 rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <h2 className="text-base font-semibold">{title}</h2>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <footer className="shrink-0 border-t border-gray-200 px-6 py-4">{footer}</footer>
        )}
      </div>
    </div>,
    document.body,
  );
};
