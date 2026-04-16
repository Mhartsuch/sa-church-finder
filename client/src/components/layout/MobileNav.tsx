import { useEffect, useState } from 'react';
import { Compass, Heart, Map as MapIcon, Moon, Sun } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface MobileNavProps {
  onToggleMap?: () => void;
  showMap?: boolean;
}

// Match the SearchPage desktop breakpoint so the bottom nav and the
// desktop header layout flip at the same viewport. Below 1024px the
// Header drops its inline search bar, so the bottom nav takes over.
export const MOBILE_NAV_BREAKPOINT = 1024;

export const MobileNav = ({ onToggleMap, showMap = false }: MobileNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  });
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_NAV_BREAKPOINT : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_NAV_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) return null;

  const isHome = location.pathname === '/' || location.pathname === '/search';

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem('church-finder-theme', next);
  };

  // All buttons in the bar target at least 48px of tappable area so
  // accidental mis-taps between adjacent items stay rare on small phones.
  const buttonBase =
    'flex min-h-[48px] min-w-[48px] flex-1 flex-col items-center justify-center gap-0.5 px-2 text-[10px] font-semibold transition-colors';

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="mobile-nav-bar fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-border bg-card/95 px-2 pt-1.5 backdrop-blur-md lg:hidden"
    >
      <button
        type="button"
        onClick={() => {
          navigate('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`${buttonBase} ${
          isHome && !showMap ? 'text-[#FF385C]' : 'text-muted-foreground'
        }`}
        aria-label="Explore"
        aria-current={isHome && !showMap ? 'page' : undefined}
      >
        <Compass className="h-5 w-5" />
        <span>Explore</span>
      </button>

      <button
        type="button"
        onClick={() => navigate('/account')}
        className={`${buttonBase} text-muted-foreground`}
        aria-label="Wishlist"
      >
        <Heart className="h-5 w-5" />
        <span>Wishlist</span>
      </button>

      {onToggleMap ? (
        <button
          type="button"
          onClick={onToggleMap}
          aria-pressed={showMap}
          className={`${buttonBase} ${showMap ? 'text-[#FF385C]' : 'text-muted-foreground'}`}
          aria-label={showMap ? 'Hide map' : 'Show map'}
        >
          <MapIcon className="h-5 w-5" />
          <span>Map</span>
        </button>
      ) : null}

      <button
        type="button"
        onClick={toggleTheme}
        className={`${buttonBase} text-muted-foreground`}
        aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        <span>Theme</span>
      </button>
    </nav>
  );
};
