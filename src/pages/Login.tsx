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
    <div className="min-h-dvh lg:grid lg:grid-cols-2">

      {/* ══════════════════════════════════════════
          COLUMNA IZQUIERDA — Branding (solo desktop)
          ══════════════════════════════════════════ */}
      <div
        className="relative hidden lg:flex lg:flex-col lg:items-center lg:justify-end lg:overflow-hidden lg:pb-16"
        style={{
          backgroundImage: 'url(/img/logo.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradiente inferior para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/30 to-transparent" />

        {/* Texto de marca sobre la imagen */}
        <div className="relative z-10 px-10 text-center text-white">
          <h2 className="font-display text-4xl font-black tracking-tight drop-shadow-lg">
            Bodeguita Juli
          </h2>
          <p className="mt-2 text-base text-white/70">
            Sistema de Gestión y Punto de Venta
          </p>
          <div className="mx-auto mt-6 h-px w-16 bg-white/30" />
          <p className="mt-4 text-sm text-white/50 italic">
            "Cada venta cuenta, cada cliente importa."
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          COLUMNA DERECHA — Formulario de acceso
          ══════════════════════════════════════════ */}
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 py-12 lg:min-h-screen lg:px-12">
        <div className="w-full max-w-sm">

          {/* Encabezado de la sección de formulario */}
          <div className="mb-8">
            {/* Logo pequeño — solo móvil */}
            <div className="mb-5 flex justify-center lg:hidden">
              <div className="size-16 overflow-hidden rounded-2xl shadow-md ring-1 ring-ink-100">
                <img
                  src="/img/logo.jpeg"
                  alt="Bodeguita Juli"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement
                    el.style.display = 'none'
                    el.parentElement!.style.background = '#0e0e0d'
                  }}
                />
              </div>
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 lg:text-3xl">
              Bodeguita Juli
            </h1>
            <p className="mt-1.5 text-sm text-ink-400">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label mb-1.5 block">Correo electrónico</label>
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
              <label className="label mb-1.5 block">Contraseña</label>
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
                  aria-label={verPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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

            <Button
              type="submit"
              size="lg"
              loading={cargando}
              className="w-full"
            >
              <LogIn className="size-4" />
              Ingresar al sistema
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-ink-100" />
            <span className="text-xs text-ink-300">acceso autorizado</span>
            <div className="h-px flex-1 bg-ink-100" />
          </div>

          {/* Enlace de soporte WhatsApp */}
          <div className="text-center">
            <p className="text-xs text-ink-400">
              ¿Problemas para acceder?
            </p>
            <a
              href={WA_SOPORTE}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 transition-colors hover:bg-green-100"
            >
              <MessageCircle className="size-3.5" />
              Contactar soporte por WhatsApp
            </a>
          </div>

          <p className="mt-6 text-center text-[0.7rem] text-ink-300">
            Acceso exclusivo para personal autorizado · Bodeguita Juli
          </p>
        </div>
      </div>
    </div>
  )
}
