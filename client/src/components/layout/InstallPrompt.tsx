import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-install-dismissed';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Don't show if previously dismissed
    if (localStorage.getItem(DISMISS_KEY) === 'true') return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISS_KEY, 'true');
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-[calc(80px+env(safe-area-inset-bottom,0px))] left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom lg:bottom-6">
      <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-white p-4 shadow-lg dark:border-teal-800 dark:bg-gray-900">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Install SA Church Finder
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add to your home screen for quick access
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Dismiss
          </button>
          <button
            onClick={handleInstall}
            className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-teal-800"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
