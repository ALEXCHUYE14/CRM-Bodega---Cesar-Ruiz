import { useEffect, useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import type { Categoria, Producto } from '@/types/database'

interface Props {
  open: boolean
  onClose: () => void
  producto: Producto | null // null = nuevo
  categorias: Categoria[]
  onGuardado: () => void
}

const vacio = {
  sku: '',
  nombre: '',
  categoria_id: '',
  precio_compra: '',
  precio_venta: '',
  stock_actual: '',
  stock_minimo: '5',
  unidad: 'unidad',
}

export function ProductForm({ open, onClose, producto, categorias, onGuardado }: Props) {
  const toast = useToast()
  const [f, setF] = useState(vacio)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (producto) {
      setF({
        sku: producto.sku,
        nombre: producto.nombre,
        categoria_id: producto.categoria_id ?? '',
        precio_compra: String(producto.precio_compra),
        precio_venta: String(producto.precio_venta),
        stock_actual: String(producto.stock_actual),
        stock_minimo: String(producto.stock_minimo),
        unidad: producto.unidad,
      })
    } else {
      setF(vacio)
    }
  }, [producto, open])

  function set<K extends keyof typeof vacio>(k: K, v: string) {
    setF((prev) => ({ ...prev, [k]: v }))
  }

  async function guardar() {
    if (!f.sku.trim() || !f.nombre.trim()) {
      toast.error('SKU y nombre son obligatorios.')
      return
    }
    setGuardando(true)
    const payload = {
      sku: f.sku.trim(),
      nombre: f.nombre.trim(),
      categoria_id: f.categoria_id || null,
      precio_compra: parseFloat(f.precio_compra) || 0,
      precio_venta: parseFloat(f.precio_venta) || 0,
      stock_minimo: parseInt(f.stock_minimo) || 0,
      unidad: f.unidad,
    }
    try {
      if (producto) {
        const { error } = await supabase.from('productos').update(payload).eq('id', producto.id)
        if (error) throw error
        toast.exito('Producto actualizado')
      } else {
        const { error } = await supabase
          .from('productos')
          .insert({ ...payload, stock_actual: parseInt(f.stock_actual) || 0 })
        if (error) throw error
        toast.exito('Producto creado')
      }
      onGuardado()
      onClose()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al guardar'
      toast.error(msg.includes('duplicate') ? 'Ese SKU ya existe.' : msg)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={producto ? 'Editar producto' : 'Nuevo producto'}
      maxWidth="max-w-lg"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="secondary" className="flex-1" loading={guardando} onClick={guardar}>
            Guardar
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Campo label="SKU / Codigo" className="col-span-2">
          <input
            className="input"
            value={f.sku}
            onChange={(e) => set('sku', e.target.value)}
            placeholder="7501055300464"
          />
        </Campo>
        <Campo label="Nombre" className="col-span-2">
          <input
            className="input"
            value={f.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Coca Cola 500ml"
          />
        </Campo>
        <Campo label="Categoria">
          <select
            className="input"
            value={f.categoria_id}
            onChange={(e) => set('categoria_id', e.target.value)}
          >
            <option value="">Sin categoria</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Unidad">
          <select className="input" value={f.unidad} onChange={(e) => set('unidad', e.target.value)}>
            {['unidad', 'kg', 'litro', 'paquete', 'caja', 'docena'].map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Precio compra (S/)">
          <input
            type="number"
            className="input tabular"
            value={f.precio_compra}
            onChange={(e) => set('precio_compra', e.target.value)}
            placeholder="0.00"
          />
        </Campo>
        <Campo label="Precio venta (S/)">
          <input
            type="number"
            className="input tabular"
            value={f.precio_venta}
            onChange={(e) => set('precio_venta', e.target.value)}
            placeholder="0.00"
          />
        </Campo>
        {!producto && (
          <Campo label="Stock inicial">
            <input
              type="number"
              className="input tabular"
              value={f.stock_actual}
              onChange={(e) => set('stock_actual', e.target.value)}
              placeholder="0"
            />
          </Campo>
        )}
        <Campo label="Stock minimo (alerta)" className={producto ? 'col-span-2' : ''}>
          <input
            type="number"
            className="input tabular"
            value={f.stock_minimo}
            onChange={(e) => set('stock_minimo', e.target.value)}
            placeholder="5"
          />
        </Campo>
      </div>
      {producto && (
        <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-400">
          El stock actual se modifica desde "Movimientos" (entradas / ajustes) para mantener el
          kardex. Stock actual: <b className="text-ink-700">{producto.stock_actual}</b>
        </p>
      )}
    </Sheet>
  )
}

function Campo({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={className}>
      <span className="label mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}
