const shimmerClass =
  'relative overflow-hidden bg-muted before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-background/60 before:to-transparent';

/**
 * Generic page-level loading skeleton used as a Suspense fallback
 * for lazy-loaded routes that don't have a page-specific skeleton.
 */
export const PageFallback = () => (
  <div className="flex-1 bg-background">
    <div className="mx-auto max-w-[1760px] px-4 py-10 sm:px-6 lg:px-10">
      {/* Page title area */}
      <div className={`h-5 w-40 rounded-md ${shimmerClass}`} />
      <div className={`mt-3 h-9 w-72 rounded-md ${shimmerClass}`} />
      <div className={`mt-3 h-4 w-96 max-w-full rounded-md ${shimmerClass}`} />

      {/* Content area */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="space-y-3">
            <div className={`aspect-[16/10] rounded-xl ${shimmerClass}`} />
            <div className={`h-4 w-3/4 rounded-md ${shimmerClass}`} />
            <div className={`h-4 w-1/2 rounded-md ${shimmerClass}`} />
          </div>
        ))}
      </div>
    </div>
  </div>
);
