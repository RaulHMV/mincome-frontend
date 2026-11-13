import type { BudgetStatus, ChartBarItem, ChartPeriod } from '../types/dashboard.types';

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

