import { useMemo, useState } from 'react'
import { Banknote, CreditCard, Smartphone, Check } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { money, cx } from '@/utils/format'
import type { MetodoPago } from '@/types/database'

interface Props {
  open: boolean
  onClose: () => void
  total: number
  procesando: boolean
  onConfirmar: (metodo: MetodoPago, pagoRecibido: number) => void
}

const METODOS: { id: MetodoPago; label: string; icon: typeof Banknote }[] = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote },
  { id: 'yape', label: 'Yape', icon: Smartphone },
  { id: 'plin', label: 'Plin', icon: Smartphone },
  { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
]

const RAPIDOS = [10, 20, 50, 100, 200]

export function PaymentModal({ open, onClose, total, procesando, onConfirmar }: Props) {
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [recibido, setRecibido] = useState('')

  const pago = parseFloat(recibido) || 0
  const esEfectivo = metodo === 'efectivo'
  const vuelto = useMemo(() => Math.max(pago - total, 0), [pago, total])
  const suficiente = !esEfectivo || pago >= total

  function confirmar() {
    const pagoFinal = esEfectivo ? pago : total
    onConfirmar(metodo, pagoFinal)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Cobrar venta"
      maxWidth="max-w-md"
      footer={
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={!suficiente}
          loading={procesando}
          onClick={confirmar}
        >
          <Check className="size-5" />
          Confirmar cobro · {money(total)}
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl bg-ink-900 px-5 py-4 text-white">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">
            Total a cobrar
          </p>
          <p className="tabular font-display text-3xl font-bold">{money(total)}</p>
        </div>

        <div>
          <p className="label mb-2">Metodo de pago</p>
          <div className="grid grid-cols-2 gap-2">
            {METODOS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMetodo(id)}
                className={cx(
                  'flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-semibold transition focusable',
                  metodo === id
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-ink-200 text-ink-600 hover:border-ink-300',
                )}
              >
                <Icon className="size-[18px]" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {esEfectivo && (
          <div className="space-y-3 animate-fade-up">
            <div>
              <p className="label mb-2">Con cuanto paga</p>
              <input
                type="number"
                inputMode="decimal"
                autoFocus
                value={recibido}
                onChange={(e) => setRecibido(e.target.value)}
                placeholder="0.00"
                className="input tabular text-lg"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setRecibido(total.toFixed(2))}
                className="rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-200"
              >
                Exacto
              </button>
              {RAPIDOS.filter((m) => m >= total).map((m) => (
                <button
                  key={m}
                  onClick={() => setRecibido(String(m))}
                  className="rounded-lg bg-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-200"
                >
                  S/ {m}
                </button>
              ))}
            </div>
            {pago > 0 && (
              <div
                className={cx(
                  'flex items-center justify-between rounded-xl px-4 py-3',
                  suficiente ? 'bg-accent-50' : 'bg-red-50',
                )}
              >
                <span className="text-sm font-medium text-ink-600">Vuelto</span>
                <span
                  className={cx(
                    'tabular font-display text-xl font-bold',
                    suficiente ? 'text-accent-700' : 'text-red-600',
                  )}
                >
                  {suficiente ? money(vuelto) : 'Falta ' + money(total - pago)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Sheet>
  )
}
