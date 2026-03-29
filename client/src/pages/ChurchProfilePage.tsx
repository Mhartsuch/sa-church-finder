import { useState } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Clock,
  CheckCircle,
  Users,
  Calendar,
  ExternalLink,
  Share,
  Heart,
  ChevronLeft,
} from 'lucide-react'
import { useChurch } from '@/hooks/useChurches'
import { useAuthSession } from '@/hooks/useAuth'
import { useToggleSavedChurch } from '@/hooks/useChurches'
import { IChurchService } from '@/types/church'
import { formatRating, formatServiceTime, getDayName } from '@/utils/format'

const DAY_ORDER = [0, 1, 2, 3, 4, 5, 6]

const groupServicesByDay = (services: IChurchService[]) => {
  const grouped = new Map<number, IChurchService[]>()
  for (const service of services) {
    const existing = grouped.get(service.dayOfWeek) || []
    existing.push(service)
    grouped.set(service.dayOfWeek, existing)
  }
  return DAY_ORDER.filter((day) => grouped.has(day)).map((day) => ({
    day,
    dayName: getDayName(day),
    services: grouped.get(day)!,
  }))
}

export const ChurchProfilePage = () => {
  const location = useLocation()
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuthSession()
  const toggleSavedChurchMutation = useToggleSavedChurch()
  const { data: church, isLoading, error } = useChurch(slug ?? '')
  const [saveError, setSaveError] = useState<string | null>(null)

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error || !church) {
    return (
      <div className='flex-1 flex flex-col items-center justify-center p-8'>
        <h2 className='text-2xl font-bold text-[#222222] mb-2'>Church Not Found</h2>
        <p className='text-[#717171] mb-6'>
          We couldn&apos;t find a church at this address.
        </p>
        <button
          onClick={() => navigate('/')}
          className='inline-flex items-center gap-2 px-6 py-3 bg-[#222222] text-white rounded-lg hover:bg-black transition-colors font-semibold'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Search
        </button>
      </div>
    )
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${church.address}, ${church.city}, ${church.state} ${church.zipCode}`
  )}`

  const groupedServices = groupServicesByDay(church.services)
  const isSavePending =
    toggleSavedChurchMutation.isPending &&
    toggleSavedChurchMutation.variables === church.id

  const handleToggleSave = async () => {
    setSaveError(null)

    if (!user) {
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        },
      })
      return
    }

    try {
      await toggleSavedChurchMutation.mutateAsync(church.id)
    } catch (toggleError) {
      setSaveError(
        toggleError instanceof Error
          ? toggleError.message
          : 'Unable to update saved churches right now.',
      )
    }
  }

  return (
    <div className='flex-1 overflow-y-auto bg-white'>
      {/* Top bar with back + actions */}
      <div className='max-w-[1120px] mx-auto px-6 lg:px-0 pt-6 pb-4'>
        <Link
          to='/'
          className='inline-flex items-center gap-1 text-sm text-[#222222] hover:underline font-medium'
        >
          <ChevronLeft className='w-4 h-4' />
          Back
        </Link>
      </div>

      {/* Image gallery placeholder — Airbnb 4-grid layout */}
      <div className='max-w-[1120px] mx-auto px-6 lg:px-0 mb-6'>
        <div className='grid grid-cols-4 gap-2 rounded-xl overflow-hidden h-[330px] lg:h-[400px]'>
          <div className='col-span-2 row-span-2 bg-gray-200 relative group cursor-pointer'>
            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors' />
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-center text-gray-400'>
                <MapPin className='w-10 h-10 mx-auto mb-2' />
                <p className='text-sm font-medium'>Church photos coming soon</p>
              </div>
            </div>
          </div>
          <div className='bg-gray-100 relative group cursor-pointer'>
            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors' />
          </div>
          <div className='bg-gray-200 relative group cursor-pointer'>
            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors' />
          </div>
          <div className='bg-gray-100 relative group cursor-pointer'>
            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors' />
          </div>
          <div className='bg-gray-200 relative group cursor-pointer'>
            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors' />
            <div className='absolute bottom-3 right-3'>
              <button className='px-4 py-1.5 bg-white text-[#222222] text-xs font-semibold rounded-lg border border-[#222222] hover:bg-gray-50 transition-colors'>
                Show all photos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className='max-w-[1120px] mx-auto px-6 lg:px-0 pb-16'>
        <div className='flex flex-col lg:flex-row gap-12 lg:gap-24'>
          {/* Left column — main info */}
          <div className='flex-1 min-w-0'>
            {/* Title section */}
            <div className='pb-6 border-b border-gray-200'>
              <h1 className='text-[26px] font-bold text-[#222222] mb-1'>{church.name}</h1>

              <div className='flex items-center flex-wrap gap-1.5 text-[14px]'>
                {church.avgRating > 0 && (
                  <>
                    <div className='flex items-center gap-1'>
                      <Star className='w-4 h-4 fill-[#222222] text-[#222222]' />
                      <span className='font-semibold'>{formatRating(church.avgRating)}</span>
                    </div>
                    <span className='text-[#717171]'>&middot;</span>
                    <button className='text-[#222222] underline font-semibold'>{church.reviewCount} reviews</button>
                    <span className='text-[#717171]'>&middot;</span>
                  </>
                )}
                {church.isClaimed && (
                  <>
                    <span className='flex items-center gap-1 text-[#222222] font-medium'>
                      <CheckCircle className='w-4 h-4' />
                      Claimed
                    </span>
                    <span className='text-[#717171]'>&middot;</span>
                  </>
                )}
                {church.denomination && (
                  <>
                    <span className='font-semibold text-[#222222]'>{church.denomination}</span>
                    <span className='text-[#717171]'>&middot;</span>
                  </>
                )}
                <button className='text-[#222222] underline font-semibold'>
                  {church.neighborhood || church.city}, {church.state}
                </button>
              </div>

              {/* Action buttons — Airbnb style */}
              <div className='flex items-center gap-4 mt-4'>
                <button className='flex items-center gap-2 text-sm font-semibold text-[#222222] underline hover:text-[#000000]'>
                  <Share className='w-4 h-4' />
                  Share
                </button>
                <button
                  type='button'
                  onClick={() => {
                    void handleToggleSave()
                  }}
                  disabled={isSavePending}
                  className='flex items-center gap-2 text-sm font-semibold text-[#222222] underline hover:text-[#000000] disabled:cursor-not-allowed disabled:opacity-70'
                >
                  <Heart
                    className={`w-4 h-4 ${church.isSaved ? 'fill-[#FF385C] text-[#FF385C]' : ''}`}
                  />
                  {isSavePending
                    ? church.isSaved
                      ? 'Updating...'
                      : 'Saving...'
                    : church.isSaved
                      ? 'Saved'
                      : 'Save'}
                </button>
              </div>

              {saveError ? (
                <div className='mt-4 rounded-2xl border border-[#ffb4c1] bg-[#fff1f4] px-4 py-3 text-sm text-[#9f1239]'>
                  {saveError}
                </div>
              ) : null}
            </div>

            {/* About section */}
            {(church.description || church.pastorName || church.yearEstablished) && (
              <div className='py-8 border-b border-gray-200'>
                <h2 className='text-[22px] font-semibold text-[#222222] mb-5'>About this church</h2>

                {church.description && (
                  <p className='text-[16px] text-[#222222] leading-relaxed mb-6'>{church.description}</p>
                )}

                <div className='flex flex-col gap-5'>
                  {church.pastorName && (
                    <div className='flex items-center gap-4'>
                      <Users className='w-6 h-6 text-[#222222]' />
                      <div>
                        <p className='text-[14px] font-semibold text-[#222222]'>Pastor</p>
                        <p className='text-[14px] text-[#717171]'>{church.pastorName}</p>
                      </div>
                    </div>
                  )}
                  {church.yearEstablished && (
                    <div className='flex items-center gap-4'>
                      <Calendar className='w-6 h-6 text-[#222222]' />
                      <div>
                        <p className='text-[14px] font-semibold text-[#222222]'>Established</p>
                        <p className='text-[14px] text-[#717171]'>{church.yearEstablished}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Schedule */}
            {groupedServices.length > 0 && (
              <div className='py-8 border-b border-gray-200'>
                <h2 className='text-[22px] font-semibold text-[#222222] mb-5'>Service schedule</h2>
                <div className='space-y-5'>
                  {groupedServices.map(({ day, dayName, services }) => (
                    <div key={day}>
                      <h3 className='text-[16px] font-semibold text-[#222222] mb-2'>{dayName}</h3>
                      <div className='space-y-2'>
                        {services.map((service) => (
                          <div
                            key={service.id}
                            className='flex items-center gap-3 text-[14px] text-[#717171]'
                          >
                            <Clock className='w-4 h-4 flex-shrink-0 text-[#717171]' />
                            <span className='font-medium text-[#222222]'>
                              {formatServiceTime(service.startTime)}
                              {service.endTime && ` \u2013 ${formatServiceTime(service.endTime)}`}
                            </span>
                            <span className='text-[#b0b0b0]'>&middot;</span>
                            <span>{service.serviceType}</span>
                            {service.language && (
                              <>
                                <span className='text-[#b0b0b0]'>&middot;</span>
                                <span>{service.language}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What this church offers */}
            {(church.amenities.length > 0 || church.languages.length > 0) && (
              <div className='py-8 border-b border-gray-200'>
                <h2 className='text-[22px] font-semibold text-[#222222] mb-5'>What this church offers</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {church.amenities.map((amenity) => (
                    <div key={amenity} className='flex items-center gap-4 py-2'>
                      <CheckCircle className='w-6 h-6 text-[#222222]' />
                      <span className='text-[16px] text-[#222222]'>{amenity}</span>
                    </div>
                  ))}
                  {church.languages.map((lang) => (
                    <div key={lang} className='flex items-center gap-4 py-2'>
                      <Globe className='w-6 h-6 text-[#222222]' />
                      <span className='text-[16px] text-[#222222]'>{lang} services</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — contact card (sticky) */}
          <div className='w-full lg:w-[370px] flex-shrink-0'>
            <div className='sticky top-[96px] border border-gray-200 rounded-xl p-6 shadow-airbnb'>
              <h3 className='text-[22px] font-semibold text-[#222222] mb-1'>
                Visit {church.name.split(' ').slice(0, 3).join(' ')}
              </h3>
              <p className='text-[14px] text-[#717171] mb-6'>Get directions or contact the church</p>

              {/* Location */}
              <div className='mb-6'>
                <div className='w-full h-40 bg-gray-100 rounded-xl mb-3 flex items-center justify-center'>
                  <div className='text-center text-gray-400'>
                    <MapPin className='w-8 h-8 mx-auto mb-1' />
                    <p className='text-xs font-medium'>Map coming soon</p>
                  </div>
                </div>
                <div className='flex items-start gap-2'>
                  <MapPin className='w-5 h-5 text-[#222222] mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-[14px] font-medium text-[#222222]'>{church.address}</p>
                    <p className='text-[14px] text-[#717171]'>
                      {church.city}, {church.state} {church.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA button — Airbnb gradient style */}
              <a
                href={googleMapsUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='block w-full text-center px-6 py-3.5 bg-[#FF385C] hover:bg-[#E00B41] text-white rounded-lg font-semibold text-[16px] transition-colors mb-4'
              >
                Get Directions
              </a>

              {/* Contact details */}
              <div className='space-y-3 pt-4 border-t border-gray-200'>
                {church.phone && (
                  <a
                    href={`tel:${church.phone}`}
                    className='flex items-center gap-3 text-[14px] text-[#222222] hover:underline transition-colors'
                  >
                    <Phone className='w-5 h-5' />
                    <span>{church.phone}</span>
                  </a>
                )}
                {church.email && (
                  <a
                    href={`mailto:${church.email}`}
                    className='flex items-center gap-3 text-[14px] text-[#222222] hover:underline transition-colors'
                  >
                    <Mail className='w-5 h-5' />
                    <span>{church.email}</span>
                  </a>
                )}
                {church.website && (
                  <a
                    href={
                      church.website.startsWith('http')
                        ? church.website
                        : `https://${church.website}`
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-3 text-[14px] text-[#222222] hover:underline transition-colors'
                  >
                    <Globe className='w-5 h-5' />
                    <span className='truncate'>{church.website}</span>
                    <ExternalLink className='w-3.5 h-3.5 ml-auto text-[#717171] flex-shrink-0' />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='border-t border-gray-200 bg-[#f7f7f7]'>
        <div className='max-w-[1120px] mx-auto px-6 lg:px-0 py-6'>
          <p className='text-sm text-[#717171]'>&copy; 2026 SA Church Finder</p>
        </div>
      </footer>
    </div>
  )
}

/** Loading skeleton for the profile page */
const ProfileSkeleton = () => (
  <div className='flex-1 overflow-y-auto animate-pulse bg-white'>
    <div className='max-w-[1120px] mx-auto px-6 lg:px-0 pt-6 pb-4'>
      <div className='h-4 w-16 bg-gray-200 rounded' />
    </div>

    <div className='max-w-[1120px] mx-auto px-6 lg:px-0 mb-6'>
      <div className='grid grid-cols-4 gap-2 rounded-xl overflow-hidden h-[400px]'>
        <div className='col-span-2 row-span-2 bg-gray-200' />
        <div className='bg-gray-100' />
        <div className='bg-gray-200' />
        <div className='bg-gray-100' />
        <div className='bg-gray-200' />
      </div>
    </div>

    <div className='max-w-[1120px] mx-auto px-6 lg:px-0 pb-16'>
      <div className='flex flex-col lg:flex-row gap-12 lg:gap-24'>
        <div className='flex-1'>
          <div className='h-8 bg-gray-200 rounded w-2/3 mb-3' />
          <div className='h-4 bg-gray-200 rounded w-1/2 mb-8' />
          <div className='space-y-3 border-t border-gray-200 pt-8'>
            <div className='h-4 bg-gray-200 rounded w-full' />
            <div className='h-4 bg-gray-200 rounded w-5/6' />
            <div className='h-4 bg-gray-200 rounded w-4/6' />
          </div>
        </div>
        <div className='w-full lg:w-[370px]'>
          <div className='border border-gray-200 rounded-xl p-6 h-[400px] bg-gray-50' />
        </div>
      </div>
    </div>
  </div>
)
