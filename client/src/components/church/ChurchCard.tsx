import { useCallback, useEffect, useRef, useState } from 'react';
import { Accessibility, ChevronLeft, ChevronRight, Eye, Heart, Scale, Star } from 'lucide-react';

import { IChurchSummary } from '@/types/church';
import { formatRating, getNextService } from '@/utils/format';

interface ChurchCardProps {
  church: IChurchSummary;
  isHovered: boolean;
  isCompared: boolean;
  onHover: (id: string | null) => void;
  onClick: (slug: string) => void;
  onToggleCompare: (church: IChurchSummary) => void;
  onToggleSave: (churchId: string) => void;
  onQuickView?: (slug: string) => void;
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
  onQuickView,
  isSavePending = false,
}: ChurchCardProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [heartPop, setHeartPop] = useState(false);
  const prevSavedRef = useRef(church.isSaved);

  // Build images array from photos, falling back to cover image
  const images =
    church.photos && church.photos.length > 0
      ? church.photos.map((p) => p.url)
      : church.coverImageUrl
        ? [church.coverImageUrl]
        : [];
  const totalSlides = images.length;

  useEffect(() => {
    if (church.isSaved && !prevSavedRef.current) {
      setHeartPop(true);
      const timer = setTimeout(() => setHeartPop(false), 400);
      return () => clearTimeout(timer);
    }
    prevSavedRef.current = church.isSaved;
  }, [church.isSaved]);

  const handleImageError = useCallback((index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  }, []);

  const goToSlide = useCallback(
    (direction: 'prev' | 'next', event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      if (totalSlides <= 1) return;
      setCurrentSlide((prev) =>
        direction === 'next'
          ? prev < totalSlides - 1
            ? prev + 1
            : 0
          : prev > 0
            ? prev - 1
            : totalSlides - 1,
      );
    },
    [totalSlides],
  );

  // Effective rating: use local reviews when available, otherwise fall back to Google
  const effectiveRating = church.reviewCount > 0 ? church.avgRating : (church.googleRating ?? 0);
  const effectiveReviewCount =
    church.reviewCount > 0 ? church.reviewCount : (church.googleReviewCount ?? 0);

  const nextService = getNextService(church.services);
  const hasValidImages = totalSlides > 0 && !imageErrors.has(0);
  const profileLabel = `View ${church.name} profile`;
  const saveLabel = church.isSaved
    ? `Remove ${church.name} from saved churches`
    : `Save ${church.name}`;
  const compareLabel = isCompared
    ? `Remove ${church.name} from comparison`
    : `Add ${church.name} to comparison`;
  const isTemporarilyClosed = church.businessStatus === 'CLOSED_TEMPORARILY';

  const badgeLabel = isTemporarilyClosed
    ? 'Temporarily Closed'
    : effectiveRating >= 4.8
      ? 'Guest favorite'
      : church.goodForChildren
        ? 'Family Friendly'
        : church.yearEstablished && church.yearEstablished < 1950
          ? 'Historic Landmark'
          : effectiveReviewCount >= 25
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
      className={`group relative transition-transform duration-100 ${
        isHovered ? '-translate-y-0.5' : ''
      }`}
      style={{ animation: 'card-stagger-in 0.4s ease-out both' }}
    >
      {/* Image carousel — outside the <button> to allow nested interactive elements */}
      <div
        className="relative mb-3 aspect-[20/19] cursor-pointer overflow-hidden rounded-[12px] bg-muted"
        onClick={() => onClick(church.slug)}
        role="img"
        aria-label={`${church.name} photos`}
      >
        {hasValidImages ? (
          <div
            className="flex h-full transition-transform duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {images.map((url, i) => (
              <div key={i} className="h-full min-w-full">
                <img
                  src={url}
                  alt={`${church.name} photo ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={() => handleImageError(i)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative h-full w-full bg-muted text-muted-foreground">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              <div className="relative h-28 w-44">
                <div className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 rounded-full bg-muted-foreground/40" />
                <div className="absolute bottom-0 left-4 h-0 w-0 border-b-[64px] border-l-[54px] border-r-[54px] border-b-muted-foreground/40 border-l-transparent border-r-transparent" />
                <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[76px] border-l-[60px] border-r-[60px] border-b-muted-foreground/30 border-l-transparent border-r-transparent" />
              </div>
              <p className="text-[15px] font-medium text-muted-foreground">
                Church photo unavailable
              </p>
            </div>
          </div>
        )}

        {/* Badge */}
        <div
          className={`absolute left-[10px] top-[10px] z-[3] rounded px-2 py-1 text-[12px] font-bold shadow-[0_2px_4px_rgba(0,0,0,0.08)] ${
            isTemporarilyClosed ? 'bg-amber-100 text-amber-800' : 'bg-card text-foreground'
          }`}
        >
          {badgeLabel}
        </div>

        {/* Carousel arrows - shown on hover */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => goToSlide('prev', e)}
              className="absolute left-2 top-1/2 z-[3] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(255,255,255,0.92)] opacity-0 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.18)] transition-all hover:scale-[1.08] hover:bg-white group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-[10px] w-[10px] text-foreground" strokeWidth={3} />
            </button>
            <button
              type="button"
              onClick={(e) => goToSlide('next', e)}
              className="absolute right-2 top-1/2 z-[3] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(255,255,255,0.92)] opacity-0 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.18)] transition-all hover:scale-[1.08] hover:bg-white group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-[10px] w-[10px] text-foreground" strokeWidth={3} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        <div className="absolute bottom-2 left-1/2 z-[3] flex -translate-x-1/2 gap-1">
          {(totalSlides > 1 ? images : [null, null, null, null]).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                i === currentSlide && totalSlides > 1
                  ? 'scale-[1.2] bg-white'
                  : i === 0 && totalSlides <= 1
                    ? 'bg-white'
                    : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Quick View button */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onQuickView(church.slug);
            }}
            className="absolute bottom-2 right-2 z-[3] flex items-center gap-1.5 rounded-lg bg-[rgba(255,255,255,0.92)] px-2.5 py-1.5 text-[12px] font-semibold text-foreground opacity-0 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.18)] transition-all hover:scale-[1.04] hover:bg-white group-hover:opacity-100 max-md:opacity-100"
            aria-label={`Quick view ${church.name}`}
          >
            <Eye className="h-3.5 w-3.5" />
            Quick view
          </button>
        )}
      </div>

      {/* Card info — navigates to profile */}
      <button
        type="button"
        onClick={() => onClick(church.slug)}
        aria-label={profileLabel}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4"
      >
        <div className="space-y-0.5" style={{ padding: '10px 0 0' }}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-[15px] font-semibold leading-[1.25]">{church.name}</h3>
            <div className="flex flex-shrink-0 items-center gap-1.5">
              {church.wheelchairAccessible && (
                <Accessibility
                  className="h-3.5 w-3.5 text-blue-600"
                  aria-label="Wheelchair accessible"
                />
              )}
              {effectiveRating > 0 && (
                <div className="flex items-center gap-[3px] text-[15px]">
                  <Star className="h-3 w-3 fill-[#fbbf24] text-[#fbbf24]" />
                  <span>{formatRating(effectiveRating)}</span>
                  {effectiveReviewCount > 0 && (
                    <span className="text-muted-foreground">({effectiveReviewCount})</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {church.denomination ? (
            <p className="text-[15px] leading-[1.35] text-muted-foreground">
              {church.denomination}
            </p>
          ) : null}

          <p className="text-[15px] leading-[1.35] text-muted-foreground">
            {locationLine || 'San Antonio'}
          </p>

          {nextService ? (
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[15px] text-muted-foreground">
              <span>{nextService}</span>
              <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] font-semibold text-[#166534]">
                Next service
              </span>
            </div>
          ) : null}

          <p className="mt-1 text-[15px] font-semibold">
            <span className="underline">
              {church.neighborhood || church.denominationFamily || 'View details'}
            </span>
          </p>
        </div>
      </button>

      {/* Compare button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => onToggleCompare(church)}
          aria-pressed={isCompared}
          aria-label={compareLabel}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-[12px] border px-4 py-3 text-sm font-semibold transition-colors ${
            isCompared
              ? 'border-foreground bg-foreground text-white'
              : 'border-border bg-card text-foreground hover:border-foreground'
          }`}
        >
          <Scale className="h-4 w-4" />
          {isCompared ? 'Selected for compare' : 'Compare'}
        </button>
      </div>

      {/* Heart / Save button */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleSave(church.id);
        }}
        disabled={isSavePending}
        className="absolute right-[10px] top-[10px] z-10 p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
        aria-label={saveLabel}
      >
        <Heart
          className={`h-6 w-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] transition-transform ${heartPop ? 'animate-scale-pop' : ''}`}
          fill={church.isSaved ? '#FF385C' : 'rgba(0,0,0,0.5)'}
          stroke="white"
          strokeWidth={2}
        />
      </button>
    </article>
  );
};
