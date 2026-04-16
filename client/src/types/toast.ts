export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  action?: ToastAction;
}

export interface ToastInput {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}
