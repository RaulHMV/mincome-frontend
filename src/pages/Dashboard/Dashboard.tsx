import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Banknote, Calendar, Landmark, Plus, Wallet } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import {
  selectCreditSummary,
  selectGoalsSummary,
  selectLiquidBalance,
  selectOctoberExpenses,
  selectRecentTransactions,
  selectTotalNetWorth,
} from '../../store/slices/financeSlice';
import AdjustLimitsModal from './Components/AdjustLimitsModal';
import BalanceCards from './Components/BalanceCards';
import BudgetMonitor from './Components/BudgetMonitor';
import IncomeExpenseChart from './Components/IncomeExpenseChart';
import RecentMovements from './Components/RecentMovements';
import { data1y, data6m } from './Constants/dashboardConstants';
import {
  formatCurrencyMXN,
  formatTransactionDate,
  getCategoryIcon,
  getChartBarsByPeriod,
} from './functions/dashboardHelpers';
import { useDashboardBudgets } from './hooks/useDashboardBudgets';
import type { ChartPeriod, MetricItem, RecentTransactionItem } from './types/dashboard.types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<ChartPeriod>('6m');

  const totalNetWorth = useAppSelector(selectTotalNetWorth);
  const liquidBalance = useAppSelector(selectLiquidBalance);
  const goalsSummary = useAppSelector(selectGoalsSummary);
  const octoberExpenses = useAppSelector(selectOctoberExpenses);
  const creditSummary = useAppSelector(selectCreditSummary);
  const recentTransactions = useAppSelector(selectRecentTransactions);

  const { budgets, isModalOpen, openModal, closeModal, saveBudgets } = useDashboardBudgets();

  const metrics: MetricItem[] = useMemo(
    () => [
      {
        title: 'Patrimonio Total',
        value: formatCurrencyMXN(totalNetWorth),
        subtitle: 'Saldo Libre + Capital en Apartados',
        icon: Landmark,
        color: 'text-[#202B33]',
      },
      {
        title: 'Saldo Libre',
        value: formatCurrencyMXN(liquidBalance),
        subtitle: 'Efectivo + Débito Nómina',
        icon: Banknote,
        color: 'text-emerald-600',
      },
      {
        title: 'Capital en Apartados',
        value: formatCurrencyMXN(goalsSummary.totalSaved),
        subtitle: `${goalsSummary.count} metas en progreso`,
        icon: Wallet,
        color: 'text-[#315B50]',
      },
      {
        title: 'Gasto del Mes',
        value: formatCurrencyMXN(octoberExpenses.total),
        subtitle: `${octoberExpenses.percentage}% de tus ingresos de octubre`,
        icon: ArrowUpRight,
        color: 'text-[#202B33]',
      },
    ],
    [totalNetWorth, liquidBalance, goalsSummary, octoberExpenses],
  );

  const recentItems: RecentTransactionItem[] = useMemo(
    () =>
      recentTransactions.map((tx) => {
        const prefix = tx.type === 'gasto' ? '-' : tx.type === 'ingreso' ? '+' : '';
        const tone = tx.type === 'gasto' ? 'text-[#202B33]' : 'text-emerald-600';
        return {
          id: tx.id,
          name: tx.concept,
          category: tx.category,
          date: formatTransactionDate(tx.date),
          amount: `${prefix}${formatCurrencyMXN(tx.amount)}`,
          tone,
          icon: getCategoryIcon(tx.category),
        };
      }),
    [recentTransactions],
  );

  const chartBars = getChartBarsByPeriod(period, data6m, data1y);

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Cabecera con botón y píldora homogeneizados (CERO emojis) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202B33] tracking-tight">Tu dinero, en perspectiva</h1>
          <p className="text-xs sm:text-sm text-[#778089] mt-0.5">Hola, Valeria. Este es tu resumen financiero de hoy.</p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          <div className="h-10 px-4 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#535F68] flex items-center gap-2 shadow-2xs select-none">
            <Calendar className="w-4 h-4 text-[#778089] stroke-[1.5]" />
            <span>Octubre de 2026</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/movimientos/nuevo')}
            className="h-10 px-4 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[1.5]" />
            <span>Nuevo Movimiento</span>
          </button>
        </div>
      </div>

      {/* 2 & 3. Tarjetas métricas y banner de Crédito Utilizado */}
      <BalanceCards
        metrics={metrics}
        creditUsed={creditSummary.used}
        creditLimit={creditSummary.limit}
      />

      {/* 4 & 5. Cuerpo Principal: Tarjetas sincronizadas a h-[320px] */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mb-4">
        <IncomeExpenseChart
          period={period}
          chartBars={chartBars}
          onPeriodChange={setPeriod}
          totalNetWorth={totalNetWorth}
        />
        <BudgetMonitor budgets={budgets} onAdjustLimits={openModal} />
      </div>

      {/* 6. Parte Inferior: Últimos movimientos */}
      <RecentMovements transactions={recentItems} />

      {/* Modal interactivo para ajustar límites */}
      <AdjustLimitsModal
        isOpen={isModalOpen}
        budgets={budgets}
        onClose={closeModal}
        onSave={saveBudgets}
      />
    </div>
  );
}
