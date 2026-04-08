import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface MobileNavProps {
  onToggleMap?: () => void;
  showMap?: boolean;
}

export const MobileNav = ({ onToggleMap, showMap = false }: MobileNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  });
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[#ebebeb] bg-white/95 px-2 py-2 backdrop-blur-md">
      <button
        type="button"
        onClick={() => {
          navigate('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center gap-0.5 px-4 py-1 text-[10px] font-semibold ${
          isHome && !showMap ? 'text-[#FF385C]' : 'text-[#717171]'
        }`}
        aria-label="Explore"
      >
        <span className="text-xl">🔍</span>
        <span>Explore</span>
      </button>

      <button
        type="button"
        onClick={() => navigate('/account')}
        className="flex flex-col items-center gap-0.5 px-4 py-1 text-[10px] font-semibold text-[#717171]"
        aria-label="Wishlist"
      >
        <span className="text-xl">♥️</span>
        <span>Wishlist</span>
      </button>

      {onToggleMap ? (
        <button
          type="button"
          onClick={onToggleMap}
          className={`flex flex-col items-center gap-0.5 px-4 py-1 text-[10px] font-semibold ${
            showMap ? 'text-[#FF385C]' : 'text-[#717171]'
          }`}
          aria-label="Map"
        >
          <span className="text-xl">🗺️</span>
          <span>Map</span>
        </button>
      ) : null}

      <button
        type="button"
        onClick={toggleTheme}
        className="flex flex-col items-center gap-0.5 px-4 py-1 text-[10px] font-semibold text-[#717171]"
        aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}
      >
        <span className="text-xl">{theme === 'light' ? '🌙' : '☀️'}</span>
        <span>Theme</span>
      </button>
    </nav>
  );
};
