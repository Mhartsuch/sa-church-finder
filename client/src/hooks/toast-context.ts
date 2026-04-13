import { createContext } from 'react';

import type { Toast, ToastInput } from '@/types/toast';

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (input: ToastInput) => void;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
