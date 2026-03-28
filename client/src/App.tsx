import { Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { SearchPage } from '@/pages/SearchPage'
import { ChurchProfilePage } from '@/pages/ChurchProfilePage'

const App = () => {
  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      <Header />
      <Routes>
        <Route path='/' element={<SearchPage />} />
        <Route path='/churches/:slug' element={<ChurchProfilePage />} />
      </Routes>
    </div>
  )
}

export default App
