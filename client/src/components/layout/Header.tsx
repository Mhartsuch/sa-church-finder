import { useEffect, useState } from 'react';
import { Church, Heart, Menu, Moon, Search, Sun, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { SearchBar } from '@/components/search/SearchBar';
import { useAuthSession } from '@/hooks/useAuth';

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, user } = useAuthSession();
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
    <header className="sticky top-0 z-50 border-b border-[#ebebeb] bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1760px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex min-h-[80px] items-center gap-4">
          <Link to="/" className="flex flex-shrink-0 items-center gap-2 text-[#ff385c]">
            <Church className="h-8 w-8" strokeWidth={2.2} />
            <span className="text-[20px] font-extrabold tracking-[-0.03em]">ChurchFinder</span>
          </Link>

          <div className="hidden flex-1 justify-center lg:flex">
            <div className="w-full max-w-[850px]">
              <SearchBar
                variant="compact"
                onSubmit={handleSearchSubmit}
                onOpenFilters={handleSearchSubmit}
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate(user ? '/account' : '/register')}
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-[#222222] transition-colors hover:bg-[#f7f7f7] xl:inline-flex"
            >
              List your church
            </button>

            <Link
              to={wishlistHref}
              className="hidden items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-[#222222] transition-colors hover:bg-[#f7f7f7] md:inline-flex"
            >
              <Heart className="h-3.5 w-3.5 fill-current" />
              Wishlist
            </Link>

            <button
              type="button"
              onClick={() => {
                setTheme((current) => (current === 'light' ? 'dark' : 'light'));
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#222222] transition-colors hover:bg-[#f7f7f7]"
              aria-label={theme === 'light' ? 'Enable dark theme preview' : 'Enable light theme preview'}
              title={theme === 'light' ? 'Dark theme preview' : 'Light theme preview'}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <Link
              to="/search"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dddddd] text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f7f7f7] lg:hidden"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              to={menuHref}
              className="flex items-center gap-2.5 rounded-full border border-[#dddddd] bg-white px-3 py-2 transition-shadow hover:shadow-airbnb-subtle"
              aria-label={isLoading ? 'Checking account session' : user ? `Open ${firstName} account` : 'Open account menu'}
            >
              <Menu className="h-4 w-4 text-[#222222]" />
              <div className="flex h-[30px] min-w-[30px] items-center justify-center rounded-full bg-[#717171] px-2 text-xs font-semibold text-white">
                {user ? avatarLabel : <User className="h-3.5 w-3.5 text-white" />}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
