import { useState } from 'react';
import { Heart, Star } from 'lucide-react';

import { getChurchMonogram, getChurchVisualTheme } from '@/lib/church-visuals';
import { IChurchSummary } from '@/types/church';
import { formatDistance, formatRating, getNextService } from '@/utils/format';

interface ChurchCardProps {
  church: IChurchSummary;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (slug: string) => void;
  onToggleSave: (churchId: string) => void;
  isSavePending?: boolean;
}

export const ChurchCard = ({
  church,
  isHovered,
  onHover,
  onClick,
  onToggleSave,
  isSavePending = false,
}: ChurchCardProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const nextService = getNextService(church.services);
  const hasCoverImage = Boolean(church.coverImageUrl) && !hasImageError;
  const theme = getChurchVisualTheme(church);
  const monogram = getChurchMonogram(church.name);
  const profileLabel = `View ${church.name} profile`;
  const saveLabel = church.isSaved
    ? `Remove ${church.name} from saved churches`
    : `Save ${church.name}`;
  const badgeLabel = church.neighborhood || church.denomination || 'San Antonio';

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
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-4"
      >
        <div className="relative mb-3.5 aspect-[20/19] overflow-hidden rounded-[24px] bg-[#f2eee8]">
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
            <div
              className={`relative h-full w-full overflow-hidden bg-gradient-to-br ${theme.surfaceClass}`}
            >
              <div className={`absolute inset-0 ${theme.glowClass}`} />
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(0,0,0,0.06),rgba(0,0,0,0.32))]" />
              <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/12 text-sm font-semibold tracking-[0.18em] text-white backdrop-blur-sm">
                {monogram}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm ${theme.outlineClass}`}
                >
                  {church.denomination || 'San Antonio church'}
                </span>
                <div className="mt-4 space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                    {church.neighborhood || 'San Antonio'}
                  </p>
                  <p className="text-xl font-semibold leading-tight text-white">{church.name}</p>
                </div>
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#222222] shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
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
            <h3 className="line-clamp-1 text-[15px] font-semibold leading-6 text-[#222222]">
              {church.name}
            </h3>
            {church.avgRating > 0 && (
              <div className="flex flex-shrink-0 items-center gap-1 pt-0.5 text-[14px] text-[#222222]">
                <Star className="h-3.5 w-3.5 fill-[#222222] text-[#222222]" />
                <span>{formatRating(church.avgRating)}</span>
              </div>
            )}
          </div>

          {church.denomination ? (
            <p className="text-[14px] text-[#717171]">{church.denomination}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-1.5 text-[14px] text-[#717171]">
            {church.neighborhood ? <span>{church.neighborhood}</span> : null}
            {church.neighborhood ? <span>&middot;</span> : null}
            <span>{formatDistance(church.distance)} away</span>
          </div>

          {nextService ? (
            <p className="pt-1 text-[14px] font-semibold text-[#222222]">
              Next service:{' '}
              <span className="underline decoration-[#d5cab9] underline-offset-4">
                {nextService}
              </span>
            </p>
          ) : null}
        </div>
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleSave(church.id);
        }}
        disabled={isSavePending}
        className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/18 backdrop-blur-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#222222] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
        aria-label={saveLabel}
      >
        <Heart
          className="h-6 w-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.32)]"
          fill={church.isSaved ? '#FF385C' : 'rgba(0,0,0,0.4)'}
          stroke="white"
          strokeWidth={2}
        />
      </button>
    </article>
  );
};
