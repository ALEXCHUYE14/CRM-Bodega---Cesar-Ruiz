import { useState } from 'react'
import {
  DollarSign,
  Lock,
  LockOpen,
  TrendingUp,
  Smartphone,
  HandCoins,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { useCajaCtx } from '@/context/CajaContext'
import { useCaja } from '@/hooks/useCaja'
import { useAuth } from '@/context/AuthContext'
import { Button, Card, Badge } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/components/ui/Toast'
import { money, fechaHora, horaCorta, cx } from '@/utils/format'
import type { ResumenCierre } from '@/hooks/useCaja'

export function Caja() {
  const { session, perfil } = useAuth()
  const { caja, cargando, abrir, cerrar, total } = useCajaCtx()
  // Para admin: también cargar historial global
  const { historial } = useCaja(session?.user?.id ?? null)
  const toast = useToast()

  const [abrirOpen, setAbrirOpen] = useState(false)
  const [cerrarOpen, setCerrarOpen] = useState(false)
  const [resumenOpen, setResumenOpen] = useState(false)
  const [montoInicial, setMontoInicial] = useState('')
  const [montoReal, setMontoReal] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [resumen, setResumen] = useState<ResumenCierre | null>(null)

  const RAPIDOS_INICIAL = [50, 100, 150, 200, 300, 500]

  async function confirmarApertura() {
    const monto = parseFloat(montoInicial) || 0
    if (monto < 0) {
      toast.error('El monto inicial no puede ser negativo.')
      return
    }
    setProcesando(true)
    try {
      await abrir(monto)
      toast.exito('Caja abierta correctamente')
      setAbrirOpen(false)
      setMontoInicial('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al abrir la caja')
    } finally {
      setProcesando(false)
    }
  }

  async function confirmarCierre() {
    const monto = parseFloat(montoReal)
    if (isNaN(monto) || monto < 0) {
      toast.error('Ingresa el monto real contado.')
      return
    }
    setProcesando(true)
    try {
      const r = await cerrar(monto)
      setResumen(r)
      setCerrarOpen(false)
      setResumenOpen(true)
      toast.exito('Caja cerrada. Revisa el resumen del arqueo.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cerrar la caja')
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-ink-400">
        Verificando estado de caja...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Control de caja</h1>
          <p className="text-sm text-ink-400">
            {perfil?.nombre} · {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {!caja ? (
          <Button variant="primary" onClick={() => setAbrirOpen(true)}>
            <LockOpen className="size-[18px]" /> Abrir caja
          </Button>
        ) : (
          <Button
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
            onClick={() => { setMontoReal(''); setCerrarOpen(true) }}
          >
            <Lock className="size-[18px]" /> Cerrar caja
          </Button>
        )}
      </div>

      {/* Estado actual de la caja */}
      {caja ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-ink-900 bg-ink-900 p-4 text-white">
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-accent-400" />
              </span>
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Caja abierta
              </span>
            </div>
            <p className="tabular font-display text-2xl font-bold">{money(total)}</p>
            <p className="mt-1 text-xs text-white/40">
              Desde {horaCorta(caja.abierta_en)} · inicial {money(caja.monto_inicial)}
            </p>
          </div>

          <KpiCaja
            icon={DollarSign}
            label="Efectivo"
            valor={money(caja.total_efectivo)}
            color="text-accent-700"
            bg="bg-accent-50"
          />
          <KpiCaja
            icon={Smartphone}
            label="Yape"
            valor={money(caja.total_yape)}
            color="text-blue-700"
            bg="bg-blue-50"
          />
          <KpiCaja
            icon={HandCoins}
            label="Fiado"
            valor={money(caja.total_fiado)}
            color="text-amber-700"
            bg="bg-amber-50"
          />
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-ink-200 p-10 text-center">
          <Lock className="mx-auto mb-3 size-8 text-ink-300" />
          <p className="text-base font-semibold text-ink-600">Caja cerrada</p>
          <p className="mt-1 text-sm text-ink-400">
            Abre la caja para comenzar a registrar ventas en el POS.
          </p>
          <Button className="mt-5" variant="primary" onClick={() => setAbrirOpen(true)}>
            <LockOpen className="size-4" /> Abrir caja ahora
          </Button>
        </div>
      )}

      {/* Historial de cajas */}
      {historial.length > 0 && (
        <Card className="overflow-hidden">
          <div className="border-b border-ink-100 px-4 py-3">
            <h3 className="font-display font-bold text-ink-900">Historial de cajas</h3>
          </div>
          <ul className="divide-y divide-ink-100">
            {historial.map((h) => (
              <li key={h.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cx(
                      'grid size-8 place-items-center rounded-lg',
                      h.estado === 'abierta' ? 'bg-accent-100' : 'bg-ink-100',
                    )}
                  >
                    {h.estado === 'abierta' ? (
                      <LockOpen className="size-4 text-accent-700" />
                    ) : (
                      <Lock className="size-4 text-ink-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {h.cajero_nombre ?? 'Cajero'}
                    </p>
                    <p className="text-xs text-ink-400">
                      {fechaHora(h.abierta_en)}
                      {h.cerrada_en && ` → ${horaCorta(h.cerrada_en)}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="tabular text-sm font-bold text-ink-900">
                    {money(h.monto_inicial + h.total_efectivo + h.total_yape)}
                  </p>
                  <div className="mt-0.5">
                    {h.estado === 'abierta' ? (
                      <Badge tone="success">Abierta</Badge>
                    ) : h.monto_real !== null ? (
                      <Badge tone={h.monto_real >= h.monto_inicial + h.total_efectivo ? 'success' : 'danger'}>
                        {h.monto_real >= h.monto_inicial + h.total_efectivo ? 'Cuadrado' : 'Descuadre'}
                      </Badge>
                    ) : (
                      <Badge tone="info">Cerrada</Badge>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Sheet: abrir caja */}
      <Sheet
        open={abrirOpen}
        onClose={() => setAbrirOpen(false)}
        title="Abrir caja"
        maxWidth="max-w-sm"
        footer={
          <Button variant="secondary" size="lg" className="w-full" loading={procesando} onClick={confirmarApertura}>
            <LockOpen className="size-5" /> Confirmar apertura
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-600">
            Ingresa el efectivo con el que inicias el turno (fondo de caja).
          </div>
          <label className="block">
            <span className="label mb-1.5 block">Monto inicial en caja (S/)</span>
            <input
              type="number"
              min={0}
              step={0.01}
              className="input tabular text-xl"
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
              placeholder="0.00"
              autoFocus
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMontoInicial('0')}
              className="rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-200"
            >
              Sin fondo (S/0)
            </button>
            {RAPIDOS_INICIAL.map((v) => (
              <button
                key={v}
                onClick={() => setMontoInicial(String(v))}
                className="rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-200"
              >
                S/ {v}
              </button>
            ))}
          </div>
        </div>
      </Sheet>

      {/* Sheet: cerrar caja */}
      <Sheet
        open={cerrarOpen}
        onClose={() => setCerrarOpen(false)}
        title="Cerrar caja"
        maxWidth="max-w-sm"
        footer={
          <Button
            variant="primary"
            size="lg"
            className="w-full !bg-red-600 hover:!bg-red-700"
            loading={procesando}
            onClick={confirmarCierre}
          >
            <Lock className="size-5" /> Cerrar y generar arqueo
          </Button>
        }
      >
        {caja && (
          <div className="space-y-4">
            <div className="rounded-xl bg-ink-50 p-4 text-sm space-y-1.5">
              <InfoRow k="Fondo inicial" v={money(caja.monto_inicial)} />
              <InfoRow k="Ventas efectivo" v={money(caja.total_efectivo)} />
              <div className="border-t border-ink-200 pt-1.5">
                <InfoRow
                  k="Efectivo esperado"
                  v={money(caja.monto_inicial + caja.total_efectivo)}
                  bold
                />
              </div>
              <InfoRow k="Ventas Yape" v={money(caja.total_yape)} />
              <InfoRow k="Ventas Fiado" v={money(caja.total_fiado)} />
            </div>
            <label className="block">
              <span className="label mb-1.5 block">¿Cuánto efectivo hay en caja? (S/)</span>
              <input
                type="number"
                min={0}
                step={0.01}
                className="input tabular text-xl"
                value={montoReal}
                onChange={(e) => setMontoReal(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </label>
            {montoReal !== '' && !isNaN(parseFloat(montoReal)) && (
              <DifCard
                esperado={caja.monto_inicial + caja.total_efectivo}
                real={parseFloat(montoReal)}
              />
            )}
          </div>
        )}
      </Sheet>

      {/* Sheet: resumen de arqueo */}
      <Sheet
        open={resumenOpen}
        onClose={() => setResumenOpen(false)}
        title="Resumen del arqueo"
        maxWidth="max-w-sm"
        footer={
          <Button variant="secondary" size="lg" className="w-full" onClick={() => setResumenOpen(false)}>
            <CheckCircle2 className="size-5" /> Listo
          </Button>
        }
      >
        {resumen && (
          <div className="space-y-4">
            <div className="rounded-xl bg-ink-50 p-4 text-sm space-y-1.5">
              <InfoRow k="Fondo inicial" v={money(resumen.monto_inicial)} />
              <InfoRow k="Ventas efectivo" v={money(resumen.total_efectivo)} />
              <div className="border-t border-ink-200 pt-1.5">
                <InfoRow k="Efectivo esperado" v={money(resumen.esperado_efectivo)} bold />
              </div>
              <InfoRow k="Efectivo contado" v={money(resumen.ingresado_real)} bold />
              <InfoRow k="Ventas Yape" v={money(resumen.total_yape)} />
              <InfoRow k="Ventas Fiado" v={money(resumen.total_fiado)} />
            </div>
            <DifCard esperado={resumen.esperado_efectivo} real={resumen.ingresado_real} />
            {resumen.diferencia !== 0 && (
              <p className="rounded-xl bg-amber-50 px-3.5 py-3 text-xs text-amber-700">
                <AlertTriangle className="mb-1 inline size-3.5" />{' '}
                {resumen.diferencia < 0
                  ? `Falta S/ ${Math.abs(resumen.diferencia).toFixed(2)} en la caja.`
                  : `Hay S/ ${resumen.diferencia.toFixed(2)} de sobra.`}
              </p>
            )}
          </div>
        )}
      </Sheet>
    </div>
  )
}

function KpiCaja({ icon: Icon, label, valor, color, bg }: {
  icon: typeof DollarSign; label: string; valor: string; color: string; bg: string
}) {
  return (
    <div className="card p-4">
      <div className={cx('mb-3 grid size-8 place-items-center rounded-lg', bg)}>
        <Icon className={cx('size-[18px]', color)} />
      </div>
      <p className={cx('tabular font-display text-xl font-bold', color)}>{valor}</p>
      <p className="text-xs font-medium text-ink-400">{label}</p>
    </div>
  )
}

function InfoRow({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? 'font-semibold text-ink-800' : 'text-ink-500'}>{k}</span>
      <span className={cx('tabular', bold ? 'font-bold text-ink-900' : 'text-ink-700')}>{v}</span>
    </div>
  )
}

function DifCard({ esperado, real }: { esperado: number; real: number }) {
  const diff = real - esperado
  const ok = Math.abs(diff) < 0.01
  return (
    <div className={cx(
      'flex items-center justify-between rounded-xl px-4 py-3',
      ok ? 'bg-accent-50' : diff < 0 ? 'bg-red-50' : 'bg-amber-50',
    )}>
      <span className={cx('text-sm font-semibold', ok ? 'text-accent-700' : diff < 0 ? 'text-red-700' : 'text-amber-700')}>
        {ok ? 'Cuadrado ✓' : diff < 0 ? 'Faltante' : 'Sobrante'}
      </span>
      <span className={cx('tabular font-display text-xl font-bold', ok ? 'text-accent-700' : diff < 0 ? 'text-red-700' : 'text-amber-700')}>
        {ok ? '—' : `${diff > 0 ? '+' : ''}${money(diff)}`}
      </span>
    </div>
  )
}

// Silenciar import no usado
void TrendingUp
