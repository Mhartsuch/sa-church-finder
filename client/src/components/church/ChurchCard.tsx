import { Heart, Star } from 'lucide-react'
import { IChurchSummary } from '@/types/church'
import { formatDistance, formatRating, getNextService } from '@/utils/format'

interface ChurchCardProps {
  church: IChurchSummary
  isHovered: boolean
  onHover: (id: string | null) => void
  onClick: (slug: string) => void
}

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
  const profileLabel = `View ${church.name} profile`
  const saveLabel = `Save ${church.name}`

  return (
    <article
      role='listitem'
      onMouseEnter={() => onHover(church.id)}
      onMouseLeave={() => onHover(null)}
      onFocusCapture={() => onHover(church.id)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onHover(null)
        }
      }}
      className={`relative transition-transform duration-200 ${
        isHovered ? 'scale-[1.01]' : ''
      }`}
    >
      <button
        type='button'
        onClick={() => onClick(church.slug)}
        aria-label={profileLabel}
        className='group w-full rounded-[20px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-4'
      >
        <div className='relative mb-3 aspect-[20/19] overflow-hidden rounded-xl'>
          <img
            src={imageUrl}
            alt={church.name}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]'
            loading='lazy'
            onError={(event) => {
              const target = event.target as HTMLImageElement
              target.style.display = 'none'
              target.parentElement?.classList.add(
                'bg-gradient-to-br',
                'from-gray-100',
                'to-gray-200'
              )
            }}
          />

          <div className='absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5'>
            <div className='h-1.5 w-1.5 rounded-full bg-white' />
            <div className='h-1.5 w-1.5 rounded-full bg-white/50' />
            <div className='h-1.5 w-1.5 rounded-full bg-white/50' />
            <div className='h-1.5 w-1.5 rounded-full bg-white/50' />
            <div className='h-1.5 w-1.5 rounded-full bg-white/50' />
          </div>
        </div>

        <div className='space-y-0.5'>
          <div className='flex items-start justify-between gap-1'>
            <h3 className='line-clamp-1 text-[15px] font-semibold text-[#222222]'>
              {church.name}
            </h3>
            {church.avgRating > 0 && (
              <div className='flex flex-shrink-0 items-center gap-1 pt-0.5'>
                <Star className='h-3 w-3 fill-[#222222] text-[#222222]' />
                <span className='text-[14px] text-[#222222]'>{formatRating(church.avgRating)}</span>
              </div>
            )}
          </div>

          {church.denomination && (
            <p className='text-[14px] text-[#717171]'>{church.denomination}</p>
          )}

          <p className='text-[14px] text-[#717171]'>
            {church.neighborhood ? `${church.neighborhood}, ` : ''}
            {formatDistance(church.distance)} away
          </p>

          {nextService && (
            <p className='pt-0.5 text-[14px] font-semibold text-[#222222]'>
              {nextService}
            </p>
          )}
        </div>
      </button>

      <button
        type='button'
        onClick={(event) => {
          event.stopPropagation()
        }}
        className='absolute right-3 top-3 z-10 p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#222222]'
        aria-label={saveLabel}
      >
        <Heart
          className='h-6 w-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.32)]'
          fill='rgba(0,0,0,0.5)'
          stroke='white'
          strokeWidth={2}
        />
      </button>
    </article>
  )
}
