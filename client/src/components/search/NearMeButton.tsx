import { LocateFixed, Navigation, X } from 'lucide-react';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/useToast';
import { useSearchStore } from '@/stores/search-store';

interface NearMeButtonProps {
  className?: string;
}

/**
 * Compact button that asks the browser for the user's location and applies
 * it as the search center. Renders in two states:
 *
 *   - Inactive: "Near me" — triggers the geolocation prompt on click.
 *   - Active:   "Near you" pill with an X affordance to clear.
 */
export const NearMeButton = ({ className }: NearMeButtonProps) => {
  const userLocation = useSearchStore((state) => state.userLocation);
  const setUserLocation = useSearchStore((state) => state.setUserLocation);
  const setSort = useSearchStore((state) => state.setSort);
  const { request, isLoading } = useGeolocation();
  const { addToast } = useToast();

  const handleActivate = async () => {
    try {
      const coords = await request();
      setUserLocation(coords);
      // "Near me" only makes sense when results are ordered by distance
      // from that point. Flip the sort so the top results actually reflect it.
      setSort('distance');
      addToast({
        message: 'Showing churches nearest to your location.',
        variant: 'success',
      });
    } catch (error) {
      const message =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Unable to access your location right now.';
      addToast({ message, variant: 'error' });
    }
  };

  const handleClear = () => {
    setUserLocation(null);
    addToast({
      message: 'Cleared your location. Showing San Antonio results.',
      variant: 'info',
    });
  };

  if (userLocation) {
    return (
      <div
        className={`inline-flex items-center gap-1 rounded-[10px] border border-foreground bg-foreground py-0.5 pl-3 pr-1 text-[13px] font-semibold text-white ${className ?? ''}`}
      >
        <span className="inline-flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5" />
          Near you
        </span>
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear 'near you' location"
          className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        void handleActivate();
      }}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 rounded-[10px] border border-border bg-card px-4 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:border-foreground disabled:cursor-progress disabled:opacity-70 ${className ?? ''}`}
      aria-label="Find churches near me"
    >
      <LocateFixed className={`h-4 w-4 ${isLoading ? 'animate-pulse' : ''}`} />
      {isLoading ? 'Locating…' : 'Near me'}
    </button>
  );
};
