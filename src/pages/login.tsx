import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { authStore } from '../providers/authStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import logo from '../assets/logo.png'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [obscure, setObscure] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Ingresa tu correo')
      return
    }
    if (!password) {
      setError('Ingresa tu contraseña')
      return
    }
    const { error: err } = await authStore.login(email.trim(), password)
    if (err) {
      setError(err)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="login-page w-full h-screen flex items-center justify-center bg-black overflow-hidden relative">
      {/* Aura / glow de fondo */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="w-150 h-150 bg-[#1565C0]/20 rounded-full blur-[120px] absolute -top-37.5 -left-37.5 mix-blend-screen animate-pulse"
        ></div>
        <div
          className="w-125 h-125 bg-[#7B2CBF]/15 rounded-full blur-[100px] absolute -bottom-25 -right-25 mix-blend-screen animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="w-100 h-100 bg-[#00F2FF]/10 rounded-full blur-[80px] absolute top-[20%] left-[60%] mix-blend-screen animate-pulse"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      {/* Grid cristalizado sutil */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Tarjeta de login con glassmorphism y borde neón */}
      <div className="relative z-10 w-full max-w-md p-6">
        <CardLogin>
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(21,101,192,0.4)] logo-container animate-logo-float">
              <img
                src={logo}
                alt="AIP Gest"
                className="w-12 h-12 object-contain logo-img animate-logo-spin"
              />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">AIP Gest</h2>
            <p className="text-[#00F2FF]/70 text-sm mt-2">Control de Préstamos</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@institucion.edu"
              icon="✉"
              error={error ?? undefined}
              className="text-[#00F2FF]"
            />
            <div className="relative">
              <input
                type={obscure ? 'password' : 'text'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full rounded border border-[#00F2FF]/50 bg-black/40 px-4 py-3 text-[#00F2FF] focus:outline-none focus:ring-2 focus:ring-[#00F2FF] focus:border-[#00F2FF] transition-all placeholder-[#00F2FF]/60"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => setObscure(!obscure)}
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label={obscure ? 'Mostrar contraseña' : 'Ocultar contraseña'}
                >
                  {obscure ? '👁️‍🗨️' : '🙈'}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded border border-[#C62828]/50 bg-[#C62828]/10 p-3 text-[#FFBABA] text-sm shadow-[0_0_15px_rgba(198,40,40,0.3)]">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth loading={authStore.value.isLoading}>
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#00F2FF]/60 text-xs">
              AIP Gest &copy; {new Date().getFullYear()}
            </p>
          </div>
        </CardLogin>
      </div>
    </div>
  )
}

const CardLogin = ({ children }: { children: React.ReactNode }) => (
  <div
    className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,242,255,0.15)] relative overflow-hidden"
  >
    {/* Borde neón animado */}
    <div className="absolute inset-0 rounded-3xl border border-transparent p-px mask-[linear-gradient(0deg,#000,#000,white)] mask-composite-exclude" />
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent p-0.5 mask-[linear-gradient(0deg,#000,#000,white)] mask-composite-exclude" />
    <div className="absolute inset-0 rounded-3xl border-4 border-[#1565C0]/40 p-0.75 mask-[linear-gradient(0deg,#000,#000,white)] mask-composite-exclude" />
    <div className="absolute inset-0 rounded-3xl border-2 border-[#00F2FF]/30 p-0.5 mask-[linear-gradient(0deg,#000,#000,white)] mask-composite-exclude" />
    {children}
  </div>
)
