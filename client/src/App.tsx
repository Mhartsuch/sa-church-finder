import { Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import HomePage from '@/pages/HomePage'
import { SearchPage } from '@/pages/SearchPage'
import { ChurchProfilePage } from '@/pages/ChurchProfilePage'

const App = () => {
  return (
    <div className='flex flex-col min-h-screen bg-white'>
      <Header />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/search' element={<SearchPage />} />
        <Route path='/churches/:slug' element={<ChurchProfilePage />} />
      </Routes>
    </div>
  )
}

export default App
