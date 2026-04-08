import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';

import { Toast as ToastType, useToast } from '@/hooks/useToast';

const ICON_MAP = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
} as const;

const STYLE_MAP = {
  success: {
    bg: 'bg-white',
    icon: 'text-sage-600',
    border: 'border-sage-200',
  },
  error: {
    bg: 'bg-white',
    icon: 'text-brand',
    border: 'border-brand-light',
  },
  info: {
    bg: 'bg-white',
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
      <p className="flex-1 pt-px text-[14px] font-medium leading-snug text-[#222]">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 rounded-full p-0.5 text-[#999] transition-colors hover:text-[#222]"
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
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>,
    document.body,
  );
};
