import { ReactNode, useCallback, useReducer } from 'react';

import type { Toast, ToastInput } from '@/types/toast';
import { ToastContext } from '@/hooks/toast-context';

interface ToastState {
  toasts: Toast[];
}

type ToastAction = { type: 'ADD'; toast: Toast } | { type: 'DISMISS'; id: string };

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD':
      return { toasts: [...state.toasts, action.toast] };
    case 'DISMISS':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
  }
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: 'DISMISS', id });
  }, []);

  const addToast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const toast: Toast = {
        id,
        message: input.message,
        variant: input.variant ?? 'success',
        duration: input.duration ?? 4000,
      };
      dispatch({ type: 'ADD', toast });

      setTimeout(() => {
        dismissToast(id);
      }, toast.duration);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};
