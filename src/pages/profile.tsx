import { useNavigate } from 'react-router-dom'
import { authStore } from '../providers/authStore'
import { ROLE_LABELS } from '../domain/entities/userRole'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'

export const ProfilePage = () => {
  const navigate = useNavigate()
  const user = authStore.value.user
  const role = authStore.value.role

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      await authStore.logout()
      navigate('/login')
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-[#212121] mb-6">Perfil</h2>

      <Card className="mb-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#1565C0] flex items-center justify-center text-white text-4xl mb-4">
            {user?.email?.split('@')[0][0].toUpperCase() ?? '?'}
          </div>
          <div className="text-xl font-bold text-[#212121]">{user?.email ?? 'Sin correo'}</div>
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            role === 'encargado_aip' ? 'bg-[#E3F2FD] text-[#1565C0]' : 'bg-[#E8F5E9] text-[#2E7D32]'
          }`}>
            {ROLE_LABELS[role]}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#212121]">Información de la cuenta</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-[#E0E0E0] pb-2">
            <span className="text-[#616161]">ID de usuario</span>
            <span className="text-[#212121]">{user?.id ?? '—'}</span>
          </div>
          <div className="flex justify-between border-b border-[#E0E0E0] pb-2">
            <span className="text-[#616161]">Correo electrónico</span>
            <span className="text-[#212121]">{user?.email ?? '—'}</span>
          </div>
          <div className="flex justify-between border-b border-[#E0E0E0] pb-2">
            <span className="text-[#616161]">Rol</span>
            <span className="text-[#212121]">{ROLE_LABELS[role]}</span>
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <Button onClick={handleLogout} variant="error" fullWidth className="h-11">
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
