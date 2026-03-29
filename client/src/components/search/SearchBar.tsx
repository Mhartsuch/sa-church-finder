import { useEffect, useRef, useState } from 'react'
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit?.()
  }

  const inputSizeClass = variant === 'hero' ? 'py-3 text-base' : 'py-[10px] text-sm'
  const placeholder =
    variant === 'hero' ? 'Search churches, denomination, neighborhood...' : 'Search churches...'

  return (
    <form onSubmit={handleSubmit} className='relative w-full'>
      <div className='search-pill'>
        <Search className='ml-4 h-4 w-4 flex-shrink-0 text-[#222222]' />
        <input
          type='text'
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`flex-1 border-0 bg-transparent px-3 font-medium text-[#222222] outline-none placeholder-gray-400 ${inputSizeClass}`}
        />
        {localValue && (
          <button
            type='button'
            onClick={handleClear}
            className='mr-1 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#222222]'
            aria-label='Clear search'
          >
            <X className='h-4 w-4' />
          </button>
        )}
        <button
          type='submit'
          className='mr-2 rounded-full bg-[#FF385C] p-[7px] text-white transition-colors hover:bg-[#E00B41]'
          aria-label='Submit search'
        >
          <Search className='h-3 w-3' />
        </button>
      </div>
    </form>
  )
}
