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
    <div className="flex flex-col h-screen bg-[#F5F5F5]">
      {/* Top bar móvil */}
      {windowWidth < 768 && (
        <header className="h-14 bg-[#FFFFFF] border-b border-[#E0E0E0] flex items-center justify-between px-4 shrink-0 z-20">
          <button onClick={() => setMobileMenuOpen(true)} className="text-[#1565C0]" aria-label="Menú">
            ☰
          </button>
          <div className="flex-1 flex items-center justify-center">
            <span className="font-semibold text-[#212121] text-sm">{tabs[activeIndex]?.label}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#1565C0] flex items-center justify-center text-white text-xs font-bold">
            {initials(userEmail)}
          </div>
        </header>
      )}

      <div className="flex-1 overflow-hidden relative">
        {/* Drawer móvil */}
        {windowWidth < 768 && mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 flex items-end" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-full bg-white p-6 shadow-2xl max-h-[80%] overflow-y-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded bg-[#1565C0] flex items-center justify-center text-white font-bold text-xs">
                  A
                </div>
                <span className="font-bold text-[#212121]">AIP Gest</span>
              </div>
              {tabs.map((t, i) => (
                <button
                  key={i}
                  onClick={() => goTo(t.route)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeIndex === i ? 'bg-[#E3F2FD] text-[#1565C0]' : 'text-[#616161] hover:bg-[#F5F5F5]'
                  }`}
                >
                  {t.icon} <span>{t.label}</span>
                </button>
              ))}
              <div className="mt-8 pt-4 border-t border-[#E0E0E0]">
                <button onClick={() => goTo('/dashboard/perfil')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#C62828] hover:bg-[#FFEBEE]">
                  👤 Perfil
                </button>
                <button onClick={() => goTo('/login')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#C62828] hover:bg-[#FFEBEE] mt-2">
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
          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E0E0E0] flex items-center justify-around px-2 z-30 shadow-lg">
            {tabs.map((t, i) => {
              const active = activeIndex === i
              return (
                <button key={i} onClick={() => goTo(t.route)} className="flex flex-col items-center gap-1 p-2 rounded-md transition-colors">
                  {t.icon}
                  <span className={`text-[10px] font-medium ${active ? 'text-[#1565C0]' : 'text-[#616161]'}`}>{t.label}</span>
                </button>
              )
            })}
          </nav>
        )}
      </div>
    </div>
  )
}
