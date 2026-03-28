import { CategoryFilter } from '@/components/search/CategoryFilter'
import { ChurchList } from '@/components/church/ChurchList'

const HomePage = () => {
  return (
    <div className='min-h-screen bg-white'>
      {/* Category Filter Bar — sticky below header */}
      <div className='sticky top-[80px] z-40 bg-white border-b border-gray-200'>
        <div className='max-w-[2520px] mx-auto'>
          <CategoryFilter showQuickFilters />
        </div>
      </div>

      {/* Church Grid */}
      <div className='max-w-[2520px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-20 pt-6 pb-10'>
        <ChurchList variant='grid' />
      </div>

      {/* Footer */}
      <footer className='border-t border-gray-200 bg-[#f7f7f7]'>
        <div className='max-w-[2520px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-20 py-6'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <p className='text-sm text-[#717171]'>
              &copy; 2026 SA Church Finder
            </p>
            <div className='flex items-center gap-4'>
              <a href='#' className='text-sm text-[#222222] hover:underline font-medium'>About</a>
              <span className='text-gray-300'>&middot;</span>
              <a href='#' className='text-sm text-[#222222] hover:underline font-medium'>Privacy</a>
              <span className='text-gray-300'>&middot;</span>
              <a href='#' className='text-sm text-[#222222] hover:underline font-medium'>Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
