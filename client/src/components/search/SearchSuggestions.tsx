import { Clock, MapPin, Search, Star, X } from 'lucide-react';

import { useChurchSuggestions } from '@/hooks/useChurchSuggestions';
import { IChurchSummary } from '@/types/church';

interface SearchSuggestionsProps {
  term: string;
  recent: string[];
  onApplyTerm: (term: string) => void;
  onNavigateToChurch: (slug: string) => void;
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
}

const formatRating = (church: IChurchSummary): string | null => {
  if (church.reviewCount > 0 && church.avgRating > 0) {
    return church.avgRating.toFixed(1);
  }
  if (church.googleRating && church.googleRating > 0) {
    return church.googleRating.toFixed(1);
  }
  return null;
};

const formatLocation = (church: IChurchSummary): string => {
  if (church.neighborhood) return church.neighborhood;
  if (church.city) return church.city;
  return 'San Antonio';
};

export const SearchSuggestions = ({
  term,
  recent,
  onApplyTerm,
  onNavigateToChurch,
  onRemoveRecent,
  onClearRecent,
}: SearchSuggestionsProps) => {
  const trimmedTerm = term.trim();
  const hasTerm = trimmedTerm.length >= 2;
  const { suggestions, isFetching } = useChurchSuggestions(trimmedTerm);

  const hasRecent = recent.length > 0;
  const hasSuggestions = suggestions.length > 0;

  // Nothing to show — let the parent hide the popover entirely to avoid a
  // blank rectangle. We still render an empty shell during fetch so the user
  // gets a "searching…" hint instead of a popover flicker.
  if (!hasRecent && !hasTerm) {
    return null;
  }

  if (hasTerm && !isFetching && !hasSuggestions) {
    return (
      <div
        role="listbox"
        aria-label="Church search suggestions"
        className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-[18px] border border-border bg-card p-3 shadow-[0_16px_48px_rgba(0,0,0,0.18)]"
      >
        <button
          type="button"
          role="option"
          aria-selected="false"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onApplyTerm(trimmedTerm)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate">
            Search for &ldquo;<span className="text-foreground">{trimmedTerm}</span>&rdquo;
          </span>
        </button>
        <p className="px-3 pb-2 pt-2 text-xs text-muted-foreground">
          No church names match yet — press enter to run a full search instead.
        </p>
      </div>
    );
  }

  return (
    <div
      role="listbox"
      aria-label="Church search suggestions"
      className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-[18px] border border-border bg-card shadow-[0_16px_48px_rgba(0,0,0,0.18)]"
    >
      {hasTerm ? (
        <div className="border-b border-border/60 px-2 pb-2 pt-2">
          <button
            type="button"
            role="option"
            aria-selected="false"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onApplyTerm(trimmedTerm)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 truncate">
              Search for &ldquo;<span className="text-foreground">{trimmedTerm}</span>&rdquo;
            </span>
          </button>
        </div>
      ) : null}

      {hasTerm && hasSuggestions ? (
        <div className="px-2 pb-2 pt-2">
          <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Matching churches
          </p>
          <ul className="flex flex-col">
            {suggestions.map((church) => {
              const rating = formatRating(church);
              return (
                <li key={church.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onNavigateToChurch(church.slug)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {church.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {church.denomination ? `${church.denomination}  ·  ` : ''}
                        {formatLocation(church)}
                      </span>
                    </span>
                    {rating ? (
                      <span className="inline-flex flex-shrink-0 items-center gap-1 text-xs font-semibold text-foreground">
                        <Star className="h-3 w-3 fill-current" />
                        {rating}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {hasTerm && !hasSuggestions && isFetching ? (
        <div className="px-5 py-4 text-xs text-muted-foreground">Searching churches…</div>
      ) : null}

      {!hasTerm && hasRecent ? (
        <div className="px-2 pb-2 pt-2">
          <div className="flex items-center justify-between px-3 pb-1 pt-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Recent searches
            </p>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onClearRecent}
              className="text-[11px] font-semibold text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
            >
              Clear
            </button>
          </div>
          <ul className="flex flex-col">
            {recent.map((recentTerm) => (
              <li key={recentTerm} className="flex items-center gap-1">
                <button
                  type="button"
                  role="option"
                  aria-selected="false"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onApplyTerm(recentTerm)}
                  className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted"
                >
                  <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Clock className="h-4 w-4" />
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">
                    {recentTerm}
                  </span>
                </button>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onRemoveRecent(recentTerm)}
                  className="mr-2 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={`Remove recent search ${recentTerm}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
