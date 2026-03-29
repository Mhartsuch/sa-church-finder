import { ArrowRight, ArrowUpRight, Compass, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { ChurchList } from '@/components/church/ChurchList'
import { MapContainer } from '@/components/map/MapContainer'
import { CategoryFilter } from '@/components/search/CategoryFilter'
import { SearchBar } from '@/components/search/SearchBar'
import { HOME_SPOTLIGHTS } from '@/constants/home-spotlights'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen bg-[#fcfaf6]'>
      <section className='relative overflow-hidden border-b border-[#ece4d7] bg-[linear-gradient(180deg,#f8f4ec_0%,#fffdf9_100%)]'>
        <div className='absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(255,56,92,0.14),transparent_32%),radial-gradient(circle_at_center,rgba(15,118,110,0.1),transparent_48%)]' />
        <div className='mx-auto max-w-[2520px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10 xl:px-20'>
          <div className='grid gap-8 xl:grid-cols-[1.08fr_0.92fr]'>
            <div className='relative'>
              <div className='max-w-3xl'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a8f80]'>
                  San Antonio church discovery
                </p>
                <h1 className='mt-4 text-4xl font-semibold tracking-tight text-[#1d1d1b] sm:text-5xl lg:text-6xl'>
                  A cleaner front page for finding a church that actually fits.
                </h1>
                <p className='mt-5 max-w-2xl text-base leading-7 text-[#5f5a55] sm:text-lg'>
                  Browse a more curated first impression, jump into real San Antonio spotlights,
                  and use the live map when you want to compare neighborhoods, traditions, and service times.
                </p>
              </div>

              <div className='mt-8 max-w-2xl rounded-[32px] border border-white/70 bg-white/85 p-4 shadow-airbnb backdrop-blur-sm sm:p-5'>
                <SearchBar
                  variant='hero'
                  onSubmit={() => {
                    navigate('/search')
                  }}
                />
                <div className='mt-4 flex flex-wrap gap-3'>
                  <button
                    type='button'
                    onClick={() => navigate('/search')}
                    className='inline-flex items-center gap-2 rounded-full bg-[#222222] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black'
                  >
                    Explore all churches
                    <ArrowRight className='h-4 w-4' />
                  </button>
                  <a
                    href='#map-preview'
                    className='inline-flex items-center gap-2 rounded-full border border-[#d8d0c3] bg-white px-5 py-3 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f8f5ef]'
                  >
                    Jump to the map
                    <Compass className='h-4 w-4' />
                  </a>
                </div>
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-1'>
              <div className='rounded-[32px] border border-white/70 bg-white/82 p-6 shadow-airbnb backdrop-blur-sm'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a8f80]'>
                  What changed
                </p>
                <div className='mt-4 grid gap-4 sm:grid-cols-3 xl:grid-cols-1'>
                  <div className='rounded-[24px] bg-[#f8f5ef] p-4'>
                    <p className='text-sm font-semibold text-[#222222]'>Cleaner browse flow</p>
                    <p className='mt-1 text-sm leading-6 text-[#5f5a55]'>
                      The front page now starts with search, spotlights, and a more purposeful filter bar.
                    </p>
                  </div>
                  <div className='rounded-[24px] bg-[#f7f1f3] p-4'>
                    <p className='text-sm font-semibold text-[#222222]'>More honest profiles</p>
                    <p className='mt-1 text-sm leading-6 text-[#5f5a55]'>
                      Church cards use a branded visual fallback instead of random stock photos that felt fake.
                    </p>
                  </div>
                  <div className='rounded-[24px] bg-[#f2f7f4] p-4'>
                    <p className='text-sm font-semibold text-[#222222]'>Better map handoff</p>
                    <p className='mt-1 text-sm leading-6 text-[#5f5a55]'>
                      The map is easier to scan, and profile pages now have an actual directions embed.
                    </p>
                  </div>
                </div>
              </div>

              <div className='rounded-[32px] border border-[#e7decf] bg-[#fffaf0] p-6 shadow-airbnb-subtle'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a8f80]'>
                  Built around real local churches
                </p>
                <div className='mt-4 space-y-4'>
                  {HOME_SPOTLIGHTS.slice(0, 3).map((spotlight) => (
                    <div key={spotlight.slug} className='flex items-start gap-3'>
                      <div className='mt-1 rounded-full bg-[#222222] p-1.5 text-white'>
                        <MapPin className='h-3.5 w-3.5' />
                      </div>
                      <div>
                        <p className='text-sm font-semibold text-[#222222]'>{spotlight.name}</p>
                        <p className='text-sm text-[#5f5a55]'>
                          {spotlight.neighborhood} • {spotlight.serviceSummary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className='sticky top-[80px] z-40 border-b border-[#ece4d7] bg-[#fcfaf6]/92 backdrop-blur-sm'>
        <div className='mx-auto max-w-[2520px]'>
          <CategoryFilter showQuickFilters />
        </div>
      </div>

      <div className='mx-auto max-w-[2520px] px-4 pb-12 pt-8 sm:px-6 lg:px-10 xl:px-20'>
        <section className='pb-10'>
          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a8f80]'>
                Verified spotlights
              </p>
              <h2 className='mt-2 text-3xl font-semibold tracking-tight text-[#1d1d1b]'>
                Real San Antonio churches worth surfacing first
              </h2>
              <p className='mt-3 max-w-3xl text-base leading-7 text-[#5f5a55]'>
                These are the kinds of profiles that should set the tone for the directory:
                rooted in the city, easy to understand, and clear about what makes each place distinct.
              </p>
            </div>
            <Link
              to='/search'
              className='inline-flex items-center gap-2 self-start rounded-full border border-[#d8d0c3] bg-white px-4 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f8f5ef]'
            >
              Explore full directory
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>

          <div className='grid gap-5 lg:grid-cols-2 xl:grid-cols-3'>
            {HOME_SPOTLIGHTS.map((spotlight) => (
              <article
                key={spotlight.slug}
                className='rounded-[32px] border border-[#e8dfd2] bg-white p-6 shadow-airbnb-subtle'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a8f80]'>
                      {spotlight.badge}
                    </p>
                    <h3 className='mt-2 text-xl font-semibold text-[#222222]'>
                      {spotlight.name}
                    </h3>
                    <p className='mt-1 text-sm text-[#5f5a55]'>
                      {spotlight.denomination} • {spotlight.neighborhood}
                    </p>
                  </div>
                  <a
                    href={spotlight.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 rounded-full border border-[#e8dfd2] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f8f5ef]'
                  >
                    Site
                    <ArrowUpRight className='h-3.5 w-3.5' />
                  </a>
                </div>

                <p className='mt-4 text-sm leading-7 text-[#44403c]'>
                  {spotlight.blurb}
                </p>

                <div className='mt-5 space-y-2 text-sm text-[#5f5a55]'>
                  <p>{spotlight.address}</p>
                  <p>{spotlight.serviceSummary}</p>
                </div>

                <div className='mt-5 flex flex-wrap gap-2'>
                  {spotlight.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className='rounded-full bg-[#f8f5ef] px-3 py-1.5 text-xs font-medium text-[#5f5a55]'
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className='mt-6 flex items-center justify-between gap-3'>
                  <Link
                    to={`/churches/${spotlight.slug}`}
                    className='inline-flex items-center gap-2 text-sm font-semibold text-[#222222] underline decoration-[#d5cab9] underline-offset-4 transition-colors hover:text-black'
                  >
                    View profile
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                  <a
                    href={spotlight.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm font-medium text-[#5f5a55] transition-colors hover:text-[#222222]'
                  >
                    Official website
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id='map-preview' className='pb-10'>
          <div className='grid gap-6 lg:grid-cols-[0.72fr_1.28fr]'>
            <div className='rounded-[32px] border border-[#e8dfd2] bg-white p-6 shadow-airbnb-subtle'>
              <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a8f80]'>
                Map preview
              </p>
              <h2 className='mt-2 text-3xl font-semibold tracking-tight text-[#1d1d1b]'>
                Compare neighborhoods before you click into a profile
              </h2>
              <p className='mt-4 text-base leading-7 text-[#5f5a55]'>
                The live map is now calmer and easier to read, so it works as a quick geographic pass
                instead of a noisy wall of labels. Hover a card or move the map to tighten the results.
              </p>
              <div className='mt-6 rounded-[24px] bg-[#f8f5ef] p-4 text-sm leading-7 text-[#5f5a55]'>
                Use the quick filters above for things like Spanish services, nursery, parking, or
                evening worship, then jump into the full search if you want the split-screen list and map view.
              </div>
              <div className='mt-6 flex flex-wrap gap-3'>
                <Link
                  to='/search'
                  className='inline-flex items-center gap-2 rounded-full bg-[#222222] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black'
                >
                  Open full map
                  <Compass className='h-4 w-4' />
                </Link>
              </div>
            </div>

            <div className='h-[420px] overflow-hidden rounded-[32px] border border-[#e8dfd2] bg-white shadow-airbnb-subtle'>
              <MapContainer />
            </div>
          </div>
        </section>

        <section className='pb-4'>
          <div className='mb-6'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a8f80]'>
              Browse everything
            </p>
            <h2 className='mt-2 text-3xl font-semibold tracking-tight text-[#1d1d1b]'>
              Keep scrolling through the full directory
            </h2>
            <p className='mt-3 max-w-3xl text-base leading-7 text-[#5f5a55]'>
              The spotlight cards above are curated, but the grid below still lets you browse the wider
              directory with the same filters and search state.
            </p>
          </div>

          <div className='rounded-[32px] border border-[#e8dfd2] bg-white p-4 shadow-airbnb-subtle sm:p-6 lg:p-8'>
            <ChurchList variant='grid' />
          </div>
        </section>
      </div>

      <footer className='border-t border-[#e8dfd2] bg-[#f7f3ec]'>
        <div className='max-w-[2520px] mx-auto px-4 py-6 sm:px-6 lg:px-10 xl:px-20'>
          <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
            <p className='text-sm text-[#717171]'>&copy; 2026 SA Church Finder</p>
            <div className='flex items-center gap-4'>
              <a href='#' className='text-sm font-medium text-[#222222] hover:underline'>About</a>
              <span className='text-gray-300'>&middot;</span>
              <a href='#' className='text-sm font-medium text-[#222222] hover:underline'>Privacy</a>
              <span className='text-gray-300'>&middot;</span>
              <a href='#' className='text-sm font-medium text-[#222222] hover:underline'>Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
