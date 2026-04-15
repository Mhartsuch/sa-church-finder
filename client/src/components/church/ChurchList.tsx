import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthSession } from '@/hooks/useAuth';
import { useChurchSearchParams, useChurches, useToggleSavedChurch } from '@/hooks/useChurches';
import { useToast } from '@/hooks/useToast';
import { useCompareStore } from '@/stores/compare-store';
import { useSearchStore } from '@/stores/search-store';
import { IChurchSummary } from '@/types/church';
import { NoResults } from '@/components/search/NoResults';
import { ChurchCard } from './ChurchCard';
import { ChurchCardSkeletonGrid } from './ChurchCardSkeleton';
import { QuickViewModal } from './QuickViewModal';

interface ChurchListProps {
  variant?: 'grid' | 'sidebar';
}

export const ChurchList = ({ variant = 'sidebar' }: ChurchListProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const toggleSavedChurchMutation = useToggleSavedChurch();
  const page = useSearchStore((state) => state.page);
  const hoveredChurchId = useSearchStore((state) => state.hoveredChurchId);
  const setHoveredChurch = useSearchStore((state) => state.setHoveredChurch);
  const setPage = useSearchStore((state) => state.setPage);
  const selectedChurches = useCompareStore((state) => state.selectedChurches);
  const toggleChurch = useCompareStore((state) => state.toggleChurch);
  const { addToast } = useToast();
  const [actionError, setActionError] = useState<string | null>(null);
  const [quickViewSlug, setQuickViewSlug] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const previousPageRef = useRef(page);

  const searchParams = useChurchSearchParams();
  const { data, error, isLoading } = useChurches(searchParams);

  // Scroll the results list into view when the user paginates. Without this,
  // clicking "next" renders the new page off-screen below the viewport and
  // users think nothing happened. Skip the initial mount and any navigation
  // that doesn't actually change the page number.
  useEffect(() => {
    if (previousPageRef.current === page) {
      return;
    }
    previousPageRef.current = page;

    const container = resultsRef.current;
    if (!container) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    container.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [page]);

  // Memoize the churches array so its identity is stable across renders that
  // don't actually change the data — otherwise it changes on every render and
  // invalidates the dependencies of `handleToggleSave`'s useCallback below.
  const churches = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;
  const totalPages = meta?.totalPages || 1;

  const handleToggleSave = useCallback(
    async (churchId: string) => {
      setActionError(null);

      if (!user) {
        navigate('/login', {
          state: {
            from: {
              pathname: location.pathname,
              search: location.search,
            },
          },
        });
        return;
      }

      try {
        await toggleSavedChurchMutation.mutateAsync(churchId);
        const church = churches.find((c) => c.id === churchId);
        const wasSaved = church?.isSaved;
        addToast({
          message: wasSaved ? 'Removed from saved churches' : 'Saved to your list',
          variant: 'success',
          ...(wasSaved
            ? {
                action: {
                  label: 'Undo',
                  onClick: () => {
                    void toggleSavedChurchMutation.mutateAsync(churchId);
                  },
                },
                duration: 6000,
              }
            : {}),
        });
      } catch (saveError) {
        addToast({
          message:
            saveError instanceof Error
              ? saveError.message
              : 'Unable to update saved churches right now.',
          variant: 'error',
        });
      }
    },
    [addToast, churches, location.pathname, location.search, navigate, toggleSavedChurchMutation, user],
  );

  // Stable references for ChurchCard memoization — inline arrow functions
  // would invalidate React.memo on every parent render.
  const handleCardClick = useCallback(
    (slug: string) => navigate(`/churches/${slug}`),
    [navigate],
  );

  const handleToggleCompare = useCallback(
    (c: IChurchSummary) => {
      const wasCompared = selectedChurches.some((s) => s.id === c.id);
      toggleChurch(c);
      addToast({
        message: wasCompared
          ? `${c.name} removed from compare`
          : `${c.name} added to compare`,
        variant: 'info',
      });
    },
    [addToast, selectedChurches, toggleChurch],
  );

  const handleQuickView = useCallback((slug: string) => setQuickViewSlug(slug), []);

  const handleToggleSaveAction = useCallback(
    (churchId: string) => {
      void handleToggleSave(churchId);
    },
    [handleToggleSave],
  );

  if (isLoading) {
    return <ChurchCardSkeletonGrid count={variant === 'grid' ? 8 : 6} variant={variant} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Something went wrong</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (churches.length === 0) {
    return <NoResults />;
  }

  return (
    <div ref={resultsRef} className="scroll-mt-[140px] sm:scroll-mt-[176px]">
      {actionError ? (
        <div className="mb-5 rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]">
          {actionError}
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        Showing {meta?.total ?? churches.length} churches. Tab through the results and press Enter
        to open a church profile.
      </p>

      <div
        role="list"
        aria-label="Search results"
        className={
          variant === 'grid'
            ? 'grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
            : 'grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2'
        }
      >
        {churches.map((church, index) => (
          <div
            key={church.id}
            className="animate-card-in"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <ChurchCard
              church={church}
              isHovered={hoveredChurchId === church.id}
              isCompared={selectedChurches.some(
                (selectedChurch) => selectedChurch.id === church.id,
              )}
              onHover={setHoveredChurch}
              onClick={handleCardClick}
              onToggleCompare={handleToggleCompare}
              onQuickView={handleQuickView}
              onToggleSave={handleToggleSaveAction}
              isSavePending={
                toggleSavedChurchMutation.isPending &&
                toggleSavedChurchMutation.variables === church.id
              }
            />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-0.5 pb-4 pt-12 sm:gap-1"
          aria-label="Search results pagination"
        >
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent sm:h-11 sm:w-11"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, index) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = index + 1;
              } else if (page <= 4) {
                pageNum = index + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + index;
              } else {
                pageNum = page - 3 + index;
              }

              const isCurrent = page === pageNum;

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors sm:h-11 sm:w-11 sm:text-sm ${
                    isCurrent ? 'bg-foreground text-white' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent sm:h-11 sm:w-11"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}

      {quickViewSlug && (
        <QuickViewModal
          slug={quickViewSlug}
          onClose={() => setQuickViewSlug(null)}
          onNavigate={(slug) => {
            setQuickViewSlug(null);
            navigate(`/churches/${slug}`);
          }}
        />
      )}
    </div>
  );
};
