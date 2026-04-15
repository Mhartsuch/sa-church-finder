import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  isPending?: boolean;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isPending = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleEscape);
    confirmRef.current?.focus();

    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, isPending, onCancel]);

  if (!open) return null;

  const isDestructive = variant === 'destructive';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] animate-modal-overlay"
      onClick={() => {
        if (!isPending) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-card p-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] animate-modal-slide-up sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          {isDestructive && (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-light">
              <AlertTriangle className="h-5 w-5 text-brand" />
            </div>
          )}
          <div className="flex-1">
            <h3 id="confirm-title" className="text-[16px] font-semibold text-foreground">
              {title}
            </h3>
            <p
              id="confirm-desc"
              className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground"
            >
              {description}
            </p>
            {children}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-border px-5 py-2.5 text-[14px] font-semibold text-foreground transition-colors hover:border-foreground disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white transition-colors disabled:opacity-70 ${
              isDestructive ? 'bg-brand hover:bg-brand-dark' : 'bg-foreground hover:opacity-90'
            }`}
          >
            {isPending ? 'Please wait\u2026' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
