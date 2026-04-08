import { useEffect, useState } from 'react';
import { Church, Heart, Menu, Moon, Scale, Search, Sun, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { SearchBar } from '@/components/search/SearchBar';
import { useAuthSession } from '@/hooks/useAuth';
import { useCompareStore } from '@/stores/compare-store';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, user } = useAuthSession();
  const compareCount = useCompareStore((state) => state.selectedChurches.length);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.localStorage.getItem('church-finder-theme') === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('church-finder-theme', theme);
  }, [theme]);

  const handleSearchSubmit = () => {
    if (location.pathname !== '/' && location.pathname !== '/search') {
      navigate('/search');
    }
  };

  const handleOpenFilters = () => {
    if (location.pathname === '/' || location.pathname === '/search') {
      navigate(
        {
          pathname: location.pathname,
          search: location.search,
        },
        {
          replace: true,
          state: { openFilters: true },
        },
      );
      return;
    }

    navigate('/search', {
      state: { openFilters: true },
    });
  };

  const firstName = user?.name.split(' ')[0] || 'Account';
  const avatarLabel =
    user?.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || null;

  const wishlistHref = user ? '/account' : '/login';
  const menuHref = user ? '/account' : '/login';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1760px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex min-h-[80px] items-center gap-4">
          <Link to="/" className="flex flex-shrink-0 items-center gap-2 text-[#FF385C]">
            <Church className="h-8 w-8" strokeWidth={2.2} />
            <span className="text-[20px] font-extrabold tracking-[-0.03em]">ChurchFinder</span>
          </Link>

          <div className="hidden flex-1 justify-center lg:flex">
            <div className="w-full max-w-[850px]">
              <SearchBar
                variant="compact"
                onSubmit={handleSearchSubmit}
                onOpenFilters={handleOpenFilters}
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              to="/compare"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground hover:bg-muted"
              aria-label={
                compareCount > 0
                  ? `Open compare with ${compareCount} selected church${compareCount === 1 ? '' : 'es'}`
                  : 'Open compare'
              }
            >
              <Scale className="h-4 w-4" />
              {compareCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-white">
                  {compareCount}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => navigate(user ? '/account' : '/register')}
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted xl:inline-flex"
            >
              List your church
            </button>

            <Link
              to={wishlistHref}
              className="hidden items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted md:inline-flex"
            >
              <Heart className="h-3.5 w-3.5 fill-current" />
              Wishlist
            </Link>

            <button
              type="button"
              onClick={() => {
                setTheme((current) => (current === 'light' ? 'dark' : 'light'));
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
              aria-label={
                theme === 'light' ? 'Enable dark theme preview' : 'Enable light theme preview'
              }
              title={theme === 'light' ? 'Dark theme preview' : 'Light theme preview'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <Link
              to="/search"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-foreground hover:bg-muted lg:hidden"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              to={menuHref}
              className="flex items-center gap-2.5 rounded-full border border-border bg-card px-3 py-2 transition-shadow hover:shadow-airbnb-subtle"
              aria-label={
                isLoading
                  ? 'Checking account session'
                  : user
                    ? `Open ${firstName} account`
                    : 'Open account menu'
              }
            >
              <Menu className="h-4 w-4 text-foreground" />
              <div className="flex h-[30px] min-w-[30px] items-center justify-center rounded-full bg-muted-foreground px-2 text-xs font-semibold text-white">
                {user ? avatarLabel : <User className="h-3.5 w-3.5 text-white" />}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
