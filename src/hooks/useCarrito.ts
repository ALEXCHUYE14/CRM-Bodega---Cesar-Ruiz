import { useMemo, useState, useCallback } from 'react'
import type { ItemCarrito, Producto } from '@/types/database'

const TASA_IGV = 0.18 // Peru

export function useCarrito() {
  const [items, setItems] = useState<ItemCarrito[]>([])
  const [descuento, setDescuento] = useState(0)

  const agregar = useCallback((producto: Producto, cantidad = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.producto.id === producto.id)
      if (idx >= 0) {
        const copia = [...prev]
        const nuevaCant = Math.min(
          copia[idx].cantidad + cantidad,
          producto.stock_actual,
        )
        copia[idx] = { ...copia[idx], cantidad: nuevaCant }
        return copia
      }
      if (producto.stock_actual <= 0) return prev
      return [...prev, { producto, cantidad: Math.min(cantidad, producto.stock_actual) }]
    })
  }, [])

  const cambiarCantidad = useCallback((productoId: string, cantidad: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.producto.id === productoId
            ? {
                ...i,
                cantidad: Math.max(
                  0,
                  Math.min(cantidad, i.producto.stock_actual),
                ),
              }
            : i,
        )
        .filter((i) => i.cantidad > 0),
    )
  }, [])

  const quitar = useCallback((productoId: string) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== productoId))
  }, [])

  const limpiar = useCallback(() => {
    setItems([])
    setDescuento(0)
  }, [])

  const totales = useMemo(() => {
    const subtotal = items.reduce(
      (s, i) => s + i.producto.precio_venta * i.cantidad,
      0,
    )
    const desc = Math.min(descuento, subtotal)
    const total = Math.max(subtotal - desc, 0)
    const base = total / (1 + TASA_IGV)
    const igv = total - base
    const unidades = items.reduce((s, i) => s + i.cantidad, 0)
    return {
      subtotal: round(subtotal),
      descuento: round(desc),
      igv: round(igv),
      total: round(total),
      unidades,
    }
  }, [items, descuento])

  return {
    items,
    descuento,
    setDescuento,
    agregar,
    cambiarCantidad,
    quitar,
    limpiar,
    totales,
    vacio: items.length === 0,
  }
}

function round(n: number) {
  return Math.round(n * 100) / 100
}
