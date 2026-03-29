import { useEffect, useRef, useState } from 'react'
import { Church, Menu, Search, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuthSession } from '@/hooks/useAuth'
import { useSearchStore } from '@/stores/search-store'

export const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoading, user } = useAuthSession()
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setLocalValue(value)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setQuery(value)
    }, 300)
  }

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (location.pathname !== '/search' && location.pathname !== '/') {
      navigate('/search')
    }
  }

  const firstName = user?.name.split(' ')[0] || 'Account'
  const avatarLabel =
    user?.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || null

  return (
    <header className='sticky top-0 z-50 border-b border-gray-200 bg-white'>
      <div className='mx-auto max-w-[2520px] px-4 sm:px-6 lg:px-10'>
        <div className='flex h-20 items-center justify-between'>
          <Link to='/' className='flex flex-shrink-0 items-center gap-2'>
            <div
              className='flex h-8 w-8 items-center justify-center rounded-lg'
              style={{ backgroundColor: '#FF385C' }}
            >
              <Church className='h-5 w-5 text-white' />
            </div>
            <span className='hidden text-xl font-bold tracking-tight text-[#222222] sm:block'>
              SA Church Finder
            </span>
          </Link>

          <form onSubmit={handleSearchSubmit} className='mx-6 hidden max-w-[420px] flex-1 md:flex'>
            <div className='search-pill w-full transition-shadow hover:shadow-airbnb-subtle focus-within:shadow-airbnb-subtle'>
              <div className='flex w-full items-center'>
                <Search className='ml-4 h-4 w-4 flex-shrink-0 text-[#222222]' />
                <input
                  id='header-search-input'
                  type='text'
                  value={localValue}
                  onChange={handleSearchChange}
                  placeholder='Search churches...'
                  className='flex-1 border-0 bg-transparent px-3 py-[10px] text-sm font-medium text-[#222222] outline-none placeholder-gray-400'
                />
                <button
                  type='submit'
                  className='mr-2 rounded-full bg-[#FF385C] p-[7px] text-white transition-colors hover:bg-[#E00B41]'
                  aria-label='Submit search'
                >
                  <Search className='h-3 w-3' />
                </button>
              </div>
            </div>
          </form>

          <div className='flex items-center gap-2'>
            <Link
              to='/search'
              className='hidden rounded-full px-4 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:bg-gray-100 sm:block'
            >
              Explore
            </Link>

            {user ? (
              <>
                <Link
                  to='/account'
                  className='hidden rounded-full px-4 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:bg-gray-100 sm:block'
                >
                  {firstName}
                </Link>
                <Link
                  to='/account'
                  className='flex items-center gap-2.5 rounded-full border border-gray-300 px-3 py-2 transition-shadow hover:shadow-md'
                  aria-label='Open account'
                >
                  <Menu className='h-4 w-4 text-[#222222]' />
                  <div className='flex h-[30px] min-w-[30px] items-center justify-center rounded-full bg-[#222222] px-2 text-xs font-semibold text-white'>
                    {avatarLabel}
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to='/login'
                  className='hidden rounded-full px-4 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:bg-gray-100 sm:block'
                >
                  Sign in
                </Link>
                <Link
                  to='/register'
                  className='flex items-center gap-2.5 rounded-full border border-gray-300 px-3 py-2 transition-shadow hover:shadow-md'
                  aria-label={isLoading ? 'Checking account session' : 'Create account'}
                >
                  <Menu className='h-4 w-4 text-[#222222]' />
                  <div className='flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gray-500'>
                    <User className='h-4 w-4 text-white' />
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
