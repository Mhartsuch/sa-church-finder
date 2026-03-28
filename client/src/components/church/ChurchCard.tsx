import { MapPin, Star, Clock } from 'lucide-react'
import { IChurchSummary } from '@/types/church'
import { formatDistance, formatRating, getNextService } from '@/utils/format'

interface ChurchCardProps {
  church: IChurchSummary
  isHovered: boolean
  onHover: (id: string | null) => void
  onClick: (slug: string) => void
}

export const ChurchCard = ({ church, isHovered, onHover, onClick }: ChurchCardProps) => {
  const nextService = getNextService(church.services)
  const amenities = church.amenities.slice(0, 3)

  return (
    <div
      onMouseEnter={() => onHover(church.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(church.slug)}
      className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isHovered ? 'border-blue-500 shadow-md' : 'border-gray-200'
      }`}
    >
      <div className='p-4'>
        {/* Name and Denomination */}
        <div className='mb-2'>
          <h3 className='text-lg font-semibold text-gray-900 line-clamp-2'>{church.name}</h3>
          {church.denomination && (
            <p className='text-sm text-gray-500'>{church.denomination}</p>
          )}
        </div>

        {/* Neighborhood and Distance */}
        <div className='flex items-center gap-4 text-sm text-gray-600 mb-3'>
          {church.neighborhood && (
            <span className='flex items-center gap-1'>
              <MapPin className='w-4 h-4' />
              {church.neighborhood}
            </span>
          )}
          <span className='font-medium text-gray-900'>{formatDistance(church.distance)}</span>
        </div>

        {/* Rating */}
        <div className='flex items-center gap-2 mb-3'>
          <div className='flex items-center gap-1'>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(church.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className='text-sm font-medium text-gray-900'>
            {formatRating(church.avgRating)}
          </span>
          <span className='text-sm text-gray-500'>({church.reviewCount})</span>
        </div>

        {/* Next Service */}
        {nextService && (
          <div className='flex items-center gap-2 text-sm text-gray-600 mb-3'>
            <Clock className='w-4 h-4' />
            {nextService}
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {amenities.map((amenity) => (
              <span
                key={amenity}
                className='inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium'
              >
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
