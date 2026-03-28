import { Building2 } from 'lucide-react'

export const Header = () => {
  return (
    <header className='bg-white border-b border-gray-200 shadow-sm'>
      <div className='max-w-full px-4 py-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Building2 className='w-8 h-8 text-blue-600' />
            <h1 className='text-2xl font-bold text-gray-900'>SA Church Finder</h1>
          </div>
          <nav className='hidden md:flex gap-6'>
            <a href='#' className='text-gray-600 hover:text-gray-900 text-sm font-medium'>
              Home
            </a>
            <a href='#' className='text-gray-600 hover:text-gray-900 text-sm font-medium'>
              About
            </a>
            <a href='#' className='text-gray-600 hover:text-gray-900 text-sm font-medium'>
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
