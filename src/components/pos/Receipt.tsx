import { Printer, Check } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { money, fechaHora, ETIQUETA_PAGO } from '@/utils/format'
import type { ItemCarrito, Venta } from '@/types/database'

interface Props {
  open: boolean
  onClose: () => void
  venta: Venta | null
  items: ItemCarrito[]
}

export function Receipt({ open, onClose, venta, items }: Props) {
  if (!venta) return null

  function imprimir() {
    window.print()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      maxWidth="max-w-sm"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={imprimir}>
            <Printer className="size-4" /> Imprimir
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Nueva venta
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-col items-center text-center">
        <div className="mb-2 grid size-12 place-items-center rounded-full bg-accent-100">
          <Check className="size-6 text-accent-700" />
        </div>
        <p className="font-display text-lg font-bold text-ink-900">Venta registrada</p>
        <p className="text-sm text-ink-400">Comprobante #{venta.numero}</p>
      </div>

      {/* Ticket */}
      <div id="ticket-imprimible" className="rounded-xl border border-dashed border-ink-200 p-4 font-sans text-sm">
        <div className="mb-3 text-center">
          <p className="font-display text-base font-bold">BODEGA CESAR RUIZ</p>
          <p className="text-xs text-ink-400">{fechaHora(venta.creado_en)}</p>
          <p className="text-xs text-ink-400">Cajero: {venta.cajero_nombre ?? '-'}</p>
        </div>
        <div className="space-y-1 border-y border-ink-100 py-2.5">
          {items.map((i) => (
            <div key={i.producto.id} className="flex justify-between gap-2">
              <span className="min-w-0 truncate text-ink-700">
                {i.cantidad}x {i.producto.nombre}
              </span>
              <span className="tabular shrink-0 text-ink-900">
                {money(i.producto.precio_venta * i.cantidad)}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-1 pt-2.5 text-ink-600">
          <Row k="Subtotal" v={money(venta.subtotal)} />
          {venta.descuento > 0 && <Row k="Descuento" v={'- ' + money(venta.descuento)} />}
          <Row k="IGV (18%)" v={money(venta.igv)} />
          <div className="flex justify-between border-t border-ink-200 pt-1.5 font-display text-base font-bold text-ink-900">
            <span>TOTAL</span>
            <span className="tabular">{money(venta.total)}</span>
          </div>
          <Row k={ETIQUETA_PAGO[venta.metodo]} v={money(venta.pago_recibido)} />
          {venta.vuelto > 0 && <Row k="Vuelto" v={money(venta.vuelto)} />}
        </div>
        <p className="mt-3 text-center text-xs text-ink-400">¡Gracias por su compra!</p>
      </div>
    </Sheet>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span>{k}</span>
      <span className="tabular">{v}</span>
    </div>
  )
}
