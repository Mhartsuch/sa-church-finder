const shimmerClass =
  'relative overflow-hidden bg-muted before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-background/60 before:to-transparent';

/**
 * Skeleton loading state for the ChurchProfilePage.
 * Mirrors the real page layout: hero image, title block, details, and review cards.
 */
export const ChurchProfileSkeleton = () => (
  <div className="flex-1 bg-background">
    {/* Hero image placeholder */}
    <div className={`h-[320px] w-full sm:h-[400px] ${shimmerClass}`} />

    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Title and subtitle */}
      <div className={`h-8 w-2/3 max-w-md rounded-lg ${shimmerClass}`} />
      <div className={`mt-3 h-5 w-1/3 max-w-xs rounded-md ${shimmerClass}`} />

      {/* Rating row */}
      <div className="mt-4 flex items-center gap-3">
        <div className={`h-5 w-12 rounded-md ${shimmerClass}`} />
        <div className={`h-5 w-32 rounded-md ${shimmerClass}`} />
      </div>

      {/* Action buttons row */}
      <div className="mt-6 flex gap-3">
        <div className={`h-10 w-24 rounded-full ${shimmerClass}`} />
        <div className={`h-10 w-24 rounded-full ${shimmerClass}`} />
        <div className={`h-10 w-24 rounded-full ${shimmerClass}`} />
      </div>

      {/* Description / about section */}
      <div className="mt-10">
        <div className={`h-6 w-32 rounded-md ${shimmerClass}`} />
        <div className="mt-4 space-y-2">
          <div className={`h-4 w-full rounded-md ${shimmerClass}`} />
          <div className={`h-4 w-full rounded-md ${shimmerClass}`} />
          <div className={`h-4 w-5/6 rounded-md ${shimmerClass}`} />
          <div className={`h-4 w-3/4 rounded-md ${shimmerClass}`} />
        </div>
      </div>

      {/* Service times section */}
      <div className="mt-10">
        <div className={`h-6 w-36 rounded-md ${shimmerClass}`} />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-5 w-24 rounded-md ${shimmerClass}`} />
              <div className={`h-5 w-32 rounded-md ${shimmerClass}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-10">
        <div className={`h-6 w-24 rounded-md ${shimmerClass}`} />
        <div className="mt-4 space-y-5">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${shimmerClass}`} />
                <div className="space-y-1.5">
                  <div className={`h-4 w-28 rounded-md ${shimmerClass}`} />
                  <div className={`h-3 w-20 rounded-md ${shimmerClass}`} />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className={`h-4 w-full rounded-md ${shimmerClass}`} />
                <div className={`h-4 w-4/5 rounded-md ${shimmerClass}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
