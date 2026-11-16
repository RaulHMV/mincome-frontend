import { Plus } from 'lucide-react';
import type { ApartadosHeaderProps } from '../types/apartados.types';

export default function ApartadosHeader({
  goalsCount,
  maxGoals,
  onOpenCreate,
}: ApartadosHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-[#202B33] tracking-tight">Apartados</h1>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            {goalsCount}/{maxGoals} activos
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#778089] mt-0.5">
          Reserva dinero para tus metas. Aislar capital no reduce tu patrimonio global.
        </p>
      </div>

      <div className="flex justify-end w-full sm:w-auto">
        <button
          type="button"
          onClick={onOpenCreate}
          className="w-[168px] h-10 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98] select-none cursor-pointer leading-none shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[1.5] shrink-0" />
          <span>Crear Apartado</span>
        </button>
      </div>
    </div>
  );
}
