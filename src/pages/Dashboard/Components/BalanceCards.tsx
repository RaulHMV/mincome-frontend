import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import type { MetricItem } from '../types/dashboard.types';

interface BalanceCardsProps {
  metrics: MetricItem[];
}

export default function BalanceCards({ metrics }: BalanceCardsProps) {
  return (
    <>
      {/* 2. 4 Tarjetas Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-3.5">
        {metrics.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] sm:text-xs font-medium text-[#64748B] truncate">{card.title}</p>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#778089] stroke-[1.5] shrink-0" />
              </div>
              <p className={`mt-1.5 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight tabular-nums truncate ${card.color}`}>{card.value}</p>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-[#778089] truncate">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* 3. Banner Horizontal "Crédito Utilizado" (Interactivo a /tarjetas) */}
      <Link
        to="/tarjetas"
        className="bg-white border border-[#EBE7E0] hover:border-[#CBD5E1] rounded-2xl p-3.5 sm:p-4 mb-4 flex items-center justify-between shadow-2xs transition group cursor-pointer"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] group-hover:bg-[#E8EBED] flex items-center justify-center text-[#535F68] mr-3.5 shrink-0 transition">
            <CreditCard className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#202B33] group-hover:text-[#315B50] transition">Crédito Utilizado</p>
            <p className="text-xs text-[#64748B]">Dinero financiado por el banco; no se resta de tu efectivo disponible.</p>
          </div>
        </div>
        <div className="text-right pl-4 shrink-0">
          <p className="text-lg font-bold font-mono text-[#202B33] tabular-nums">$2,450.00</p>
          <p className="text-xs text-[#778089] tabular-nums">de $12,000.00 de límite</p>
        </div>
      </Link>
    </>
  );
}

