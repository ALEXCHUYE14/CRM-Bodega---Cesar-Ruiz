import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, LogIn, MessageCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { BRAND } from '@/config/brand'

const WA_SOPORTE = `https://wa.me/${BRAND.whatsappSoporte}?text=Hola,%20tengo%20problemas%20para%20acceder%20al%20sistema%20de%20${encodeURIComponent(BRAND.nombre)}.`

/* ─────────────────────────────────────────────────────────────────────────────
   Los estilos de la columna izquierda se definen aquí fuera del componente
   para que React no los recree en cada render y para garantizar que el
   background-image CSS se aplique con las propiedades exactas requeridas.
───────────────────────────────────────────────────────────────────────────── */
const leftColStyle: React.CSSProperties = {
  backgroundImage: "url('img/logo.jpeg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',
  position: 'relative',
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'linear-gradient(to top, rgba(14,14,13,0.88) 0%, rgba(14,14,13,0.25) 45%, rgba(14,14,13,0.06) 100%)',
}

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
    /*
     * Layout de dos columnas — Desktop: flex row (50/50)
     *                        — Móvil:   flex column (solo columna derecha visible)
     * Usamos flexbox en lugar de CSS Grid para que cada columna controle
     * su propio min-height sin depender del "stretch" del grid.
     */
    <div
      style={{
        display: 'flex',
        minHeight: '100dvh',
        flexDirection: 'row',
      }}
    >
      {/* ════════════════════════════════════════════════════════════════
          COLUMNA IZQUIERDA — Imagen de fondo de la tienda (solo Desktop)
          Oculta en móvil con media query.
          ════════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        className="login-left-col"
        style={leftColStyle}
      >
        {/* Gradiente overlay */}
        <div style={overlayStyle} />

        {/* Texto de marca posicionado sobre el overlay */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            color: '#ffffff',
            paddingBottom: '60px',
            paddingLeft: '40px',
            paddingRight: '40px',
          }}
        >
          <h2
            style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontSize: '2.4rem',
              fontWeight: 900,
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
              margin: 0,
            }}
          >
            {BRAND.nombre}
          </h2>
          <p
            style={{
              marginTop: '10px',
              fontSize: '1rem',
              opacity: 0.7,
              fontWeight: 500,
            }}
          >
            Sistema de Gestión y Punto de Venta
          </p>
          <div
            style={{
              width: '48px',
              height: '1px',
              background: 'rgba(255,255,255,0.3)',
              margin: '20px auto',
            }}
          />
          <p style={{ fontSize: '0.85rem', opacity: 0.5, fontStyle: 'italic' }}>
            "Cada venta cuenta, cada cliente importa."
          </p>
        </div>
      </div>

      {/* Media query para ocultar la columna izquierda en móvil */}
      <style>{`
        .login-left-col {
          display: none;
        }
        @media (min-width: 1024px) {
          .login-left-col {
            display: flex;
            flex: 1;
            flex-shrink: 0;
            max-width: 50%;
          }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════════════
          COLUMNA DERECHA — Formulario de login
          Ocupa 100% en móvil, 50% en desktop.
          ════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          backgroundColor: '#ffffff',
          padding: '3rem 1.5rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* Logo pequeño — solo visible en móvil */}
          <div className="mb-6 flex justify-center lg:hidden">
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                border: '1px solid #e5e5e4',
              }}
            >
              <img
                src="img/logo.jpeg"
                alt={BRAND.nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  const el = e.target as HTMLImageElement
                  el.parentElement!.style.background = '#0e0e0d'
                  el.style.display = 'none'
                }}
              />
            </div>
          </div>

          {/* Encabezado del formulario */}
          <div className="mb-8">
            <h1
              style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.3px',
                color: '#0e0e0d',
                margin: '0 0 6px 0',
              }}
            >
              {BRAND.nombre}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#888', margin: 0 }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Formulario de acceso */}
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

            <Button type="submit" size="lg" loading={cargando} className="w-full">
              <LogIn className="size-4" />
              Ingresar al sistema
            </Button>
          </form>

          {/* Separador */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-ink-100" />
            <span className="text-[0.7rem] font-medium text-ink-300 uppercase tracking-wide">
              acceso autorizado
            </span>
            <div className="h-px flex-1 bg-ink-100" />
          </div>

          {/* Enlace de soporte WhatsApp */}
          <div style={{ textAlign: 'center' }}>
            <p className="mb-2 text-xs text-ink-400">¿Problemas para acceder?</p>
            <a
              href={WA_SOPORTE}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: '10px',
                border: '1px solid #bbf7d0',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#dcfce7'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#f0fdf4'
              }}
            >
              <MessageCircle size={14} />
              Contactar soporte por WhatsApp
            </a>
          </div>

          <p
            style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '0.7rem',
              color: '#bbb',
            }}
          >
            Acceso exclusivo para personal autorizado · {BRAND.nombre}
          </p>
        </div>
      </div>
    </div>
  )
}
