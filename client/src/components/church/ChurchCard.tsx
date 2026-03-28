import { Star, Heart } from 'lucide-react'
import { IChurchSummary } from '@/types/church'
import { formatDistance, formatRating, getNextService } from '@/utils/format'

interface ChurchCardProps {
  church: IChurchSummary
  isHovered: boolean
  onHover: (id: string | null) => void
  onClick: (slug: string) => void
}

// Placeholder images for churches without cover photos
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1543702758-388870abc93d?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1545987796-200d7efc7775?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=600&fit=crop',
]

const getPlaceholderImage = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return PLACEHOLDER_IMAGES[hash % PLACEHOLDER_IMAGES.length]
}

export const ChurchCard = ({ church, isHovered, onHover, onClick }: ChurchCardProps) => {
  const nextService = getNextService(church.services)
  const imageUrl = church.coverImageUrl || getPlaceholderImage(church.id)

  return (
    <div
      onMouseEnter={() => onHover(church.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(church.slug)}
      className={`group cursor-pointer transition-transform duration-200 ${
        isHovered ? 'scale-[1.01]' : ''
      }`}
    >
      {/* Image container — Airbnb uses ~20:19 aspect */}
      <div className='relative aspect-[20/19] overflow-hidden rounded-xl mb-3'>
        <img
          src={imageUrl}
          alt={church.name}
          className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]'
          loading='lazy'
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            target.parentElement!.classList.add('bg-gradient-to-br', 'from-gray-100', 'to-gray-200')
          }}
        />

        {/* Heart/save button — Airbnb style with stroke */}
        <button
          onClick={(e) => {
            e.stopPropagation()
          }}
          className='absolute top-3 right-3 p-1 hover:scale-110 transition-transform'
          aria-label='Save church'
        >
          <Heart
            className='w-6 h-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.32)]'
            fill='rgba(0,0,0,0.5)'
            stroke='white'
            strokeWidth={2}
          />
        </button>

        {/* Carousel dots placeholder */}
        <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5'>
          <div className='w-1.5 h-1.5 rounded-full bg-white' />
          <div className='w-1.5 h-1.5 rounded-full bg-white/50' />
          <div className='w-1.5 h-1.5 rounded-full bg-white/50' />
          <div className='w-1.5 h-1.5 rounded-full bg-white/50' />
          <div className='w-1.5 h-1.5 rounded-full bg-white/50' />
        </div>
      </div>

      {/* Content — Airbnb-style tight layout */}
      <div className='space-y-0.5'>
        {/* Title row with rating */}
        <div className='flex items-start justify-between gap-1'>
          <h3 className='text-[15px] font-semibold text-[#222222] line-clamp-1'>
            {church.name}
          </h3>
          {church.avgRating > 0 && (
            <div className='flex items-center gap-1 flex-shrink-0 pt-0.5'>
              <Star className='w-3 h-3 fill-[#222222] text-[#222222]' />
              <span className='text-[14px] text-[#222222]'>{formatRating(church.avgRating)}</span>
            </div>
          )}
        </div>

        {/* Denomination — secondary gray */}
        {church.denomination && (
          <p className='text-[14px] text-[#717171]'>{church.denomination}</p>
        )}

        {/* Location + distance */}
        <p className='text-[14px] text-[#717171]'>
          {church.neighborhood ? `${church.neighborhood} · ` : ''}{formatDistance(church.distance)} away
        </p>

        {/* Next service — emphasized */}
        {nextService && (
          <p className='text-[14px] text-[#222222] font-semibold pt-0.5'>
            {nextService}
          </p>
        )}
      </div>
    </div>
  )
}
