import { Minus, Pencil, PiggyBank, Plus } from 'lucide-react';
import { cn, formatMXN } from '../../../lib/utils';
import { GOAL_ICON_MAP } from '../Constants/apartadosConstants';
import type { GoalCardProps } from '../types/apartados.types';

export default function GoalCard({
  goal,
  onOpenTransfer,
  onOpenEdit,
  onRelease,
}: GoalCardProps) {
  const Icon = GOAL_ICON_MAP[goal.icon] ?? PiggyBank;
  const pct = goal.target > 0 ? Math.min(Math.round((goal.saved / goal.target) * 100), 100) : 0;
  const isCompleted = goal.saved >= goal.target;
  const remaining = Math.max(goal.target - goal.saved, 0);

  return (
    <article className="p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-2xs transition flex flex-col justify-between">
      <div>
        {/* Fila 1 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-8 w-8 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Icon className="h-4 w-4" />
            </span>
            <h2
              className="text-sm font-semibold text-[#202B33] truncate max-w-[150px]"
              title={goal.name}
            >
              {goal.name}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 tabular-nums">
              {pct}%
            </span>
            <button
              type="button"
              title="Editar meta"
              onClick={() => onOpenEdit(goal)}
              className="p-1 text-slate-400 hover:text-[#202B33] hover:bg-[#E8EBED] rounded-lg transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Fila 2 (Progreso y Montos) */}
        <div className="mt-2.5 flex items-baseline justify-between text-xs">
          <span className="text-base font-bold text-[#202B33] tabular-nums">
            {formatMXN(goal.saved)}
          </span>
          <span className="text-slate-400">de {formatMXN(goal.target)}</span>
        </div>

        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isCompleted ? 'bg-emerald-600' : 'bg-emerald-500',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-400 mt-1.5">
          {isCompleted ? '¡Meta alcanzada!' : `Faltan ${formatMXN(remaining)}`}
        </p>
      </div>

      {/* Fila 3 (Acciones) */}
      {isCompleted ? (
        <button
          type="button"
          onClick={() => onRelease(goal)}
          className="w-full mt-3 h-9 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          🎉 Liberar y completar meta
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onOpenTransfer(goal.id, 'abonar')}
            className="h-9 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-[#202B33] hover:bg-[#E8EBED] hover:border-[#D5DCD9] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2] text-slate-500" />
            <span>Abonar</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenTransfer(goal.id, 'retirar')}
            className="h-9 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-[#E8EBED]/70 hover:text-[#202B33] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2] text-slate-400" />
            <span>Retirar</span>
          </button>
        </div>
      )}
    </article>
  );
}
