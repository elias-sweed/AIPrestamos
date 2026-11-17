import * as React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

interface Tab {
  label: string
  icon: React.ReactNode
  route: string
}

export interface AppShellProps {
  role: 'encargado_aip' | 'practicante'
  tabs: Tab[]
  userEmail?: string | null
}

export const AppShell = ({ role, tabs, userEmail }: AppShellProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const activeIndex = React.useMemo(() => {
    const sorted = tabs
      .map((t, i) => ({ i, route: t.route }))
      .sort((a, b) => b.route.length - a.route.length)
    for (const { i, route } of sorted) {
      if (location.pathname.startsWith(route)) return i
    }
    return 0
  }, [location.pathname, tabs])

  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth)
  React.useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const goTo = (route: string) => {
    setMobileMenuOpen(false)
    navigate(route)
  }

  const initials = (email?: string | null) => {
    if (!email) return '?'
    const at = email.indexOf('@')
    if (at <= 0) return email[0].toUpperCase()
    const name = email.substring(0, at)
    const parts = name.split('.')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name[0].toUpperCase()
  }

  return (
    <div className="flex flex-col h-screen bg-[#050505]">
      {/* Top bar móvil */}
      {windowWidth < 768 && (
        <header className="h-14 neon-header flex items-center justify-between px-4 shrink-0 z-20">
          <button onClick={() => setMobileMenuOpen(true)} className="text-[#00F2FF]" aria-label="Menú">
            ☰
          </button>
          <div className="flex-1 flex items-center justify-center">
            <span className="font-semibold text-[#E0E0E0] text-sm">{tabs[activeIndex]?.label}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#1565C0] to-[#00F2FF] flex items-center justify-center text-white text-xs font-bold shadow-[0_0_15px_rgba(0,242,255,0.4)]">
            {initials(userEmail)}
          </div>
        </header>
      )}

      <div className="flex-1 overflow-hidden relative">
        {/* Drawer móvil */}
        {windowWidth < 768 && mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/80 flex items-end" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-full bg-[#0a0a0a] p-6 shadow-2xl max-h-[80%] overflow-y-auto border-t border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded bg-gradient-to-r from-[#1565C0] to-[#00F2FF] flex items-center justify-center text-white font-bold text-xs shadow-[0_0_15px_rgba(0,242,255,0.4)]">
                  A
                </div>
                <span className="font-bold text-white">AIP Gest</span>
              </div>
              {tabs.map((t, i) => (
                <button
                  key={i}
                  onClick={() => goTo(t.route)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeIndex === i ? 'bg-[#1565C0]/20 border border-[#00F2FF]/30 text-[#00F2FF]' : 'text-[#90CAF9] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {t.icon} <span>{t.label}</span>
                </button>
              ))}
              <div className="mt-8 pt-4 border-t border-white/10">
                <button onClick={() => goTo('/dashboard/perfil')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#FF5252] hover:bg-red/10">
                  👤 Perfil
                </button>
                <button onClick={() => goTo('/login')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#FF5252] hover:bg-red/10 mt-2">
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet context={{ role }} />
        </main>

        {/* Bottom navigation móvil */}
        {windowWidth < 768 && (
          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-around px-2 z-30 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            {tabs.map((t, i) => {
              const active = activeIndex === i
              return (
                <button key={i} onClick={() => goTo(t.route)} className="flex flex-col items-center gap-1 p-2 rounded-md transition-colors">
                  {t.icon}
                  <span className={`text-[10px] font-medium ${active ? 'text-[#00F2FF]' : 'text-[#90CAF9]'}`}>{t.label}</span>
                </button>
              )
            })}
          </nav>
        )}
      </div>
    </div>
  )
}
