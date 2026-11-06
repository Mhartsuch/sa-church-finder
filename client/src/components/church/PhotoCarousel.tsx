import { Church, ChevronLeft, ChevronRight } from 'lucide-react';
import { MouseEvent, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface PhotoCarouselProps {
  photos: { url: string; alt: string }[];
  name: string;
  eager?: boolean;
}

/** Swipeable square photo strip used on church cards. Loads photos lazily as they come into view. */
export const PhotoCarousel = ({ photos, name, eager = false }: PhotoCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (!photos.length) return <PhotoPlaceholder name={name} />;

  const go = (event: MouseEvent, delta: number) => {
    event.preventDefault();
    event.stopPropagation();
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: track.clientWidth * (index + delta), behavior: 'smooth' });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (track) setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  const arrow =
    'absolute top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md opacity-0 transition hover:scale-105 hover:bg-white group-hover:opacity-100';

  return (
    <div className="group/photos relative h-full w-full">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto"
      >
        {photos.map((photo, i) => (
          <img
            key={photo.url}
            src={photo.url}
            alt={i === 0 ? photo.alt : ''}
            loading={eager && i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            className="h-full w-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>
      {photos.length > 1 && (
        <>
          {index > 0 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => go(e, -1)}
              className={cn(arrow, 'left-3')}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
          )}
          {index < photos.length - 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => go(e, 1)}
              className={cn(arrow, 'right-3')}
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          )}
          <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.slice(0, 5).map((photo, i) => (
              <span
                key={photo.url}
                className={cn(
                  'h-1.5 w-1.5 rounded-full bg-white transition-opacity',
                  i === Math.min(index, 4) ? 'opacity-100' : 'opacity-60',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const PhotoPlaceholder = ({ name, className }: { name: string; className?: string }) => (
  <div
    className={cn(
      'flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-stone-100 via-amber-50 to-rose-100 text-stone-500',
      className,
    )}
    role="img"
    aria-label={`${name} — photo coming soon`}
  >
    <Church className="h-10 w-10" strokeWidth={1.25} />
    <span className="px-6 text-center text-sm font-medium">{name}</span>
  </div>
);
