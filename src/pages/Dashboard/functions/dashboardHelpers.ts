import type { LucideIcon } from 'lucide-react';
import { CATEGORY_ICON_MAP } from '../Constants/dashboardConstants';
import type { BudgetStatus, ChartBarItem, ChartPeriod } from '../types/dashboard.types';

const SHORT_MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/** Calcula el porcentaje consumido de un presupuesto respecto a su límite. */
export function calculateBudgetPercentage(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((spent / limit) * 100);
}

/** Determina el estado del presupuesto: normal (<80%), advertencia (>=80%) o sobregiro (>=100%). */
export function getBudgetStatus(pct: number): BudgetStatus {
  if (pct >= 100) return 'danger';
  if (pct >= 80) return 'warning';
  return 'ok';
}

/** Devuelve la clase de color de barra según el estado del presupuesto. */
export function getBudgetBarColor(status: BudgetStatus): string {
  return status === 'danger' ? 'bg-rose-500' : status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';
}

/** Selecciona la serie de barras correspondiente al periodo elegido. */
export function getChartBarsByPeriod(
  period: ChartPeriod,
  sixMonths: ChartBarItem[],
  oneYear: ChartBarItem[],
): ChartBarItem[] {
  return period === '6m' ? sixMonths : oneYear;
}

/** Formatea montos numéricos al formato local mexicano. */
export function formatBudgetAmount(value: number): string {
  return value.toLocaleString('es-MX');
}

/** Formatea importes en pesos mexicanos con 2 decimales ($0,000.00). */
export function formatCurrencyMXN(value: number): string {
  return `$${value.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Resuelve el ícono de Lucide asociado a una categoría de movimiento o presupuesto. */
export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICON_MAP[category] ?? CATEGORY_ICON_MAP.Otro;
}

/** Formatea fecha ISO (YYYY-MM-DD) a formato corto legible (ej. 24 Oct). */
export function formatTransactionDate(dateIso: string): string {
  const parts = dateIso.split('-');
  if (parts.length !== 3) return dateIso;
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const monthLabel = SHORT_MONTHS[monthIdx];
  if (!monthLabel || Number.isNaN(day)) return dateIso;
  return `${day} ${monthLabel}`;
}
