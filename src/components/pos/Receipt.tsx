import { Printer, Check } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { money, fechaHora } from '@/utils/format'
import type { ItemCarrito, Venta } from '@/types/database'

const ETIQUETA: Record<string, string> = {
  efectivo: 'Efectivo',
  yape: 'Yape',
  fiado: 'Fiado',
}

interface Props {
  open: boolean
  onClose: () => void
  venta: Venta
  items: ItemCarrito[]
}

export function Receipt({ open, onClose, venta, items }: Props) {
  function imprimir() {
    const lineas = items
      .map((i) => {
        const desc = `${i.cantidad}x ${i.producto.nombre}`.substring(0, 28)
        const precio = money(i.producto.precio_venta * i.cantidad)
        return `<div class="row"><span>${desc}</span><span>${precio}</span></div>`
      })
      .join('')

    const descuento =
      venta.descuento > 0
        ? `<div class="row"><span>Descuento</span><span>- ${money(venta.descuento)}</span></div>`
        : ''

    const vueltoLine =
      venta.metodo === 'efectivo' && venta.vuelto > 0
        ? `<div class="row"><span>Vuelto</span><span>${money(venta.vuelto)}</span></div>`
        : ''

    const clienteLine =
      venta.cliente_nombre
        ? `<div class="row"><span>Cliente</span><span>${venta.cliente_nombre}</span></div>`
        : ''

    const contenido = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Ticket #${venta.numero}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 9pt;
    width: 80mm;
    padding: 4mm 3mm;
    color: #000;
    background: #fff;
  }
  .center { text-align: center; }
  .bold { font-weight: bold; }
  .big { font-size: 11pt; }
  .row {
    display: flex;
    justify-content: space-between;
    line-height: 1.5;
    gap: 4px;
  }
  .row span:first-child { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  .row span:last-child { flex-shrink: 0; text-align: right; }
  hr { border: none; border-top: 1px dashed #000; margin: 3mm 0; }
  .total-row { font-size: 11pt; font-weight: bold; }
  @page { size: 80mm auto; margin: 0; }
</style>
</head>
<body>
  <div class="center bold" style="font-size:12pt;">BODEGA CESAR RUIZ</div>
  <div class="center" style="margin-top:2mm;">Ticket #${venta.numero}</div>
  <div class="center">${fechaHora(venta.creado_en)}</div>
  <div class="center">Cajero: ${venta.cajero_nombre ?? '-'}</div>
  <hr/>
  ${lineas}
  <hr/>
  <div class="row"><span>Subtotal</span><span>${money(venta.subtotal + venta.descuento)}</span></div>
  ${descuento}
  <div class="row"><span>IGV (18%)</span><span>${money(venta.igv)}</span></div>
  <hr/>
  <div class="row total-row"><span>TOTAL</span><span>${money(venta.total)}</span></div>
  <hr/>
  <div class="row"><span>${ETIQUETA[venta.metodo] ?? venta.metodo}</span><span>${money(venta.pago_recibido)}</span></div>
  ${vueltoLine}
  ${clienteLine}
  <hr/>
  <div class="center" style="margin-top:2mm;">¡Gracias por su compra!</div>
</body>
</html>`

    const w = window.open('', '_blank', 'width=360,height=640,menubar=no,toolbar=no')
    if (!w) {
      // Fallback: intentar @media print directo
      window.print()
      return
    }
    w.document.write(contenido)
    w.document.close()
    w.focus()
    // Dar tiempo al navegador para renderizar antes de imprimir
    setTimeout(() => {
      w.print()
      w.close()
    }, 250)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      maxWidth="max-w-sm"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={imprimir}>
            <Printer className="size-4" /> Imprimir ticket
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Nueva venta
          </Button>
        </div>
      }
    >
      {/* Confirmación visual */}
      <div className="mb-4 flex flex-col items-center text-center">
        <div className="mb-2 grid size-12 place-items-center rounded-full bg-accent-100">
          <Check className="size-6 text-accent-700" />
        </div>
        <p className="font-display text-lg font-bold text-ink-900">Venta registrada</p>
        <p className="text-sm text-ink-400">Comprobante #{venta.numero}</p>
      </div>

      {/* Vista previa del ticket en pantalla */}
      <div className="rounded-xl border border-dashed border-ink-200 bg-white p-4 font-mono text-[0.78rem]">
        <div className="mb-2 text-center">
          <p className="font-bold text-sm">BODEGA CESAR RUIZ</p>
          <p className="text-ink-400">{fechaHora(venta.creado_en)}</p>
          <p className="text-ink-400">Cajero: {venta.cajero_nombre ?? '-'}</p>
        </div>
        <hr className="my-2 border-dashed border-ink-300" />
        <div className="space-y-0.5">
          {items.map((i) => (
            <div key={i.producto.id} className="flex justify-between gap-2">
              <span className="min-w-0 truncate text-ink-700">
                {i.cantidad}x {i.producto.nombre}
              </span>
              <span className="tabular shrink-0">{money(i.producto.precio_venta * i.cantidad)}</span>
            </div>
          ))}
        </div>
        <hr className="my-2 border-dashed border-ink-300" />
        <div className="space-y-0.5 text-ink-600">
          {venta.descuento > 0 && (
            <Row k="Descuento" v={'- ' + money(venta.descuento)} />
          )}
          <Row k="IGV (18%)" v={money(venta.igv)} />
          <div className="flex justify-between border-t border-ink-300 pt-1 font-bold text-ink-900 text-sm">
            <span>TOTAL</span>
            <span className="tabular">{money(venta.total)}</span>
          </div>
          <Row k={ETIQUETA[venta.metodo] ?? venta.metodo} v={money(venta.pago_recibido)} />
          {venta.metodo === 'efectivo' && venta.vuelto > 0 && (
            <Row k="Vuelto" v={money(venta.vuelto)} />
          )}
          {venta.cliente_nombre && (
            <Row k="Fiado a" v={venta.cliente_nombre} />
          )}
        </div>
        <hr className="my-2 border-dashed border-ink-300" />
        <p className="text-center text-ink-400">¡Gracias por su compra!</p>
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
