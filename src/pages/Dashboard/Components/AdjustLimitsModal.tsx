import { X } from 'lucide-react';
import type { BudgetItem } from '../types/dashboard.types';

interface AdjustLimitsModalProps {
  isOpen: boolean;
  budgets: BudgetItem[];
  onClose: () => void;
  onSave: () => void;
}

export default function AdjustLimitsModal({
  isOpen,
  budgets,
  onClose,
  onSave,
}: AdjustLimitsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Fondo oscuro de cobertura absoluta */}
      <div
        className="fixed inset-0 bg-[#202B33]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Tarjeta del Modal */}
      <div className="relative w-full max-w-[580px] rounded-3xl border border-[#EBE7E0] bg-white p-6 sm:p-7 shadow-2xl z-10 my-auto">
        {/* Cabecera */}
        <div className="flex items-start justify-between pb-4 border-b border-[#EBE7E0]">
          <div>
            <h3 className="text-base sm:lg font-bold text-[#202B33] tracking-tight">
              Ajustar límites de presupuesto
            </h3>
            <p className="text-xs sm:text-sm text-[#778089] mt-1">
              Define el monto mensual para cada una de tus 10 categorías de gasto.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#778089] hover:bg-slate-100 hover:text-[#202B33] transition -mr-1 -mt-1 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Lista de las 10 categorías con input numérico y scroll interno */}
        <div className="my-4 max-h-[50vh] sm:max-h-[55vh] overflow-y-auto pr-1.5 space-y-2.5">
          {budgets.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-[#EBE7E0] hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-[#EBE7E0] text-[#535F68] shadow-2xs shrink-0">
                    <Icon className="w-4 h-4 stroke-[1.5]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#202B33] truncate">{b.name}</p>
                    <p className="text-[11px] text-[#778089]">Actual: ${b.limit.toLocaleString()} MXN</p>
                  </div>
                </div>
                <div className="relative w-32 shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#778089] select-none">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    defaultValue={b.limit}
                    className="w-full rounded-xl border border-[#EBE7E0] bg-white py-2 pl-7 pr-3 text-right text-xs sm:text-sm font-bold text-[#202B33] outline-none focus:border-[#202B33] focus:ring-1 focus:ring-[#202B33] tabular-nums shadow-2xs transition"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Acciones */}
        <div className="pt-3 border-t border-[#EBE7E0] flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-[#EBE7E0] bg-white text-xs sm:text-sm font-medium text-[#64748B] hover:bg-slate-50 hover:text-[#202B33] transition cursor-pointer shadow-2xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 h-11 rounded-xl bg-[#202B33] text-xs sm:text-sm font-semibold text-white hover:bg-[#141A29] shadow-2xs transition cursor-pointer"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

