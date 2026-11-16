import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { EditGoalModalProps } from '../types/apartados.types';
import GoalIconPicker from './GoalIconPicker';

export default function EditGoalModal({
  editingGoal,
  name,
  target,
  targetNum,
  selectedIcon,
  error,
  onNameChange,
  onTargetChange,
  onIconSelect,
  onClose,
  onSubmit,
}: EditGoalModalProps) {
  if (!editingGoal) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#202B33]/60">
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera del modal */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#202B33]">
              Editar meta de ahorro
            </h2>
            <p className="text-xs text-[#778089] mt-0.5">
              Modifica el nombre, icono u objetivo financiero de esta meta.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-slate-400 hover:text-[#202B33] p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Campo: Nombre de la meta */}
          <div className="space-y-1.5">
            <label htmlFor="edit-goal-name" className="text-xs font-medium text-slate-700">
              Nombre de la meta
            </label>
            <input
              id="edit-goal-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ej. Fondo de emergencia, Auto nuevo..."
              className="h-11 w-full px-3.5 rounded-lg border border-slate-200 text-sm font-medium text-[#202B33] focus:outline-none focus:border-[#202B33] focus:ring-1 focus:ring-[#202B33]"
            />
          </div>

          {/* Selector de icono (Catálogo de 10 iconos universales en grid de 5 columnas) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Icono representativo</label>
            <GoalIconPicker selectedIcon={selectedIcon} onSelect={onIconSelect} variant="edit" />
          </div>

          {/* Campo: Monto objetivo */}
          <div className="space-y-1.5">
            <label htmlFor="edit-goal-target" className="text-xs font-medium text-slate-700">
              Monto objetivo ($ MXN)
            </label>
            <input
              id="edit-goal-target"
              type="number"
              min="1"
              step="any"
              required
              value={target}
              onChange={(e) => onTargetChange(e.target.value)}
              placeholder="$ 0.00"
              className="h-11 w-full px-3.5 rounded-lg border border-slate-200 text-sm font-medium text-[#202B33] focus:outline-none focus:border-[#202B33] focus:ring-1 focus:ring-[#202B33]"
            />
          </div>

          {/* Tarjeta informativa de consistencia contable */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs text-[#778089] leading-relaxed">
            <span className="font-semibold text-[#202B33]">
              Capital acumulado actual: ${editingGoal.saved.toLocaleString('es-MX')}
            </span>
            <p className="mt-0.5">
              Para inyectar o retirar dinero de esta meta, utiliza los botones directos [+ Abonar] o [- Retirar] en el panel principal.
            </p>
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-600" role="alert">
              {error}
            </p>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs sm:text-sm font-medium text-[#778089] hover:text-[#202B33] transition-colors cursor-pointer px-4 py-2.5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || targetNum <= 0}
              className="h-10 px-5 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white text-xs sm:text-sm font-semibold shadow-2xs transition-all active:scale-[0.98] select-none cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
