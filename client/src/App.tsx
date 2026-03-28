import { Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { SearchPage } from '@/pages/SearchPage'

const App = () => {
  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      <Header />
      <Routes>
        <Route path='/' element={<SearchPage />} />
      </Routes>
    </div>
  )
}

export default App
