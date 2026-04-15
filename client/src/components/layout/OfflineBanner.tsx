import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="fixed left-0 right-0 top-0 z-[100] bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white shadow-md"
    >
      <span className="inline-flex items-center gap-2">
        <WifiOff className="h-4 w-4" />
        You&apos;re offline. Some features may be unavailable.
      </span>
    </div>
  );
}
