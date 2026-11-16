import { PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import { cn, formatMXN } from '../../../lib/utils';
import type { HistorialMetrics } from '../types/historial.types';

interface HistorialKpisProps {
  metrics: HistorialMetrics;
}

/** Tarjetas superiores reactivas que muestran ingresos, gastos y balance del periodo filtrado. */
export default function HistorialKpis({ metrics }: HistorialKpisProps) {
  const isPositiveBalance = metrics.balance >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-4">
      {/* Tarjeta 1: Ingresos en periodo */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">
            Ingresos en periodo
          </p>
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
        </div>
        <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 tabular-nums truncate">
          {formatMXN(metrics.ingresos)}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">
          Total de entradas filtradas
        </p>
      </div>

      {/* Tarjeta 2: Gastos en periodo */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">
            Gastos en periodo
          </p>
          <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
        </div>
        <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight text-[#202B33] tabular-nums truncate">
          {formatMXN(metrics.gastos)}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">
          Total de salidas filtradas
        </p>
      </div>

      {/* Tarjeta 3: Balance neto / Ahorro (col-span-2 en móvil) */}
      <div className="col-span-2 sm:col-span-1 bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">
            Balance neto / Ahorro
          </p>
          <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
        </div>
        <p
          className={cn(
            'mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight tabular-nums truncate',
            isPositiveBalance ? 'text-emerald-600' : 'text-rose-600',
          )}
        >
          {isPositiveBalance
            ? `+${formatMXN(metrics.balance)}`
            : `-${formatMXN(Math.abs(metrics.balance))}`}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">
          {isPositiveBalance ? 'Flujo positivo en periodo' : 'Déficit en periodo'}
        </p>
      </div>
    </div>
  );
}
