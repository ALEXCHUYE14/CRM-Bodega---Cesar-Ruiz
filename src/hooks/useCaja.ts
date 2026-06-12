import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CajaRegistro } from '@/types/database'

export interface ResumenCierre {
  monto_inicial: number
  total_efectivo: number
  total_yape: number
  total_fiado: number
  esperado_efectivo: number
  ingresado_real: number
  diferencia: number
}

// Clave de localStorage para persistir el ID de caja activa entre recargas
const CAJA_KEY = 'bodeguita_caja_activa_id'

export function useCaja(cajeroId: string | null) {
  const [caja, setCaja] = useState<CajaRegistro | null>(null)
  const [historial, setHistorial] = useState<CajaRegistro[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    if (!cajeroId) {
      setCargando(false)
      return
    }
    setCargando(true)
    try {
      // Sin restricción de fecha: busca cualquier caja abierta del cajero
      // (el filtro por fecha anterior causaba pérdida de estado al recargar
      //  cuando había diferencia entre zona horaria local y UTC)
      const { data: cajaAbierta } = await supabase
        .from('cajas')
        .select('*')
        .eq('cajero_id', cajeroId)
        .eq('estado', 'abierta')
        .order('abierta_en', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cajaAbierta) {
        // Sincroniza localStorage para resiliencia ante recargas
        localStorage.setItem(CAJA_KEY, cajaAbierta.id)
        setCaja(cajaAbierta)
        setCargando(false)
        return
      }

      // Fallback: intenta restaurar desde localStorage si la consulta principal no encontró nada
      const storedId = localStorage.getItem(CAJA_KEY)
      if (storedId) {
        const { data: cajaPorId } = await supabase
          .from('cajas')
          .select('*')
          .eq('id', storedId)
          .eq('cajero_id', cajeroId)
          .eq('estado', 'abierta')
          .maybeSingle()

        if (cajaPorId) {
          setCaja(cajaPorId)
        } else {
          // El ID guardado ya no corresponde a una caja abierta
          localStorage.removeItem(CAJA_KEY)
          setCaja(null)
        }
      } else {
        setCaja(null)
      }
    } catch {
      setCaja(null)
    } finally {
      setCargando(false)
    }
  }, [cajeroId])

  const cargarHistorial = useCallback(async () => {
    if (!cajeroId) return
    const { data } = await supabase
      .from('cajas')
      .select('*')
      .eq('cajero_id', cajeroId)
      .order('abierta_en', { ascending: false })
      .limit(30)
    setHistorial(data ?? [])
  }, [cajeroId])

  useEffect(() => {
    cargar()
    cargarHistorial()
  }, [cargar, cargarHistorial])

  async function abrir(montoInicial: number, cajeroNombre: string): Promise<CajaRegistro> {
    const { data, error } = await supabase
      .from('cajas')
      .insert({
        cajero_id: cajeroId,
        cajero_nombre: cajeroNombre,
        monto_inicial: montoInicial,
        total_efectivo: 0,
        total_yape: 0,
        total_fiado: 0,
        estado: 'abierta',
      })
      .select()
      .single()
    if (error) throw error
    // Persiste inmediatamente en localStorage para sobrevivir recargas
    localStorage.setItem(CAJA_KEY, data.id)
    setCaja(data)
    setHistorial((prev) => [data, ...prev])
    return data
  }

  async function cerrar(montoReal: number): Promise<ResumenCierre> {
    if (!caja) throw new Error('No hay caja abierta')
    const esperado = caja.monto_inicial + caja.total_efectivo
    const diferencia = montoReal - esperado
    const { data, error } = await supabase
      .from('cajas')
      .update({
        estado: 'cerrada',
        cerrada_en: new Date().toISOString(),
        monto_real: montoReal,
      })
      .eq('id', caja.id)
      .select()
      .single()
    if (error) throw error
    // Limpia localStorage al cerrar
    localStorage.removeItem(CAJA_KEY)
    setCaja(null)
    setHistorial((prev) => prev.map((x) => (x.id === data.id ? data : x)))
    return {
      monto_inicial: caja.monto_inicial,
      total_efectivo: caja.total_efectivo,
      total_yape: caja.total_yape,
      total_fiado: caja.total_fiado,
      esperado_efectivo: esperado,
      ingresado_real: montoReal,
      diferencia,
    }
  }

  // Incrementa los totales de la caja tras una venta — llamado desde POS
  async function sumarVenta(
    cajaId: string,
    metodo: 'efectivo' | 'yape' | 'fiado',
    monto: number,
  ): Promise<void> {
    const campo =
      metodo === 'efectivo'
        ? 'total_efectivo'
        : metodo === 'yape'
        ? 'total_yape'
        : 'total_fiado'
    await supabase.rpc('incrementar_caja', {
      p_caja_id: cajaId,
      p_metodo: metodo,
      p_monto: monto,
    } as never)
    // Actualiza estado local de forma optimista
    setCaja((prev) =>
      prev && prev.id === cajaId
        ? { ...prev, [campo]: (prev[campo as keyof CajaRegistro] as number) + monto }
        : prev,
    )
  }

  const total = caja
    ? caja.monto_inicial + caja.total_efectivo
    : 0

  return { caja, historial, cargando, abrir, cerrar, sumarVenta, total, recargar: cargar }
}
