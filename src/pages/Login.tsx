import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, LogIn, MessageCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { BRAND } from '@/config/brand'

const WA_SOPORTE = `https://wa.me/${BRAND.whatsappSoporte}?text=Hola,%20tengo%20problemas%20para%20acceder%20al%20sistema%20de%20${encodeURIComponent(BRAND.nombre)}.`

/* ─────────────────────────────────────────────────────────────────────────────
   Columna izquierda — imagen de fondo (solo desktop).
   Definida fuera del componente para que React no la recree en cada render.
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
     * Layout Mobile-First:
     *   — Móvil (<1024px): columna izquierda oculta, formulario a 100% ancho/alto
     *   — Desktop (≥1024px): pantalla dividida 50/50
     */
    <div style={{ display: 'flex', minHeight: '100dvh', flexDirection: 'row' }}>

      {/* ════════════ COLUMNA IZQUIERDA — imagen (solo desktop) ════════════ */}
      <div aria-hidden="true" className="login-left-col" style={leftColStyle}>
        <div style={overlayStyle} />
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          color: '#ffffff',
          paddingBottom: '60px',
          paddingLeft: '40px',
          paddingRight: '40px',
        }}>
          <h2 style={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontSize: '2.4rem',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
            textShadow: '0 2px 12px rgba(0,0,0,0.4)',
            margin: 0,
          }}>
            {BRAND.nombre}
          </h2>
          <p style={{ marginTop: '10px', fontSize: '1rem', opacity: 0.7, fontWeight: 500 }}>
            Sistema de Gestión y Punto de Venta
          </p>
          <div style={{ width: '48px', height: '1px', background: 'rgba(255,255,255,0.3)', margin: '20px auto' }} />
          <p style={{ fontSize: '0.85rem', opacity: 0.5, fontStyle: 'italic' }}>
            "Cada venta cuenta, cada cliente importa."
          </p>
        </div>
      </div>

      {/*
       * Media query estricta:
       *   max-width: 768px  → columna izquierda display:none (no consume espacio)
       *   min-width: 1024px → columna izquierda display:flex, ocupa 50%
       */}
      <style>{`
        .login-left-col { display: none !important; }
        @media (min-width: 1024px) {
          .login-left-col {
            display: flex !important;
            flex: 1;
            flex-shrink: 0;
            max-width: 50%;
          }
        }
        /* Prevenir zoom automático en iOS Safari al enfocar inputs */
        @media (max-width: 768px) {
          .login-input { font-size: 16px !important; }
        }
      `}</style>

      {/* ════════════ COLUMNA DERECHA — formulario (siempre visible) ════════════
          Estructura en dos zonas:
            1. Zona de formulario (flex-1, scroll si la pantalla es muy pequeña)
            2. Zona de soporte WhatsApp (fija al fondo, siempre visible)
      ════════════════════════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        backgroundColor: '#ffffff',
        overflowY: 'auto',
      }}>

        {/* ── Zona 1: formulario ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem 1rem',
        }}>
          <div style={{ width: '100%', maxWidth: '360px' }}>

            {/* Encabezado de marca */}
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{
                fontFamily: '"Bricolage Grotesque", sans-serif',
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.3px',
                color: '#0e0e0d',
                margin: '0 0 6px 0',
              }}>
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
                  className="input login-input"
                  style={{ fontSize: '16px' }}
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
                    className="input pr-11 login-input"
                    style={{ fontSize: '16px' }}
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
          </div>
        </div>

        {/* ── Zona 2: soporte WhatsApp — siempre visible al fondo ── */}
        <div style={{
          borderTop: '1px solid #f0f0ef',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          backgroundColor: '#ffffff',
        }}>
          <p style={{ margin: '0 0 10px', fontSize: '0.75rem', color: '#aaa' }}>
            ¿Problemas para acceder?
          </p>
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
          <p style={{ marginTop: '12px', fontSize: '0.7rem', color: '#bbb' }}>
            Acceso exclusivo para personal autorizado · {BRAND.nombre}
          </p>
        </div>
      </div>
    </div>
  )
}
