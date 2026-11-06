import { Church, Heart, Menu, UserCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { SearchPill } from '@/components/search/SearchPill';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { buildAuthPageHref } from '@/lib/auth-redirect';
import { cn } from '@/lib/utils';

export const Header = ({ wide = false }: { wide?: boolean }) => {
  const { pathname } = useLocation();
  const showSearch = pathname === '/' || pathname.startsWith('/churches/');

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div
        className={cn(
          'mx-auto flex h-20 items-center justify-between gap-4 px-6',
          wide ? 'max-w-none xl:px-20' : 'max-w-7xl',
        )}
      >
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-brand"
          aria-label="SA Church Finder home"
        >
          <Church className="h-8 w-8" strokeWidth={2.25} />
          <span className="hidden text-xl font-extrabold tracking-tight lg:inline">
            sachurchfinder
          </span>
        </Link>
        {showSearch && <SearchPill />}
        <UserMenu />
      </div>
    </header>
  );
};

const UserMenu = () => {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const returnTo = `${location.pathname}${location.search}`;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const item = 'block w-full px-4 py-3 text-left text-sm hover:bg-gray-50';

  return (
    <div ref={ref} className="relative flex shrink-0 items-center gap-1">
      {user && (
        <Link
          to="/wishlists"
          className="hidden rounded-full px-4 py-3 text-sm font-semibold hover:bg-gray-100 md:flex md:items-center md:gap-2"
        >
          <Heart className="h-4 w-4" /> Wishlists
        </Link>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center gap-3 rounded-full border border-gray-300 py-1.5 pl-3 pr-1.5 transition-shadow hover:shadow-md"
      >
        <Menu className="h-4 w-4" strokeWidth={2.5} />
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : user ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>
        ) : (
          <UserCircle2 className="h-8 w-8 text-gray-500" strokeWidth={1.5} />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-14 w-60 overflow-hidden rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
          {user ? (
            <>
              <Link to="/wishlists" className={cn(item, 'font-semibold')}>
                Wishlists
              </Link>
              <Link to="/account" className={cn(item, 'font-semibold')}>
                Account
              </Link>
              <hr className="my-2 border-gray-200" />
              <button
                type="button"
                className={item}
                onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/') })}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to={buildAuthPageHref('/register', returnTo)}
                className={cn(item, 'font-semibold')}
              >
                Sign up
              </Link>
              <Link to={buildAuthPageHref('/login', returnTo)} className={item}>
                Log in
              </Link>
              <hr className="my-2 border-gray-200" />
              <Link to="/" className={item}>
                Browse churches
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};
