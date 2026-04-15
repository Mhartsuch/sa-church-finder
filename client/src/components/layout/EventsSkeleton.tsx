const shimmerClass =
  'relative overflow-hidden bg-muted before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-background/60 before:to-transparent';

/**
 * Skeleton loading state for the EventsDiscoveryPage.
 * Mirrors the real layout: header, filter bar, and event card placeholders.
 */
export const EventsSkeleton = () => (
  <div className="flex-1 bg-background">
    <section className="mx-auto max-w-[1760px] px-4 py-10 sm:px-6 lg:px-10">
      {/* Header area */}
      <div className={`h-4 w-44 rounded-md ${shimmerClass}`} />
      <div className={`mt-3 h-9 w-80 max-w-full rounded-lg ${shimmerClass}`} />
      <div className={`mt-3 h-4 w-96 max-w-full rounded-md ${shimmerClass}`} />

      {/* Filter bar placeholder */}
      <div className="mt-8 rounded-[20px] border border-border bg-card p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-1.5">
              <div className={`h-3 w-16 rounded-sm ${shimmerClass}`} />
              <div className={`h-10 w-full rounded-[10px] ${shimmerClass}`} />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className={`h-10 w-28 rounded-[10px] ${shimmerClass}`} />
        </div>
      </div>

      {/* Results heading */}
      <div className="mt-8">
        <div className={`h-5 w-48 rounded-md ${shimmerClass}`} />
        <div className={`mt-2 h-4 w-36 rounded-md ${shimmerClass}`} />
      </div>

      {/* Event card placeholders */}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex overflow-hidden rounded-2xl border border-border bg-card"
          >
            {/* Date column */}
            <div className={`w-[96px] flex-shrink-0 ${shimmerClass}`} />
            {/* Content area */}
            <div className="flex min-w-0 flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className={`h-5 w-3/4 rounded-md ${shimmerClass}`} />
                <div className={`h-6 w-16 flex-shrink-0 rounded-full ${shimmerClass}`} />
              </div>
              <div className={`mt-2 h-4 w-1/2 rounded-md ${shimmerClass}`} />
              <div className={`mt-3 h-3 w-full rounded-md ${shimmerClass}`} />
              <div className={`mt-1 h-3 w-4/5 rounded-md ${shimmerClass}`} />
              <div className="mt-3 flex gap-3">
                <div className={`h-4 w-20 rounded-md ${shimmerClass}`} />
                <div className={`h-4 w-24 rounded-md ${shimmerClass}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);
