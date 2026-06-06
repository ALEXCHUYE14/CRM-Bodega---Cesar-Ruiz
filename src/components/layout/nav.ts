import {
  LayoutDashboard,
  ScanLine,
  Package,
  ReceiptText,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  soloAdmin?: boolean
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, soloAdmin: true },
  { to: '/pos', label: 'Vender', icon: ScanLine },
  { to: '/inventario', label: 'Inventario', icon: Package },
  { to: '/ventas', label: 'Ventas', icon: ReceiptText },
]
