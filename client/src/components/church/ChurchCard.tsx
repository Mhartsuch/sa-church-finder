import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { HeartButton } from '@/components/church/HeartButton';
import { PhotoCarousel } from '@/components/church/PhotoCarousel';
import {
  churchPhotos,
  churchSubtitle,
  formatNextService,
  formatRating,
  getRating,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { IChurchSummary } from '@/types/church';

interface ChurchCardProps {
  church: IChurchSummary;
  eager?: boolean;
  highlighted?: boolean;
  onHover?: (id: string | null) => void;
}

export const ChurchCard = ({ church, eager, highlighted, onHover }: ChurchCardProps) => {
  const rating = getRating(church);
  const nextService = formatNextService(church.services);

  return (
    <Link
      to={`/churches/${church.slug}`}
      className="group block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900"
      onMouseEnter={() => onHover?.(church.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div
        className={cn(
          'relative aspect-square overflow-hidden rounded-xl bg-gray-100 transition-shadow',
          highlighted && 'ring-2 ring-gray-900 ring-offset-2',
        )}
      >
        <PhotoCarousel photos={churchPhotos(church)} name={church.name} eager={eager} />
        <div className="absolute right-2 top-2">
          <HeartButton churchId={church.id} churchName={church.name} saved={church.isSaved} />
        </div>
        {rating && rating.value >= 4.8 && rating.count >= 25 && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm">
            Community favorite
          </span>
        )}
      </div>
      <div className="mt-3 text-[15px] leading-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold">{church.name}</h3>
          {rating && (
            <span className="flex shrink-0 items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-current" />
              {formatRating(rating.value)}
            </span>
          )}
        </div>
        <p className="truncate text-gray-500">{churchSubtitle(church) || church.city}</p>
        {church.languages.length > 1 && (
          <p className="truncate text-gray-500">{church.languages.join(' & ')}</p>
        )}
        {nextService && (
          <p className="mt-1">
            <span className="font-semibold">{nextService}</span>{' '}
            <span className="text-gray-500">next service</span>
          </p>
        )}
      </div>
    </Link>
  );
};

export const ChurchCardSkeleton = () => (
  <div aria-hidden="true">
    <div className="aspect-square animate-pulse rounded-xl bg-gray-200" />
    <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
    <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200" />
    <div className="mt-2 h-4 w-2/5 animate-pulse rounded bg-gray-200" />
  </div>
);
