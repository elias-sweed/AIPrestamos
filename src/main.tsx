import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { SplashPage } from './pages/splash'
import { LoginPage } from './pages/login'
import { DashboardPage } from './pages/dashboard'
import { LoansPage, LoanCreatePage, LoanDetailPage, LoanReturnPage } from './pages/loans'
import { EquipmentPage, EquipoDetailPage, EquipoFormPage } from './pages/equipos'
import { TeachersPage, DocenteDetailPage, DocenteFormPage } from './pages/teachers'
import { HistoryPage } from './pages/history'
import { ReportesPage } from './pages/reportes'
import { ProfilePage } from './pages/profile'
import { AppShell } from './components/navigation/appShell'
import { authStore } from './providers/authStore'
import { installGlobalBridge } from './globalBridge'

const ENCARGADO_TABS = [
  { label: 'Inicio', icon: '🏠', route: '/dashboard' },
  { label: 'Préstamos', icon: '📋', route: '/dashboard/prestamos' },
  { label: 'Equipos', icon: '📱', route: '/dashboard/equipos' },
  { label: 'Docentes', icon: '👤', route: '/dashboard/docentes' },
  { label: 'Reportes', icon: '📊', route: '/dashboard/reportes' },
  { label: 'Historial', icon: '🕒', route: '/dashboard/historial' },
  { label: 'Perfil', icon: '👤', route: '/dashboard/perfil' },
]

const PRACTICANTE_TABS = [
  { label: 'Inicio', icon: '🏠', route: '/dashboard' },
  { label: 'Préstamos', icon: '📋', route: '/dashboard/prestamos' },
  { label: 'Historial', icon: '🕒', route: '/dashboard/historial' },
  { label: 'Perfil', icon: '👤', route: '/dashboard/perfil' },
]

const ShellWithTabs = ({ role }: { role: 'encargado_aip' | 'practicante' }) => (
  <AppShell role={role} tabs={role === 'encargado_aip' ? ENCARGADO_TABS : PRACTICANTE_TABS} userEmail={authStore.value.user?.email ?? null} />
)

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  return authStore.value.isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  )
}

// Inicializar el puente global después de que la sesión esté lista
authStore.subscribe((state) => {
  if (!state.isLoading && state.isAuthenticated) {
    installGlobalBridge()
  }
})

// También inicializar inmediatamente si ya hay sesión
if (authStore.value.isAuthenticated && !authStore.value.isLoading) {
  installGlobalBridge()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <ShellWithTabs role={authStore.value.role} />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="prestamos" element={<LoansPage />} />
          <Route path="prestamos/nuevo" element={<LoanCreatePage />} />
          <Route path="prestamos/:id" element={<LoanDetailPage />} />
          <Route path="prestamos/devolucion/:id" element={<LoanReturnPage />} />
          <Route path="equipos" element={<EquipmentPage />} />
          <Route path="equipos/nuevo" element={<EquipoFormPage />} />
          <Route path="equipos/:id" element={<EquipoDetailPage />} />
          <Route path="equipos/:id/editar" element={<EquipoFormPage />} />
          <Route path="docentes" element={<TeachersPage />} />
          <Route path="docentes/nuevo" element={<DocenteFormPage />} />
          <Route path="docentes/:id" element={<DocenteDetailPage />} />
          <Route path="docentes/:id/editar" element={<DocenteFormPage />} />
          <Route path="historial" element={<HistoryPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
