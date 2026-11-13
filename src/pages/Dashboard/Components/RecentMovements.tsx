import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { RecentTransactionItem } from '../types/dashboard.types';

interface RecentMovementsProps {
  transactions: RecentTransactionItem[];
}

export default function RecentMovements({ transactions }: RecentMovementsProps) {
  return (
    <section className="bg-white border border-[#EBE7E0] rounded-2xl p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between pb-3.5">
        <h2 className="text-base font-bold text-[#202B33]">Últimos movimientos</h2>
        <Link to="/movimientos" className="text-xs font-semibold text-[#64748B] hover:text-[#202B33] flex items-center gap-0.5 transition">
          <span>Ver todos</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {transactions.map((tx) => {
          const Icon = tx.icon;
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl border border-[#EBE7E0] bg-[#F1F5F9]/50 p-3.5 transition hover:bg-[#F1F5F9]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#EBE7E0] bg-white text-[#535F68] shadow-2xs">
                  <Icon className="h-4 w-4 stroke-[1.5]" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#202B33]">{tx.name}</p>
                  <p className="text-[11px] text-[#778089]">{tx.category} · {tx.date}</p>
                </div>
              </div>
              <p className={`text-xs font-bold tabular-nums ${tx.tone}`}>{tx.amount}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

