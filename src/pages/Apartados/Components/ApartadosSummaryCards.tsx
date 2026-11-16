import { Banknote, Landmark, Wallet } from 'lucide-react';
import { formatMXN } from '../../../lib/utils';
import type { ApartadosSummaryCardsProps } from '../types/apartados.types';

export default function ApartadosSummaryCards({
  freeBalance,
  totalSaved,
  totalNetWorth,
  goalsCount,
}: ApartadosSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-5">
      {/* Tarjeta 1: Saldo Libre */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">Saldo Libre</p>
          <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
        </div>
        <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 tabular-nums truncate">
          {formatMXN(freeBalance)}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">
          Efectivo + Débito Nómina
        </p>
      </div>

      {/* Tarjeta 2: Capital en Apartados */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">
            Capital en Apartados
          </p>
          <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
        </div>
        <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight text-[#315B50] tabular-nums truncate">
          {formatMXN(totalSaved)}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">
          {goalsCount === 1 ? '1 meta en progreso' : `${goalsCount} metas en progreso`}
        </p>
      </div>

      {/* Tarjeta 3: Saldo Total Consolidado (col-span-2 en móvil) */}
      <div className="col-span-2 sm:col-span-1 bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">
            Saldo Total Consolidado
          </p>
          <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
        </div>
        <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight text-[#202B33] tabular-nums truncate">
          {formatMXN(totalNetWorth)}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">
          Saldo Libre + Capital en Apartados
        </p>
      </div>
    </div>
  );
}
