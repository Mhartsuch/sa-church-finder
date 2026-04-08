const shimmerClass =
  'relative overflow-hidden bg-muted before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-background/60 before:to-transparent';

export const ChurchCardSkeleton = () => {
  return (
    <div className="group">
      <div className={`mb-3 aspect-[20/19] rounded-[12px] ${shimmerClass}`} />

      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className={`h-[18px] w-3/4 rounded-md ${shimmerClass}`} />
          <div className={`h-[18px] w-10 flex-shrink-0 rounded-md ${shimmerClass}`} />
        </div>
        <div className={`h-[16px] w-1/3 rounded-md ${shimmerClass}`} />
        <div className={`h-[16px] w-3/5 rounded-md ${shimmerClass}`} />
        <div className={`mt-1 h-[16px] w-1/2 rounded-md ${shimmerClass}`} />
        <div className={`h-[16px] w-1/3 rounded-md ${shimmerClass}`} />
      </div>
    </div>
  );
};

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
