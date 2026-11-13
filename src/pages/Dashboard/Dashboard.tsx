import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import AdjustLimitsModal from './Components/AdjustLimitsModal';
import BalanceCards from './Components/BalanceCards';
import BudgetMonitor from './Components/BudgetMonitor';
import IncomeExpenseChart from './Components/IncomeExpenseChart';
import RecentMovements from './Components/RecentMovements';
import { METRICS, RECENT_TX, data1y, data6m, defaultBudgets } from './Constants/dashboardConstants';
import { getChartBarsByPeriod } from './functions/dashboardHelpers';
import { useDashboardBudgets } from './hooks/useDashboardBudgets';
import type { ChartPeriod } from './types/dashboard.types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<ChartPeriod>('6m');
  const { budgets, isModalOpen, openModal, closeModal, saveBudgets } = useDashboardBudgets(defaultBudgets);

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
      <BalanceCards metrics={METRICS} />

      {/* 4 & 5. Cuerpo Principal: Tarjetas sincronizadas a h-[320px] */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mb-4">
        <IncomeExpenseChart period={period} chartBars={chartBars} onPeriodChange={setPeriod} />
        <BudgetMonitor budgets={budgets} onAdjustLimits={openModal} />
      </div>

      {/* 6. Parte Inferior: Últimos movimientos */}
      <RecentMovements transactions={RECENT_TX} />

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
