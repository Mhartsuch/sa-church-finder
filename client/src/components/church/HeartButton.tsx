import { Heart } from 'lucide-react';
import { MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useCurrentUser } from '@/hooks/useAuth';
import { useToggleSaved } from '@/hooks/useChurches';
import { buildAuthPageHref } from '@/lib/auth-redirect';
import { cn } from '@/lib/utils';

interface HeartButtonProps {
  churchId: string;
  churchName: string;
  saved: boolean;
  variant?: 'overlay' | 'inline';
}

export const HeartButton = ({
  churchId,
  churchName,
  saved,
  variant = 'overlay',
}: HeartButtonProps) => {
  const { data: user } = useCurrentUser();
  const toggle = useToggleSaved();
  const navigate = useNavigate();
  const location = useLocation();

  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      navigate(buildAuthPageHref('/login', `${location.pathname}${location.search}`));
      return;
    }
    toggle.mutate({ churchId, saved: !saved });
  };

  const label = saved ? `Remove ${churchName} from wishlist` : `Save ${churchName} to wishlist`;

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={saved}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold underline hover:bg-gray-100"
      >
        <Heart className={cn('h-4 w-4', saved && 'fill-brand text-brand')} />
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={saved}
      className="group/heart p-1 transition-transform active:scale-90"
    >
      <Heart
        className={cn(
          'h-6 w-6 stroke-white stroke-[2.5] drop-shadow-sm',
          saved ? 'fill-brand' : 'fill-black/50 group-hover/heart:scale-105',
        )}
      />
    </button>
  );
};
