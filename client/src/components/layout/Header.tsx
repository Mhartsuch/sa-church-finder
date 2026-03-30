import { Church, Compass, Menu, Search, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { SearchBar } from '@/components/search/SearchBar';
import { useAuthSession } from '@/hooks/useAuth';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, user } = useAuthSession();

  const handleSearchSubmit = () => {
    if (location.pathname !== '/search') {
      navigate('/search');
    }
  };

  const firstName = user?.name.split(' ')[0] || 'Account';
  const avatarLabel =
    user?.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || null;

  return (
    <header className="sticky top-0 z-50 border-b border-[#ece8df] bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1760px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex min-h-[88px] items-center gap-4">
          <Link to="/" className="flex flex-shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ff385c] text-white shadow-airbnb-subtle">
              <Church className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-extrabold tracking-[-0.02em] text-[#ff385c]">
                SA Church Finder
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9a8f80]">
                San Antonio, TX
              </p>
            </div>
          </Link>

          <div className="hidden flex-1 justify-center lg:flex">
            <div className="w-full max-w-[760px]">
              <SearchBar
                variant="compact"
                onSubmit={handleSearchSubmit}
                onOpenFilters={handleSearchSubmit}
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/search"
              className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:bg-[#f6f3ee] sm:inline-flex"
            >
              Explore
            </Link>

            <Link
              to="/search"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddd6ca] text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f8f5ef] lg:hidden"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              to="/search"
              className="hidden items-center gap-2 rounded-full border border-[#ddd6ca] bg-white px-4 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f8f5ef] xl:inline-flex"
            >
              <Compass className="h-4 w-4" />
              Live map
            </Link>

            {user ? (
              <>
                <Link
                  to="/account"
                  className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:bg-[#f6f3ee] sm:inline-flex"
                >
                  {firstName}
                </Link>
                <Link
                  to="/account"
                  className="flex items-center gap-2.5 rounded-full border border-[#ddd6ca] bg-white px-3 py-2 transition-shadow hover:shadow-airbnb-subtle"
                  aria-label="Open account"
                >
                  <Menu className="h-4 w-4 text-[#222222]" />
                  <div className="flex h-[32px] min-w-[32px] items-center justify-center rounded-full bg-[#222222] px-2 text-xs font-semibold text-white">
                    {avatarLabel}
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:bg-[#f6f3ee] sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2.5 rounded-full border border-[#ddd6ca] bg-white px-3 py-2 transition-shadow hover:shadow-airbnb-subtle"
                  aria-label={isLoading ? 'Checking account session' : 'Create account'}
                >
                  <Menu className="h-4 w-4 text-[#222222]" />
                  <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#717171]">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
