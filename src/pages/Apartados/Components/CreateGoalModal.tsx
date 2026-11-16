import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn, formatMXN } from '../../../lib/utils';
import type { CreateGoalModalProps } from '../types/apartados.types';
import GoalIconPicker from './GoalIconPicker';

export default function CreateGoalModal({
  isOpen,
  goalsCount,
  maxGoals,
  isLimitReached,
  freeBalance,
  name,
  target,
  initialAmount,
  targetNum,
  initialNum,
  selectedIcon,
  error,
  onNameChange,
  onTargetChange,
  onInitialAmountChange,
  onIconSelect,
  onClose,
  onSubmit,
}: CreateGoalModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#202B33]/60">
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-[#202B33] text-lg">Nueva meta de ahorro</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Campo: Nombre de la meta */}
          <div>
            <label htmlFor="goal-name" className="mb-1.5 block text-xs font-medium text-slate-500">
              Nombre de la meta
            </label>
            <input
              id="goal-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ej. Fondo de emergencia, Auto nuevo..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#202B33] focus:ring-2 focus:ring-[#202B33]/10"
            />
          </div>

          {/* Selector de icono */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">
              Seleccionar icono
            </label>
            <GoalIconPicker selectedIcon={selectedIcon} onSelect={onIconSelect} variant="create" />
          </div>

          {/* Campo: Monto objetivo */}
          <div>
            <label htmlFor="goal-target" className="mb-1.5 block text-xs font-medium text-slate-500">
              Monto objetivo ($ MXN)
            </label>
            <input
              id="goal-target"
              type="number"
              min="1"
              step="any"
              required
              value={target}
              onChange={(e) => onTargetChange(e.target.value)}
              placeholder="$ 0.00"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#202B33] focus:ring-2 focus:ring-[#202B33]/10"
            />
          </div>

          {/* Campo: Asignación inicial */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="goal-initial" className="text-xs font-medium text-slate-500">
                Asignación inicial ($ MXN)
              </label>
              <span className="text-[11px] text-[#778089]">
                Saldo Libre: {formatMXN(freeBalance)}
              </span>
            </div>
            <input
              id="goal-initial"
              type="number"
              min="0"
              step="any"
              value={initialAmount}
              onChange={(e) => onInitialAmountChange(e.target.value)}
              placeholder="$ 0.00 (opcional)"
              className={cn(
                'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-2',
                initialNum > freeBalance
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-[#202B33] focus:ring-[#202B33]/10',
              )}
            />
            {initialNum > freeBalance && (
              <p className="mt-1 text-xs text-rose-500">
                La asignación inicial no puede superar tu Saldo Libre ({formatMXN(freeBalance)}).
              </p>
            )}
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-600" role="alert">
              {error}
            </p>
          )}

          {/* Nota informativa de límite */}
          <div className="rounded-lg bg-slate-50 p-2.5 text-center text-xs text-slate-500 border border-slate-100">
            Nota: Puedes mantener un máximo de {maxGoals} apartados activos en simultáneo (
            {goalsCount}/{maxGoals} utilizados).
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs sm:text-sm font-medium text-[#778089] hover:text-[#202B33] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isLimitReached ||
                !name.trim() ||
                targetNum <= 0 ||
                initialNum < 0 ||
                initialNum > freeBalance
              }
              className="flex-1 h-10 px-4 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white text-xs sm:text-sm font-semibold shadow-2xs transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              Crear apartado
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
