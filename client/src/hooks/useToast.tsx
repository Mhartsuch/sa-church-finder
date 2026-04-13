/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useCallback, useContext, useReducer } from 'react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastInput {
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

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

interface ToastContextValue {
  toasts: Toast[];
  addToast: (input: ToastInput) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

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

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export type { Toast, ToastVariant };
