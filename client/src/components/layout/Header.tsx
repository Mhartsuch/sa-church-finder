import { Church, Search, User, Menu } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useSearchStore } from '@/stores/search-store'

export const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalValue(value)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setQuery(value)
    }, 300)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (location.pathname !== '/search' && location.pathname !== '/') {
      navigate('/search')
    }
  }

  return (
    <header className='sticky top-0 z-50 bg-white border-b border-gray-200'>
      <div className='max-w-[2520px] mx-auto px-4 sm:px-6 lg:px-10'>
        <div className='flex items-center justify-between h-20'>
          {/* Logo */}
          <Link to='/' className='flex items-center gap-2 flex-shrink-0'>
            <div className='w-8 h-8 rounded-lg flex items-center justify-center' style={{ backgroundColor: '#FF385C' }}>
              <Church className='w-5 h-5 text-white' />
            </div>
            <span className='text-xl font-bold text-[#222222] hidden sm:block tracking-tight'>
              SA Church Finder
            </span>
          </Link>

          {/* Center search pill — always visible */}
          <form
            onSubmit={handleSearchSubmit}
            className='hidden md:flex flex-1 max-w-[420px] mx-6'
          >
            <button
              type='button'
              onClick={() => {
                if (location.pathname !== '/search' && location.pathname !== '/') {
                  navigate('/search')
                }
                // Focus the input
                const input = document.getElementById('header-search-input')
                input?.focus()
              }}
              className='search-pill w-full hover:shadow-airbnb-subtle'
            >
              <div className='flex items-center w-full'>
                <Search className='w-4 h-4 text-[#222222] ml-4 flex-shrink-0' />
                <input
                  id='header-search-input'
                  type='text'
                  value={localValue}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                  placeholder='Search churches...'
                  className='flex-1 px-3 py-[10px] text-sm text-[#222222] placeholder-gray-400 bg-transparent border-0 outline-none font-medium'
                />
                <div className='mr-2 p-[7px] bg-[#FF385C] hover:bg-[#E00B41] text-white rounded-full transition-colors'>
                  <Search className='w-3 h-3' />
                </div>
              </div>
            </button>
          </form>

          {/* Right side nav */}
          <div className='flex items-center gap-2'>
            <Link
              to='/search'
              className='hidden sm:block text-sm font-semibold text-[#222222] px-4 py-2.5 rounded-full hover:bg-gray-100 transition-colors'
            >
              Explore
            </Link>
            <div className='flex items-center gap-2.5 px-3 py-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow cursor-pointer'>
              <Menu className='w-4 h-4 text-[#222222]' />
              <div className='w-[30px] h-[30px] bg-gray-500 rounded-full flex items-center justify-center'>
                <User className='w-4 h-4 text-white' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
