/**
 * Shimmer loading skeleton for ChurchCard — matches the exact layout
 * of the real ChurchCard so there's zero layout shift when data loads.
 *
 * Uses a CSS shimmer gradient animation instead of basic pulse
 * for a polished, Airbnb-style loading feel.
 */

const shimmerClass =
  'relative overflow-hidden bg-gray-200 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export const ChurchCardSkeleton = () => {
  return (
    <div className="group">
      {/* Image skeleton — matches aspect-[20/19] */}
      <div className={`aspect-[20/19] rounded-xl mb-3 ${shimmerClass}`} />

      {/* Content skeleton — matches ChurchCard layout */}
      <div className="space-y-1.5">
        {/* Title row with rating */}
        <div className="flex items-start justify-between gap-2">
          <div className={`h-[18px] rounded-md w-3/4 ${shimmerClass}`} />
          <div className={`h-[18px] rounded-md w-10 flex-shrink-0 ${shimmerClass}`} />
        </div>

        {/* Denomination */}
        <div className={`h-[16px] rounded-md w-1/3 ${shimmerClass}`} />

        {/* Location + distance */}
        <div className={`h-[16px] rounded-md w-2/5 ${shimmerClass}`} />

        {/* Next service */}
        <div className={`h-[16px] rounded-md w-1/2 mt-1 ${shimmerClass}`} />
      </div>
    </div>
  );
};

/**
 * Grid of skeleton cards — drop-in replacement for ChurchList during loading
 */
export const ChurchCardSkeletonGrid = ({
  count = 6,
  variant = 'sidebar',
}: {
  count?: number;
  variant?: 'grid' | 'sidebar';
}) => {
  return (
    <div
      className={
        variant === 'grid'
          ? 'grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
          : 'grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2'
      }
    >
      {Array.from({ length: count }, (_, i) => (
        <ChurchCardSkeleton key={i} />
      ))}
    </div>
  );
};
