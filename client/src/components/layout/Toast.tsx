import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';

import type { Toast as ToastType } from '@/types/toast';
import { useToast } from '@/hooks/useToast';

const ICON_MAP = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
} as const;

const STYLE_MAP = {
  success: {
    bg: 'bg-card',
    icon: 'text-sage-600',
    border: 'border-sage-200',
  },
  error: {
    bg: 'bg-card',
    icon: 'text-brand',
    border: 'border-brand-light',
  },
  info: {
    bg: 'bg-card',
    icon: 'text-blue-600',
    border: 'border-blue-100',
  },
} as const;

const ToastItem = ({ toast, onDismiss }: { toast: ToastType; onDismiss: (id: string) => void }) => {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = ICON_MAP[toast.variant];
  const styles = STYLE_MAP[toast.variant];

  useEffect(() => {
    const exitTimeout = setTimeout(() => {
      setIsExiting(true);
    }, toast.duration - 300);

    return () => clearTimeout(exitTimeout);
  }, [toast.duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex w-[360px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border ${styles.border} ${styles.bg} px-4 py-3.5 shadow-airbnb ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}
    >
      <Icon className={`h-5 w-5 flex-shrink-0 ${styles.icon}`} />
      <p className="flex-1 pt-px text-[14px] font-medium leading-snug text-foreground">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div className="fixed bottom-20 left-4 right-4 z-[100] flex flex-col-reverse gap-3 sm:bottom-6 sm:left-auto sm:right-6">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>,
    document.body,
  );
};
