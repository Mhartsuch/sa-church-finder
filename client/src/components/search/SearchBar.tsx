import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useSearchStore } from '@/stores/search-store'

export const SearchBar = () => {
  const query = useSearchStore((state) => state.query)
  const setQuery = useSearchStore((state) => state.setQuery)
  const [localValue, setLocalValue] = useState(query)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setLocalValue(query)
  }, [query])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalValue(value)

    // Debounce the store update
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

  return (
    <div className='relative w-full'>
      <div className='relative flex items-center bg-white rounded-lg border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'>
        <Search className='w-5 h-5 text-gray-400 ml-3 flex-shrink-0' />
        <input
          type='text'
          value={localValue}
          onChange={handleChange}
          placeholder='Search churches by name, denomination, or neighborhood...'
          className='w-full px-3 py-3 text-gray-900 placeholder-gray-500 border-0 outline-none'
        />
        {localValue && (
          <button
            onClick={handleClear}
            className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
            aria-label='Clear search'
          >
            <X className='w-5 h-5' />
          </button>
        )}
      </div>
    </div>
  )
}
