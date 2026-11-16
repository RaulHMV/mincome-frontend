import { PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrencyMXN } from '../functions/movimientosHelpers';

interface MovimientosKpisProps {
  totalIngreso: number;
  totalGasto: number;
  totalAhorro: number;
}

/** Tarjetas resumen de ingresos, gastos y apartados conectadas a Redux. */
export default function MovimientosKpis({
  totalIngreso,
  totalGasto,
  totalAhorro,
}: MovimientosKpisProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-5">
      {/* Tarjeta 1: Ingresos registrados */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">Ingresos registrados</p>
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
        </div>
        <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 tabular-nums truncate">
          {formatCurrencyMXN(totalIngreso)}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">Nómina y depósitos del mes</p>
      </div>

      {/* Tarjeta 2: Gastos registrados */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">Gastos registrados</p>
          <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
        </div>
        <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight text-[#202B33] tabular-nums truncate">
          {formatCurrencyMXN(totalGasto)}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">Consumo acumulado del período</p>
      </div>

      {/* Tarjeta 3: Enviado a apartados (col-span-2 en móvil) */}
      <div className="col-span-2 sm:col-span-1 bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">Enviado a apartados</p>
          <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
        </div>
        <p className="mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight text-[#315B50] tabular-nums truncate">
          {formatCurrencyMXN(totalAhorro)}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">Metas y fondos en progreso</p>
      </div>
    </div>
  );
}

