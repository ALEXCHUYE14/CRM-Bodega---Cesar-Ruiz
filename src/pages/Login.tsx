import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, LogIn, MessageCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'

const WA_SOPORTE =
  'https://wa.me/51924996961?text=Hola,%20tengo%20problemas%20para%20acceder%20al%20sistema%20de%20Bodeguita%20Juli.'

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
      {/* Logo superior izquierdo */}
      <div className="absolute left-5 top-5">
        <img
          src="/img/logo.jpeg"
          alt="Bodeguita Juli"
          className="h-12 w-auto rounded-xl object-contain shadow-sm ring-1 ring-ink-100 sm:h-14"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>

      <div className="w-full max-w-sm">
        {/* Marca */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center overflow-hidden rounded-2xl shadow-pop">
            <img
              src="/img/logo.jpeg"
              alt="Bodeguita Juli"
              className="h-full w-full object-cover"
              onError={(e) => {
                const el = e.target as HTMLImageElement
                el.style.display = 'none'
                // Fallback: icono genérico de tienda
                const parent = el.parentElement as HTMLElement
                parent.style.background = '#0e0e0d'
                parent.innerHTML =
                  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
              }}
            />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">
            Bodeguita Juli
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

        {/* Enlace de soporte WhatsApp */}
        <p className="mt-5 text-center text-xs text-ink-400">
          ¿Problemas para acceder?{' '}
          <a
            href={WA_SOPORTE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-accent-600 underline-offset-2 hover:text-accent-700 hover:underline"
          >
            <MessageCircle className="size-3.5" />
            Contactar soporte
          </a>
        </p>

        <p className="mt-3 text-center text-xs text-ink-300">
          Acceso exclusivo para personal autorizado
        </p>
      </div>
    </div>
  )
}
