import { AlertCircle, AlertTriangle, Check, Pencil } from 'lucide-react';
import { formatBudgetAmount, getBudgetBarColor } from '../functions/dashboardHelpers';
import type { BudgetItem } from '../types/dashboard.types';

interface BudgetMonitorProps {
  budgets: BudgetItem[];
  onAdjustLimits: () => void;
}

export default function BudgetMonitor({ budgets, onAdjustLimits }: BudgetMonitorProps) {
  return (
    <section className="bg-white border border-[#EBE7E0] rounded-2xl p-4 sm:p-5 shadow-2xs lg:col-span-5 xl:col-span-4 h-[320px] flex flex-col">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
        <h2 className="text-sm sm:text-base font-bold text-[#202B33]">Presupuestos del mes</h2>
        <button
          type="button"
          onClick={onAdjustLimits}
          className="flex items-center gap-1.5 text-xs font-medium text-[#778089] hover:text-[#202B33] transition cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Ajustar límites</span>
        </button>
      </div>

      {/* Lista con scroll vertical limpio para las 10 categorías */}
      <div className="flex-1 overflow-y-auto pr-1.5 space-y-3 pt-2.5">
        {budgets.map((b) => {
          const Icon = b.icon;
          const barColor = getBudgetBarColor(b.status);

          return (
            <div key={b.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#F1F5F9] text-[#535F68]">
                    <Icon className="w-3 h-3 stroke-[1.5]" />
                  </span>
                  <span className="font-semibold text-[#202B33] truncate">{b.name}</span>
                </div>

                {/* Badges minimalistas sin emojis */}
                <div>
                  {b.status === 'danger' && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 border border-rose-200/70">
                      <AlertCircle className="w-3 h-3 stroke-[1.5] text-rose-600 shrink-0" />
                      <span>Sobregiro</span>
                    </span>
                  )}
                  {b.status === 'warning' && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200/70">
                      <AlertTriangle className="w-3 h-3 stroke-[1.5] text-amber-600 shrink-0" />
                      <span>Cerca del tope</span>
                    </span>
                  )}
                  {b.status === 'ok' && (
                    <span className="inline-flex items-center justify-center rounded-md bg-emerald-50 p-1 text-emerald-700">
                      <Check className="w-3 h-3 stroke-[2] text-emerald-600" />
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${Math.min(b.pct, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-[#778089] tabular-nums">
                <span>${formatBudgetAmount(b.spent)} ({b.pct}%)</span>
                <span>de ${formatBudgetAmount(b.limit)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

