import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Car,
  Clapperboard,
  FileText,
  GraduationCap,
  HeartPulse,
  House,
  MoreHorizontal,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  Store,
  TrendingUp,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';
import type {
  IncomeSourceItem,
  MovimientosTab,
  NewOperationFlowType,
  RecurrenceOption,
} from '../types/movimientos.types';

export const MOVIMIENTOS_TABS: readonly MovimientosTab[] = [
  'Todos',
  'Gastos',
  'Ingresos',
  'Ahorros',
] as const;

export const MOVIMIENTOS_PAGE_SIZE = 10;

export const NEW_OPERATION_TABS: readonly { id: NewOperationFlowType; label: string }[] = [
  { id: 'gasto', label: 'Gasto' },
  { id: 'ingreso', label: 'Ingreso' },
] as const;

export const RECURRENCE_OPTIONS: readonly RecurrenceOption[] = [
  'Puntual',
  'Quincenal',
  'Mensual',
] as const;

export const EXPENSE_CATEGORY_ICONS: Record<string, LucideIcon> = {
  Comida: UtensilsCrossed,
  Compras: ShoppingBag,
  Educación: GraduationCap,
  Salud: HeartPulse,
  Supermercado: ShoppingCart,
  Entretenimiento: Clapperboard,
  Hogar: House,
  Servicios: Zap,
  Transporte: Car,
  Otro: MoreHorizontal,
};

export const INCOME_SOURCES: readonly IncomeSourceItem[] = [
  { id: 'Nómina', label: 'Nómina', icon: Briefcase },
  { id: 'Negocio / Ventas', label: 'Ventas', icon: Store },
  { id: 'Honorarios', label: 'Honorarios', icon: FileText },
  { id: 'Rendimientos', label: 'Rendimientos', icon: TrendingUp },
  { id: 'Reembolso', label: 'Reembolso', icon: RotateCcw },
  { id: 'Otros', label: 'Otros', icon: MoreHorizontal },
] as const;

