import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useSearchStore } from '@/stores/search-store'

interface SearchBarProps {
  variant?: 'hero' | 'compact'
  onSubmit?: () => void
}

export const SearchBar = ({ variant = 'compact', onSubmit }: SearchBarProps) => {
  const query = useSearchStore((state) => state.query)
  const setQuery = useSearchStore((state) => state.setQuery)
  const [localValue, setLocalValue] = useState(query)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalValue(query)
  }, [query])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalValue(value)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setQuery(value)
    }, 300)
  }

  const handleClear = () => {
    setLocalValue('')
    setQuery('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.()
  }

  const inputSizeClass = variant === 'hero' ? 'py-3 text-base' : 'py-[10px] text-sm'
  const placeholder =
    variant === 'hero' ? 'Search churches, denomination, neighborhood...' : 'Search churches...'

  return (
    <form onSubmit={handleSubmit} className='relative w-full'>
      <div className='search-pill'>
        <Search className='w-4 h-4 text-[#222222] ml-4 flex-shrink-0' />
        <input
          type='text'
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`flex-1 px-3 text-[#222222] placeholder-gray-400 bg-transparent border-0 outline-none font-medium ${inputSizeClass}`}
        />
        {localValue && (
          <button
            type='button'
            onClick={handleClear}
            className='p-1 mr-1 text-gray-400 hover:text-[#222222] hover:bg-gray-100 rounded-full transition-colors'
            aria-label='Clear search'
          >
            <X className='w-4 h-4' />
          </button>
        )}
        <div className='mr-2 p-[7px] bg-[#FF385C] hover:bg-[#E00B41] text-white rounded-full transition-colors cursor-pointer'>
          <Search className='w-3 h-3' />
        </div>
      </div>
    </form>
  )
}
