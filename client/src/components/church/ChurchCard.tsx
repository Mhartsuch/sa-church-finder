import { useEffect, useRef, useState } from 'react';
import { Heart, Scale, Star } from 'lucide-react';

import { IChurchSummary } from '@/types/church';
import { formatDistance, formatRating, getNextService } from '@/utils/format';

interface ChurchCardProps {
  church: IChurchSummary;
  isHovered: boolean;
  isCompared: boolean;
  onHover: (id: string | null) => void;
  onClick: (slug: string) => void;
  onToggleCompare: (church: IChurchSummary) => void;
  onToggleSave: (churchId: string) => void;
  isSavePending?: boolean;
}

export const ChurchCard = ({
  church,
  isHovered,
  isCompared,
  onHover,
  onClick,
  onToggleCompare,
  onToggleSave,
  isSavePending = false,
}: ChurchCardProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const prevSavedRef = useRef(church.isSaved);

  useEffect(() => {
    if (church.isSaved && !prevSavedRef.current) {
      setHeartPop(true);
      const timer = setTimeout(() => setHeartPop(false), 400);
      return () => clearTimeout(timer);
    }
    prevSavedRef.current = church.isSaved;
  }, [church.isSaved]);
  const nextService = getNextService(church.services);
  const hasCoverImage = Boolean(church.coverImageUrl) && !hasImageError;
  const profileLabel = `View ${church.name} profile`;
  const saveLabel = church.isSaved
    ? `Remove ${church.name} from saved churches`
    : `Save ${church.name}`;
  const compareLabel = isCompared
    ? `Remove ${church.name} from comparison`
    : `Add ${church.name} to comparison`;
  const badgeLabel =
    church.avgRating >= 4.8
      ? 'Guest favorite'
      : church.yearEstablished && church.yearEstablished < 1950
        ? 'Historic Landmark'
        : church.reviewCount >= 25
          ? 'Popular'
          : church.neighborhood || 'San Antonio';
  const locationLine = [church.neighborhood, church.city].filter(Boolean).join(', ');

  return (
    <article
      role="listitem"
      onMouseEnter={() => onHover(church.id)}
      onMouseLeave={() => onHover(null)}
      onFocusCapture={() => onHover(church.id)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onHover(null);
        }
      }}
      className={`group relative transition-transform duration-200 ${
        isHovered ? '-translate-y-0.5' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onClick(church.slug)}
        aria-label={profileLabel}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a] focus-visible:ring-offset-4"
      >
        <div className="relative mb-3 aspect-[20/19] overflow-hidden rounded-[12px] bg-[#f0ece6]">
          {hasCoverImage ? (
            <img
              src={church.coverImageUrl ?? undefined}
              alt={church.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              onError={() => {
                setHasImageError(true);
              }}
            />
          ) : (
            <div className="relative h-full w-full bg-[#f0ece6] text-[#9a8f7f]">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                <div className="relative h-28 w-44">
                  <div className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 rounded-full bg-[#d5cdc0]" />
                  <div className="absolute bottom-0 left-4 h-0 w-0 border-b-[64px] border-l-[54px] border-r-[54px] border-b-[#d5cdc0] border-l-transparent border-r-transparent" />
                  <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[76px] border-l-[60px] border-r-[60px] border-b-[#c4bdb0] border-l-transparent border-r-transparent" />
                </div>
                <p className="text-[15px] font-medium text-[#9a8f7f]">Church photo unavailable</p>
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3 rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1a1a1a] shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
            {badgeLabel}
          </div>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-[15px] font-semibold leading-[1.25] text-[#1a1a1a]">
              {church.name}
            </h3>
            {church.avgRating > 0 && (
              <div className="flex flex-shrink-0 items-center gap-1 pt-0.5 text-[14px] text-[#1a1a1a]">
                <Star className="h-3.5 w-3.5 fill-[#f5a623] text-[#f5a623]" />
                <span>{formatRating(church.avgRating)}</span>
              </div>
            )}
          </div>

          {church.denomination ? (
            <p className="text-[15px] leading-[1.35] text-[#6b6560]">{church.denomination}</p>
          ) : null}

          <p className="text-[15px] leading-[1.35] text-[#6b6560]">
            {locationLine || 'San Antonio'}, {formatDistance(church.distance)} away
          </p>

          {nextService ? (
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[14px] text-[#6b6560]">
              <span>{nextService}</span>
              <span className="rounded-full bg-[#e8f5e8] px-2 py-0.5 text-[11px] font-semibold text-[#2d7a3e]">
                Next service
              </span>
            </div>
          ) : null}

          <p className="pt-0.5 text-[14px] font-semibold text-[#1a1a1a] underline decoration-[#d5cdc0] underline-offset-4">
            {church.neighborhood || church.denominationFamily || 'View details'}
          </p>
        </div>
      </button>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => onToggleCompare(church)}
          aria-pressed={isCompared}
          aria-label={compareLabel}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-[12px] border px-4 py-3 text-sm font-semibold transition-colors ${
            isCompared
              ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
              : 'border-[#e0ddd8] bg-white text-[#1a1a1a] hover:border-[#1a1a1a]'
          }`}
        >
          <Scale className="h-4 w-4" />
          {isCompared ? 'Selected for compare' : 'Compare'}
        </button>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleSave(church.id);
        }}
        disabled={isSavePending}
        className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/16 backdrop-blur-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
        aria-label={saveLabel}
      >
        <Heart
          className={`h-6 w-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.32)] transition-transform ${heartPop ? 'animate-scale-pop' : ''}`}
          fill={church.isSaved ? '#d90b45' : 'rgba(17,24,39,0.45)'}
          stroke="white"
          strokeWidth={2}
        />
      </button>
    </article>
  );
};
