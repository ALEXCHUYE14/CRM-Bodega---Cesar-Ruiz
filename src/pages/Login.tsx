import { useState, type FormEvent } from 'react'
import { ScanLine, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'

export function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPass, setVerPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const { error } = await signIn(email.trim(), password)
    setCargando(false)
    if (error) setError(error)
  }

  return (
    <div className="relative grid min-h-dvh place-items-center bg-ink-50 bg-grain px-5 py-10">
      <div className="w-full max-w-sm">
        {/* Marca */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-ink-900 shadow-pop">
            <ScanLine className="size-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            Bodega Cesar Ruiz
          </h1>
          <p className="mt-1 text-sm text-ink-400">Sistema de gestion y punto de venta</p>
        </div>

        {/* Tarjeta de acceso */}
        <div className="card p-6 sm:p-7">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label mb-1.5 block">Correo</label>
              <input
                type="email"
                className="input"
                placeholder="tucorreo@ejemplo.com"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label mb-1.5 block">Contrasena</label>
              <div className="relative">
                <input
                  type={verPass ? 'text' : 'password'}
                  className="input pr-11"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setVerPass((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
                  aria-label={verPass ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {verPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 animate-fade-up">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" loading={cargando} className="w-full">
              <LogIn className="size-4" /> Ingresar
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-300">
          Acceso exclusivo para personal autorizado
        </p>
      </div>
    </div>
  )
}
