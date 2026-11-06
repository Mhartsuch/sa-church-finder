import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ChurchCard, ChurchCardSkeleton } from '@/components/church/ChurchCard';
import { useCurrentUser } from '@/hooks/useAuth';
import { useSavedChurches } from '@/hooks/useChurches';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const WishlistsPage = () => {
  useDocumentTitle('Wishlists');
  const { data: user } = useCurrentUser();
  const { data, isPending } = useSavedChurches(user?.id);
  const saved = (data?.data ?? []).map((church) => ({ ...church, isSaved: true }));

  return (
    <main className="px-6 pb-24 pt-10 xl:px-20">
      <h1 className="text-[32px] font-semibold">Wishlists</h1>
      {isPending ? (
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <ChurchCardSkeleton key={i} />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="mt-10 max-w-md">
          <Heart className="h-8 w-8" />
          <h2 className="mt-4 text-[22px] font-semibold">Create your first wishlist</h2>
          <p className="mt-2 text-gray-500">
            As you browse, tap the heart on any church to save it here and plan your visits.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white"
          >
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {saved.map((church) => (
            <ChurchCard key={church.id} church={church} />
          ))}
        </div>
      )}
    </main>
  );
};

export default WishlistsPage;
