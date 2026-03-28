import { Search } from 'lucide-react'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            SA Church Finder
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover churches in San Antonio
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="w-full max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for churches..."
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>More features coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
