import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Clock,
  ChevronRight,
  CheckCircle,
  Users,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { useChurch } from '@/hooks/useChurches'
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
  // Return in day order, only days that have services
  return DAY_ORDER.filter((day) => grouped.has(day)).map((day) => ({
    day,
    dayName: getDayName(day),
    services: grouped.get(day)!,
  }))
}

const AMENITY_ICONS: Record<string, string> = {
  Parking: 'P',
  'Wheelchair Accessible': 'WC',
  Childcare: 'CC',
  Livestream: 'LS',
  'Youth Group': 'YG',
  Choir: 'CH',
  'Gift Shop': 'GS',
  'Music Ministry': 'MM',
  'Food Pantry': 'FP',
  'Community Garden': 'CG',
}

export const ChurchProfilePage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: church, isLoading, error } = useChurch(slug ?? '')

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error || !church) {
    return (
      <div className='flex-1 flex flex-col items-center justify-center p-8'>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Church Not Found</h2>
        <p className='text-gray-600 mb-6'>
          We couldn&apos;t find a church at this address. It may have been removed or the link may be
          incorrect.
        </p>
        <button
          onClick={() => navigate('/')}
          className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
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

  return (
    <div className='flex-1 overflow-y-auto'>
      {/* Back Navigation */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3'>
          <Link
            to='/'
            className='inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to Search
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className='bg-gradient-to-br from-blue-600 to-blue-800 text-white'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
          <div className='flex flex-col gap-4'>
            {/* Denomination badge */}
            {church.denomination && (
              <span className='inline-flex self-start px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full'>
                {church.denomination}
              </span>
            )}

            {/* Name */}
            <h1 className='text-3xl sm:text-4xl font-bold'>{church.name}</h1>

            {/* Rating + claimed */}
            <div className='flex items-center flex-wrap gap-4'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-0.5'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(church.avgRating)
                          ? 'fill-amber-300 text-amber-300'
                          : 'text-white/40'
                      }`}
                    />
                  ))}
                </div>
                <span className='font-semibold'>{formatRating(church.avgRating)}</span>
                <span className='text-white/80'>({church.reviewCount} reviews)</span>
              </div>

              {church.isClaimed && (
                <span className='inline-flex items-center gap-1 text-sm text-green-300'>
                  <CheckCircle className='w-4 h-4' />
                  Claimed
                </span>
              )}
            </div>

            {/* Location */}
            <div className='flex items-center gap-2 text-white/90'>
              <MapPin className='w-5 h-5 shrink-0' />
              <span>
                {church.address}, {church.city}, {church.state} {church.zipCode}
                {church.neighborhood && (
                  <span className='text-white/70'> &middot; {church.neighborhood}</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8'>
        {/* About Section */}
        {(church.description || church.pastorName || church.yearEstablished) && (
          <section className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>About</h2>

            {church.description && (
              <p className='text-gray-700 leading-relaxed mb-4'>{church.description}</p>
            )}

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {church.pastorName && (
                <div className='flex items-start gap-3'>
                  <Users className='w-5 h-5 text-gray-400 mt-0.5' />
                  <div>
                    <p className='text-sm text-gray-500'>Pastor</p>
                    <p className='font-medium text-gray-900'>{church.pastorName}</p>
                  </div>
                </div>
              )}
              {church.yearEstablished && (
                <div className='flex items-start gap-3'>
                  <Calendar className='w-5 h-5 text-gray-400 mt-0.5' />
                  <div>
                    <p className='text-sm text-gray-500'>Established</p>
                    <p className='font-medium text-gray-900'>{church.yearEstablished}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Service Schedule */}
        {groupedServices.length > 0 && (
          <section className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>Service Schedule</h2>
            <div className='space-y-4'>
              {groupedServices.map(({ day, dayName, services }) => (
                <div key={day} className='border-b border-gray-100 last:border-0 pb-4 last:pb-0'>
                  <h3 className='font-semibold text-gray-900 mb-2'>{dayName}</h3>
                  <div className='space-y-2'>
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className='flex items-center gap-3 text-sm text-gray-700'
                      >
                        <Clock className='w-4 h-4 text-gray-400 shrink-0' />
                        <span className='font-medium'>
                          {formatServiceTime(service.startTime)}
                          {service.endTime && ` – ${formatServiceTime(service.endTime)}`}
                        </span>
                        <span className='text-gray-400'>|</span>
                        <span>{service.serviceType}</span>
                        {service.language && (
                          <>
                            <span className='text-gray-400'>|</span>
                            <span className='text-gray-500'>{service.language}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages & Amenities */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Languages */}
          {church.languages.length > 0 && (
            <section className='bg-white rounded-lg border border-gray-200 p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>Languages</h2>
              <div className='flex flex-wrap gap-2'>
                {church.languages.map((lang) => (
                  <span
                    key={lang}
                    className='inline-flex px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full'
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Amenities */}
          {church.amenities.length > 0 && (
            <section className='bg-white rounded-lg border border-gray-200 p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>Amenities & Features</h2>
              <div className='flex flex-wrap gap-2'>
                {church.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className='inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full'
                  >
                    <span className='w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-bold'>
                      {AMENITY_ICONS[amenity] || amenity.charAt(0)}
                    </span>
                    {amenity}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Location & Directions */}
        <section className='bg-white rounded-lg border border-gray-200 p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Location</h2>

          {/* Static map placeholder */}
          <div className='w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400'>
            <div className='text-center'>
              <MapPin className='w-8 h-8 mx-auto mb-2' />
              <p className='text-sm'>Map coming soon (Mapbox integration)</p>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div className='flex items-start gap-2'>
              <MapPin className='w-5 h-5 text-gray-400 mt-0.5 shrink-0' />
              <div>
                <p className='font-medium text-gray-900'>{church.address}</p>
                <p className='text-sm text-gray-600'>
                  {church.city}, {church.state} {church.zipCode}
                </p>
              </div>
            </div>
            <a
              href={googleMapsUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors self-start'
            >
              Get Directions
              <ExternalLink className='w-4 h-4' />
            </a>
          </div>
        </section>

        {/* Contact Info */}
        {(church.phone || church.email || church.website) && (
          <section className='bg-white rounded-lg border border-gray-200 p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>Contact</h2>
            <div className='space-y-3'>
              {church.phone && (
                <a
                  href={`tel:${church.phone}`}
                  className='flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors'
                >
                  <Phone className='w-5 h-5 text-gray-400' />
                  <span>{church.phone}</span>
                </a>
              )}
              {church.email && (
                <a
                  href={`mailto:${church.email}`}
                  className='flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors'
                >
                  <Mail className='w-5 h-5 text-gray-400' />
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
                  className='flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors'
                >
                  <Globe className='w-5 h-5 text-gray-400' />
                  <span>{church.website}</span>
                  <ChevronRight className='w-4 h-4 ml-auto text-gray-400' />
                </a>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

/** Loading skeleton for the profile page */
const ProfileSkeleton = () => (
  <div className='flex-1 overflow-y-auto animate-pulse'>
    {/* Hero skeleton */}
    <div className='bg-gray-200 h-56' />

    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8'>
      {/* About skeleton */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <div className='h-6 w-24 bg-gray-200 rounded mb-4' />
        <div className='space-y-2'>
          <div className='h-4 bg-gray-200 rounded w-full' />
          <div className='h-4 bg-gray-200 rounded w-5/6' />
          <div className='h-4 bg-gray-200 rounded w-4/6' />
        </div>
      </div>

      {/* Services skeleton */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <div className='h-6 w-40 bg-gray-200 rounded mb-4' />
        <div className='space-y-3'>
          <div className='h-4 bg-gray-200 rounded w-48' />
          <div className='h-4 bg-gray-200 rounded w-64' />
          <div className='h-4 bg-gray-200 rounded w-56' />
        </div>
      </div>

      {/* Location skeleton */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <div className='h-6 w-28 bg-gray-200 rounded mb-4' />
        <div className='h-48 bg-gray-100 rounded-lg mb-4' />
        <div className='h-4 bg-gray-200 rounded w-64' />
      </div>
    </div>
  </div>
)
