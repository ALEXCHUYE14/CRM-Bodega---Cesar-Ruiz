import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import { useCaja, type ResumenCierre } from '@/hooks/useCaja'
import { useAuth } from '@/context/AuthContext'
import type { CajaRegistro } from '@/types/database'

interface CajaState {
  caja: CajaRegistro | null
  cargando: boolean
  abrir: (montoInicial: number) => Promise<CajaRegistro>
  cerrar: (montoReal: number) => Promise<ResumenCierre>
  sumarVenta: (cajaId: string, metodo: 'efectivo' | 'yape' | 'fiado', monto: number) => Promise<void>
  total: number
  recargar: () => void
}

const CajaContext = createContext<CajaState | undefined>(undefined)

export function CajaProvider({ children }: { children: ReactNode }) {
  const { session, perfil } = useAuth()
  const cajeroId = session?.user?.id ?? null
  const { caja, cargando, abrir: abrirHook, cerrar, sumarVenta, total, recargar } = useCaja(cajeroId)

  async function abrir(montoInicial: number): Promise<CajaRegistro> {
    const nombre = perfil?.nombre ?? 'Cajero'
    return abrirHook(montoInicial, nombre)
  }

  const value: CajaState = {
    caja,
    cargando,
    abrir,
    cerrar,
    sumarVenta,
    total,
    recargar,
  }

  return <CajaContext.Provider value={value}>{children}</CajaContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCajaCtx(): CajaState {
  const ctx = useContext(CajaContext)
  if (!ctx) throw new Error('useCajaCtx debe usarse dentro de <CajaProvider>')
  return ctx
}
