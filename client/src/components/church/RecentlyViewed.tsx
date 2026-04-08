import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { formatRating } from '@/utils/format';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

export const RecentlyViewed = () => {
  const { recent } = useRecentlyViewed();
  const navigate = useNavigate();

  if (recent.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1760px] px-4 py-8 sm:px-6 lg:px-10">
      <h2 className="text-[18px] font-bold">Recently viewed</h2>
      <div className="hide-scrollbar mt-4 flex gap-4 overflow-x-auto pb-2">
        {recent.map((church) => (
          <button
            key={church.id}
            type="button"
            onClick={() => navigate(`/churches/${church.slug}`)}
            className="flex min-w-[180px] flex-shrink-0 flex-col rounded-xl border border-[#ebebeb] transition-all hover:-translate-y-1 hover:shadow-airbnb"
          >
            {church.coverImageUrl ? (
              <img
                src={church.coverImageUrl}
                alt={church.name}
                className="h-28 w-full rounded-t-xl object-cover"
              />
            ) : (
              <div className="flex h-28 w-full items-center justify-center rounded-t-xl bg-[#f0f0f0] text-3xl">
                ⛪
              </div>
            )}
            <div className="p-3">
              <h3 className="line-clamp-1 text-[14px] font-semibold">{church.name}</h3>
              <div className="mt-1 flex items-center gap-1">
                {church.avgRating > 0 ? (
                  <>
                    <Star className="h-3 w-3 fill-[#fbbf24] text-[#fbbf24]" />
                    <span className="text-[13px]">{formatRating(church.avgRating)}</span>
                  </>
                ) : null}
                {church.denomination ? (
                  <span className="text-[13px] text-[#717171]">
                    {church.avgRating > 0 ? ' · ' : ''}
                    {church.denomination}
                  </span>
                ) : null}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
