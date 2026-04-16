import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Accessibility,
  Baby,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  MapPin,
  Star,
  Users,
  X,
} from 'lucide-react';

import { useChurch } from '@/hooks/useChurches';
import { formatRating, getNextService } from '@/utils/format';
import { Lightbox } from './Lightbox';

interface QuickViewModalProps {
  slug: string;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}

export const QuickViewModal = ({ slug, onClose, onNavigate }: QuickViewModalProps) => {
  const { data: church, isLoading } = useChurch(slug);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const images =
    church?.photos && church.photos.length > 0
      ? church.photos.map((p) => p.url)
      : church?.coverImageUrl
        ? [church.coverImageUrl]
        : [];
  const totalSlides = images.length;

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Escape key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxIndex === null) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, lightboxIndex]);

  // Focus trap
  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const goToSlide = useCallback(
    (direction: 'prev' | 'next') => {
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

  const effectiveRating =
    church && church.reviewCount > 0 ? church.avgRating : (church?.googleRating ?? 0);
  const effectiveReviewCount =
    church && church.reviewCount > 0 ? church.reviewCount : (church?.googleReviewCount ?? 0);

  const nextService = church ? getNextService(church.services) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 animate-modal-overlay sm:items-center sm:p-4"
        onClick={onClose}
      >
        {/* Modal panel */}
        <div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-label={church ? `Quick view of ${church.name}` : 'Loading church details'}
          className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-card shadow-[0_20px_80px_rgba(0,0,0,0.25)] animate-modal-slide-up sm:max-h-[90vh] sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-[5] flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-sm transition-colors hover:bg-muted"
            aria-label="Close quick view"
          >
            <X className="h-4 w-4" />
          </button>

          {isLoading || !church ? (
            <QuickViewSkeleton />
          ) : (
            <>
              {/* Photo carousel */}
              {images.length > 0 && (
                <div className="relative aspect-[16/10] w-full flex-shrink-0 overflow-hidden bg-muted">
                  <div
                    className="flex h-full transition-transform duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)]"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {images.map((url, i) => (
                      <div key={i} className="h-full min-w-full">
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(i)}
                          className="h-full w-full cursor-zoom-in"
                          aria-label={`View photo ${i + 1} full size`}
                        >
                          <img
                            src={url}
                            alt={church.photos?.[i]?.altText ?? `${church.name} photo ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Carousel arrows */}
                  {totalSlides > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => goToSlide('prev')}
                        className="absolute left-3 top-1/2 z-[3] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(255,255,255,0.92)] shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.18)] transition-all hover:scale-[1.08] hover:bg-white"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 text-foreground" strokeWidth={3} />
                      </button>
                      <button
                        type="button"
                        onClick={() => goToSlide('next')}
                        className="absolute right-3 top-1/2 z-[3] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(255,255,255,0.92)] shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_8px_16px_rgba(0,0,0,0.18)] transition-all hover:scale-[1.08] hover:bg-white"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-foreground" strokeWidth={3} />
                      </button>
                    </>
                  )}

                  {/* Dot indicators */}
                  {totalSlides > 1 && (
                    <div className="absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCurrentSlide(i)}
                          className={`h-2 w-2 rounded-full transition-all ${
                            i === currentSlide ? 'scale-[1.2] bg-white' : 'bg-white/50'
                          }`}
                          aria-label={`Go to photo ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Photo counter */}
                  <div className="absolute right-3 bottom-3 z-[3] rounded-md bg-black/50 px-2 py-0.5 text-[12px] font-medium text-white">
                    {currentSlide + 1} / {totalSlides}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {/* Header */}
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-foreground">{church.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {church.denomination && <span>{church.denomination}</span>}
                    {effectiveRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                        <span className="font-medium text-foreground">
                          {formatRating(effectiveRating)}
                        </span>
                        {effectiveReviewCount > 0 && <span>({effectiveReviewCount})</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="mb-4 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    {church.address}, {church.city}, {church.state} {church.zipCode}
                  </span>
                </div>

                {/* Next service */}
                {nextService && (
                  <div className="mb-4 flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{nextService}</span>
                    <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] font-semibold text-[#166534]">
                      Next service
                    </span>
                  </div>
                )}

                {/* Description */}
                {church.description && (
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                    {church.description}
                  </p>
                )}

                {/* Tags */}
                <div className="mb-5 flex flex-wrap gap-2">
                  {church.wheelchairAccessible && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      <Accessibility className="h-3 w-3" />
                      Wheelchair accessible
                    </span>
                  )}
                  {church.goodForChildren && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      <Baby className="h-3 w-3" />
                      Family friendly
                    </span>
                  )}
                  {church.goodForGroups && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                      <Users className="h-3 w-3" />
                      Good for groups
                    </span>
                  )}
                  {church.languages.length > 0 &&
                    church.languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      >
                        <Globe className="h-3 w-3" />
                        {lang}
                      </span>
                    ))}
                </div>

                {/* View full profile button */}
                <button
                  type="button"
                  onClick={() => onNavigate(slug)}
                  className="w-full rounded-xl bg-foreground py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-foreground/90"
                >
                  View full profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox for full-screen photo viewing */}
      {lightboxIndex !== null && images.length > 0 && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          alt={church?.name ?? 'Church photo'}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
};

function QuickViewSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[16/10] w-full bg-muted" />
      <div className="space-y-3 p-6">
        <div className="h-6 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="mt-4 h-11 w-full rounded-xl bg-muted" />
      </div>
    </div>
  );
}
