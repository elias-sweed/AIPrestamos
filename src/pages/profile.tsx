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
      <h2 className="text-lg font-bold text-[#E0E0E0] mb-6">Perfil</h2>

      <Card className="mb-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#1565C0] to-[#00F2FF] flex items-center justify-center text-white text-4xl mb-4 shadow-[0_0_30px_rgba(0,242,255,0.4)]">
            {user?.email?.split('@')[0][0].toUpperCase() ?? '?'}
          </div>
          <div className="text-xl font-bold text-[#E0E0E0]">{user?.email ?? 'Sin correo'}</div>
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
            role === 'encargado_aip' ? 'bg-[#1565C0]/20 text-[#64B5F6] border-[#64B5F6]/30' : 'bg-[#2E7D32]/20 text-[#81C784] border-[#81C784]/30'
          }`}>
            {ROLE_LABELS[role]}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#E0E0E0]">Información de la cuenta</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#90CAF9]">ID de usuario</span>
            <span className="text-[#E0E0E0]">{user?.id ?? '—'}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#90CAF9]">Correo electrónico</span>
            <span className="text-[#E0E0E0]">{user?.email ?? '—'}</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#90CAF9]">Rol</span>
            <span className="text-[#E0E0E0]">{ROLE_LABELS[role]}</span>
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
