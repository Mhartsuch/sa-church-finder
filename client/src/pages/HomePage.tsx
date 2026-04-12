import { useCallback } from 'react';
import { ArrowRight, Church, Heart, MapPin, Scale, Search, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { SearchBar } from '@/components/search/SearchBar';
import { Testimonials } from '@/components/community/Testimonials';
import { Newsletter } from '@/components/community/Newsletter';
import { useFeaturedChurches } from '@/hooks/useFeaturedChurches';
import { useFilterOptions } from '@/hooks/useChurches';
import { useSearchStore } from '@/stores/search-store';
import { IChurchSummary } from '@/types/church';
import { formatRating } from '@/utils/format';

// ── San Antonio neighborhoods with curated imagery descriptions ──

const NEIGHBORHOODS = [
  {
    name: 'Downtown',
    tagline: 'Historic missions & cathedrals',
    gradient: 'from-amber-600 to-orange-800',
  },
  {
    name: 'Alamo Heights',
    tagline: 'Established congregations',
    gradient: 'from-emerald-600 to-teal-800',
  },
  {
    name: 'Stone Oak',
    tagline: 'Modern megachurches',
    gradient: 'from-blue-600 to-indigo-800',
  },
  {
    name: 'Southtown',
    tagline: 'Diverse & community-driven',
    gradient: 'from-rose-600 to-pink-800',
  },
  {
    name: 'Medical Center',
    tagline: 'Family-friendly worship',
    gradient: 'from-violet-600 to-purple-800',
  },
  {
    name: 'Helotes',
    tagline: 'Small-town fellowship',
    gradient: 'from-cyan-600 to-sky-800',
  },
];

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: 'Search & filter',
    description:
      'Browse by denomination, neighborhood, service times, or worship style. Filter until you find your perfect match.',
  },
  {
    icon: Scale,
    title: 'Compare & save',
    description:
      'Add churches to your compare list to view them side by side. Heart your favorites to revisit later.',
  },
  {
    icon: Church,
    title: 'Visit & connect',
    description:
      'Use directions and service schedules to plan your first visit. Leave a review to help others on the same journey.',
  },
];

// ── Featured church mini-card ──

interface FeaturedCardProps {
  church: IChurchSummary;
}

const FeaturedCard = ({ church }: FeaturedCardProps) => {
  const effectiveRating = church.reviewCount > 0 ? church.avgRating : (church.googleRating ?? 0);
  const effectiveReviewCount =
    church.reviewCount > 0 ? church.reviewCount : (church.googleReviewCount ?? 0);
  const imageUrl =
    church.photos && church.photos.length > 0 ? church.photos[0].url : church.coverImageUrl;

  return (
    <Link
      to={`/churches/${church.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-airbnb"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={church.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Church className="h-10 w-10" />
          </div>
        )}
        {effectiveRating >= 4.8 && (
          <div className="absolute left-3 top-3 rounded bg-card px-2 py-1 text-[12px] font-bold text-foreground shadow-sm">
            Guest favorite
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug">{church.name}</h3>
        <p className="mt-0.5 text-[14px] text-muted-foreground">
          {church.denomination ?? church.neighborhood ?? 'San Antonio'}
        </p>
        <div className="mt-auto flex items-center gap-1.5 pt-2">
          {effectiveRating > 0 && (
            <>
              <Star className="h-3.5 w-3.5 fill-[#fbbf24] text-[#fbbf24]" />
              <span className="text-[14px] font-medium">{formatRating(effectiveRating)}</span>
              {effectiveReviewCount > 0 && (
                <span className="text-[13px] text-muted-foreground">({effectiveReviewCount})</span>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

// ── Skeleton card while loading ──

const FeaturedCardSkeleton = () => (
  <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
    <div className="aspect-[4/3] animate-pulse bg-muted" />
    <div className="p-4">
      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-3 w-1/4 animate-pulse rounded bg-muted" />
    </div>
  </div>
);

// ── Main page ──

const HomePage = () => {
  const navigate = useNavigate();
  const { data: featured, isLoading: featuredLoading } = useFeaturedChurches();
  const { data: filterOptions } = useFilterOptions();
  const setFilter = useSearchStore((state) => state.setFilter);
  const setQuery = useSearchStore((state) => state.setQuery);

  const churchCount = featured?.meta.total ?? 0;
  const denominationCount = filterOptions?.denominations.length ?? 0;

  const handleSearchSubmit = useCallback(() => {
    navigate('/search');
  }, [navigate]);

  const handleOpenFilters = useCallback(() => {
    navigate('/search', { state: { openFilters: true } });
  }, [navigate]);

  const handleNeighborhoodClick = useCallback(
    (neighborhood: string) => {
      setQuery('');
      setFilter('neighborhood', neighborhood);
      navigate('/search');
    },
    [navigate, setFilter, setQuery],
  );

  const featuredChurches = featured?.data ?? [];

  return (
    <div className="flex-1 bg-background">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-luminosity"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1400&q=80')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
        <div className="relative mx-auto max-w-[1760px] px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-10 lg:pb-24 lg:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.08] tracking-tight text-white">
              Find your{' '}
              <span className="bg-gradient-to-r from-[#FF385C] via-[#E31C5F] to-[#D70466] bg-clip-text text-transparent">
                spiritual home
              </span>{' '}
              in San Antonio
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-white/75">
              Discover {Math.max(churchCount, 30)}+ churches across every denomination. Read
              reviews, compare services, and find the perfect fit for you and your family.
            </p>

            {/* Search bar */}
            <div className="mx-auto mt-8 max-w-2xl">
              <SearchBar
                variant="hero"
                onSubmit={handleSearchSubmit}
                onOpenFilters={handleOpenFilters}
              />
            </div>

            {/* Quick stats */}
            <div className="mx-auto mt-10 flex justify-center gap-8 sm:gap-12">
              <div className="text-center">
                <div className="text-[28px] font-light text-white">
                  {Math.max(churchCount, 30)}+
                </div>
                <div className="text-[13px] text-white/60">Churches</div>
              </div>
              <div className="text-center">
                <div className="text-[28px] font-light text-white">
                  {Math.max(denominationCount, 10)}+
                </div>
                <div className="text-[13px] text-white/60">Denominations</div>
              </div>
              <div className="text-center">
                <div className="text-[28px] font-light text-white">100%</div>
                <div className="text-[13px] text-white/60">Free to use</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured churches ── */}
      <section className="mx-auto max-w-[1760px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[22px] font-bold">Top-rated churches</h2>
            <p className="mt-1 text-[15px] text-muted-foreground">
              The highest rated churches in the San Antonio area
            </p>
          </div>
          <Link
            to="/search"
            className="hidden items-center gap-1.5 text-[14px] font-semibold text-foreground transition-colors hover:text-muted-foreground sm:inline-flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredLoading
            ? Array.from({ length: 4 }).map((_, i) => <FeaturedCardSkeleton key={i} />)
            : featuredChurches
                .slice(0, 8)
                .map((church) => <FeaturedCard key={church.id} church={church} />)}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-foreground"
          >
            View all churches
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Explore neighborhoods ── */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-[1760px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
          <h2 className="text-[22px] font-bold">Explore by neighborhood</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Every corner of San Antonio has a vibrant faith community
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {NEIGHBORHOODS.map((hood) => (
              <button
                key={hood.name}
                type="button"
                onClick={() => handleNeighborhoodClick(hood.name)}
                className="group relative overflow-hidden rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-airbnb"
              >
                <div
                  className={`aspect-[3/4] bg-gradient-to-br ${hood.gradient} p-5 transition-all group-hover:brightness-110`}
                >
                  <MapPin className="h-5 w-5 text-white/70" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-[16px] font-bold text-white">{hood.name}</h3>
                    <p className="mt-0.5 text-[13px] text-white/70">{hood.tagline}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-[1760px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div className="text-center">
          <h2 className="text-[22px] font-bold">How it works</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Finding the right church is easy with ChurchFinder
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <step.icon className="h-7 w-7 text-foreground" />
              </div>
              <div className="mx-auto mt-3 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[13px] font-bold text-muted-foreground">
                {i + 1}
              </div>
              <h3 className="mt-3 text-[16px] font-bold">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-[15px] font-semibold text-background transition-all hover:opacity-90"
          >
            Start exploring
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Testimonials (reused) ── */}
      <Testimonials />

      {/* ── Church leaders CTA ── */}
      <section className="mx-auto max-w-[1760px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
        <div
          className="overflow-hidden rounded-3xl px-8 py-14 text-center text-white sm:px-16"
          style={{ background: 'linear-gradient(135deg, #E61E4D 0%, #D70466 100%)' }}
        >
          <Heart className="mx-auto h-10 w-10 text-white/80" />
          <h2 className="mt-4 text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-tight">
            Are you a church leader?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[16px] leading-relaxed text-white/80">
            Claim your free listing, update your profile, manage events, and connect with new
            visitors looking for a spiritual home.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[15px] font-semibold text-[#D70466] transition-all hover:bg-white/90"
            >
              List your church — it&apos;s free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/leaders"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3.5 text-[15px] font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
            >
              Leaders portal
            </Link>
          </div>
        </div>
      </section>

      {/* ── Newsletter (reused) ── */}
      <Newsletter />
    </div>
  );
};

export default HomePage;
