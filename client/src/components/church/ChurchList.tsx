import { useState } from 'react';
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

  const searchParams = useChurchSearchParams();
  const { data, error, isLoading } = useChurches(searchParams);

  const churches = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages || 1;

  const handleToggleSave = async (churchId: string) => {
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
        message: wasSaved ? 'Removed from your wishlist' : 'Saved to your wishlist',
        variant: 'success',
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
  };

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
    <div>
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
              onClick={(slug) => navigate(`/churches/${slug}`)}
              onToggleCompare={(c: IChurchSummary) => {
                const wasCompared = selectedChurches.some((s) => s.id === c.id);
                toggleChurch(c);
                addToast({
                  message: wasCompared
                    ? `${c.name} removed from compare`
                    : `${c.name} added to compare`,
                  variant: 'info',
                });
              }}
              onToggleSave={(churchId) => {
                void handleToggleSave(churchId);
              }}
              isSavePending={
                toggleSavedChurchMutation.isPending &&
                toggleSavedChurchMutation.variables === church.id
              }
            />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pb-4 pt-12">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
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

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`h-8 w-8 rounded-full text-sm font-semibold transition-colors ${
                    page === pageNum ? 'bg-foreground text-white' : 'text-foreground hover:bg-muted'
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
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
};
