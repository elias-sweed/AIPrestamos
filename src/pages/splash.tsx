import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { authStore } from '../providers/authStore'

export const SplashPage = () => {
  const navigate = useNavigate()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      if (authStore.value.isAuthenticated) {
        navigate('/dashboard')
      } else {
        navigate('/login')
      }
    }, 1200)
    return () => clearTimeout(timer)
  }, [navigate])

  if (!mounted) return null

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#050505] text-white">
      <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#1565C0] text-4xl mb-6 shadow-[0_0_40px_rgba(21,101,192,0.4)] animate-logo-float">
        🏫
      </div>
      <h1 className="text-3xl font-bold text-white tracking-tight">AIP Gest</h1>
      <p className="text-[#00F2FF]/70 text-sm mt-2">Control de Préstamos</p>
      <div className="mt-8 w-12 h-12 border-2 border-[#00F2FF]/40 rounded-full border-t-transparent animate-spin"></div>
    </div>
  )
}
