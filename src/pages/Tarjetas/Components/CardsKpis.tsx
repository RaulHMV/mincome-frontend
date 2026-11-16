import { Banknote, CreditCard, Wallet } from 'lucide-react';
import {
  formatCardMoneyMXN,
  isHealthyCreditUsage,
} from '../functions/tarjetasHelpers';
import type { CardsOverviewMetrics } from '../types/tarjetas.types';

interface CardsKpisProps {
  overview: CardsOverviewMetrics;
  debitBalance: number;
  cashBalance: number;
}

/** Barra superior de 4 KPIs de tarjetas y liquidez conectada al selector memoizado de Redux. */
export default function CardsKpis({
  overview,
  debitBalance,
  cashBalance,
}: CardsKpisProps) {
  const saludable = isHealthyCreditUsage(overview.utilizationPct);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4">
      {/* KPI 1: Crédito Total Utilizado */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">
            Crédito Total Utilizado
          </p>
          <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
        </div>
        <p className="mt-1 sm:mt-1.5 text-lg sm:text-2xl font-bold tracking-tight text-[#202B33] tabular-nums truncate">
          {formatCardMoneyMXN(overview.creditUsed)}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">
          Deuda activa en tarjetas
        </p>
      </div>

      {/* KPI 2: Línea de Crédito Disponible */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">
            Línea de Crédito Disponible
          </p>
          <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
        </div>
        <p className="mt-1 sm:mt-1.5 text-lg sm:text-2xl font-bold tracking-tight text-[#202B33] tabular-nums truncate">
          {formatCardMoneyMXN(overview.creditAvailable)}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">
          Capacidad de financiamiento
        </p>
      </div>

      {/* KPI 3: Liquidez Inmediata (Verde Esmeralda Homologado) */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">
            Liquidez Inmediata
          </p>
          <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
        </div>
        <p className="mt-1 sm:mt-1.5 text-lg sm:text-2xl font-bold tracking-tight text-emerald-600 tabular-nums truncate">
          {formatCardMoneyMXN(overview.liquidBalance)}
        </p>
        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">
          Débito ({formatCardMoneyMXN(debitBalance)}) + Efec.
          {cashBalance ? ` (${formatCardMoneyMXN(cashBalance)})` : ''}
        </p>
      </div>

      {/* KPI 4: Uso de Crédito Global */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">
            Uso de Crédito Global
          </p>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
              saludable
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200/50'
                : 'text-amber-700 bg-amber-50 border-amber-200/50'
            }`}
          >
            {saludable ? 'Saludable' : 'Elevado'}
          </span>
        </div>
        <div className="flex items-baseline gap-1 mt-1 sm:mt-1.5">
          <span className="text-lg sm:text-2xl font-bold tracking-tight text-[#202B33] tabular-nums">
            {overview.utilizationPct}%
          </span>
          <span className="text-[10px] sm:text-xs text-[#778089]">de línea total</span>
        </div>
        <div className="mt-1.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              saludable ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(overview.utilizationPct, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] sm:text-xs text-[#778089] truncate">
          {saludable ? 'Por debajo del 30% recomendado' : 'Supera el 30% recomendado'}
        </p>
      </div>
    </div>
  );
}
