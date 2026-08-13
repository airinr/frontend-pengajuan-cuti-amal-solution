import { useState, useEffect } from 'react'
import LeaveList from './components/LeaveList'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

type AuthPage = 'login' | 'register'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authPage, setAuthPage] = useState<AuthPage>('login')

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('token_type')
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    if (authPage === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />
    }
    return (
      <LoginPage
        onLogin={() => setIsLoggedIn(true)}
        onSwitchToRegister={() => setAuthPage('register')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Manajemen Cuti</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">API: localhost:3000</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <LeaveList />
      </main>
    </div>
  )
}

export default App
