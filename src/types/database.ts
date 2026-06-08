// Tipos del dominio del sistema Cesar Ruiz POS

export type Rol = 'administrador' | 'cajero'
export type MetodoPago = 'efectivo' | 'tarjeta' | 'yape' | 'plin' | 'transferencia'
export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste' | 'venta' | 'devolucion'
export type EstadoCompra = 'pagado' | 'pendiente'
export type MotivoMerma = 'vencido' | 'danado' | 'consumo_interno' | 'otro'

export type Perfil = {
  id: string
  nombre: string
  rol: Rol
  activo: boolean
  creado_en: string
}

export type Categoria = {
  id: string
  nombre: string
  color: string
  creado_en: string
}

export type Producto = {
  id: string
  sku: string
  nombre: string
  categoria_id: string | null
  precio_compra: number
  precio_venta: number
  stock_actual: number
  stock_minimo: number
  unidad: string
  activo: boolean
  fecha_vencimiento: string | null
  creado_en: string
  actualizado_en: string
  categorias?: Categoria | null
}

export type Venta = {
  id: string
  numero: number
  cajero_id: string | null
  cajero_nombre: string | null
  subtotal: number
  descuento: number
  igv: number
  total: number
  metodo: MetodoPago
  pago_recibido: number
  vuelto: number
  anulada: boolean
  creado_en: string
}

export type DetalleVenta = {
  id: string
  venta_id: string
  producto_id: string | null
  producto_nombre: string
  sku: string | null
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export type MovimientoInventario = {
  id: string
  producto_id: string | null
  producto_nombre: string | null
  tipo: TipoMovimiento
  cantidad: number
  stock_previo: number
  stock_nuevo: number
  motivo: string | null
  usuario_id: string | null
  creado_en: string
}

export type Proveedor = {
  id: string
  nombre: string
  ruc: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  activo: boolean
  creado_en: string
}

export type Compra = {
  id: string
  numero: string | null
  proveedor_id: string | null
  proveedor_nombre: string | null
  total: number
  estado: EstadoCompra
  fecha_compra: string
  notas: string | null
  creado_en: string
  proveedores?: Proveedor | null
}

export type DetalleCompra = {
  id: string
  compra_id: string
  producto_id: string | null
  producto_nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export type Merma = {
  id: string
  producto_id: string | null
  producto_nombre: string
  cantidad: number
  costo_unitario: number
  costo_total: number
  motivo: MotivoMerma
  descripcion: string | null
  usuario_id: string | null
  creado_en: string
}

export type ItemCarrito = {
  producto: Producto
  cantidad: number
}

// Tipado minimo para el cliente de Supabase (compatible con GenericSchema)
type Tabla<R> = { Row: R; Insert: Partial<R>; Update: Partial<R>; Relationships: [] }

export interface Database {
  public: {
    Tables: {
      perfiles: Tabla<Perfil>
      categorias: Tabla<Categoria>
      productos: Tabla<Producto>
      ventas: Tabla<Venta>
      detalle_ventas: Tabla<DetalleVenta>
      movimientos_inventario: Tabla<MovimientoInventario>
      proveedores: Tabla<Proveedor>
      compras: Tabla<Compra>
      detalle_compras: Tabla<DetalleCompra>
      mermas: Tabla<Merma>
    }
    Views: Record<string, never>
    Functions: {
      registrar_venta: {
        Args: {
          p_items: unknown
          p_metodo: MetodoPago
          p_descuento: number
          p_pago_recibido: number
        }
        Returns: Venta
      }
      registrar_compra: {
        Args: {
          p_numero: string | null
          p_proveedor_id: string | null
          p_proveedor_nombre: string | null
          p_fecha_compra: string
          p_estado: EstadoCompra
          p_notas: string | null
          p_items: unknown
        }
        Returns: Compra
      }
      ajustar_stock: {
        Args: {
          p_producto_id: string
          p_cantidad: number
          p_tipo: TipoMovimiento
          p_motivo: string | null
        }
        Returns: Producto
      }
      anular_venta: { Args: { p_venta_id: string }; Returns: Venta }
      es_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      rol_usuario: Rol
      metodo_pago: MetodoPago
      tipo_movimiento: TipoMovimiento
      estado_compra: EstadoCompra
      motivo_merma: MotivoMerma
    }
    CompositeTypes: Record<string, never>
  }
}
