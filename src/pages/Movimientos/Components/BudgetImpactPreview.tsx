import type { Budget } from '../../../types';
import { formatCurrencyMXN } from '../functions/movimientosHelpers';

interface BudgetImpactPreviewProps {
  budget?: Budget;
  pendingAmount: number;
}

/** Barra de impacto presupuestal en tiempo real para la categoría de gasto seleccionada. */
export default function BudgetImpactPreview({
  budget,
  pendingAmount,
}: BudgetImpactPreviewProps) {
  if (!budget) return null;

  const currentSpent = budget.spent;
  const projectedSpent = Math.round((currentSpent + Math.max(0, pendingAmount)) * 100) / 100;
  const pct = budget.limit > 0 ? Math.round((projectedSpent / budget.limit) * 100) : 0;
  const umbral = budget.umbralAlerta ?? 80;

  const badgeCls =
    pct >= 100
      ? 'bg-rose-50 text-rose-700 border border-rose-200'
      : pct >= umbral
        ? 'bg-amber-50 text-amber-700 border border-amber-200'
        : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

  const barCls =
    pct >= 100 ? 'bg-rose-500' : pct >= umbral ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-medium text-[#202B33] tabular-nums">
          Presupuesto de {budget.category} · Actual: {formatCurrencyMXN(currentSpent)}
          {pendingAmount > 0 ? ` + ${formatCurrencyMXN(pendingAmount)} = ${formatCurrencyMXN(projectedSpent)}` : ''}
          {' / '}Tope: {formatCurrencyMXN(budget.limit)}
        </span>
        <span className={`font-semibold text-[11px] px-2 py-0.5 rounded-full tabular-nums ${badgeCls}`}>
          {pct}% del tope
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${barCls} transition-all duration-300`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

