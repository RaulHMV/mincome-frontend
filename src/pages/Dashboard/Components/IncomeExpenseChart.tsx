import type { ChartBarItem, ChartPeriod } from '../types/dashboard.types';

interface IncomeExpenseChartProps {
  period: ChartPeriod;
  chartBars: ChartBarItem[];
  onPeriodChange: (period: ChartPeriod) => void;
}

export default function IncomeExpenseChart({
  period,
  chartBars,
  onPeriodChange,
}: IncomeExpenseChartProps) {
  return (
    <section className="bg-white border border-[#EBE7E0] rounded-2xl p-4 sm:p-5 shadow-2xs lg:col-span-7 xl:col-span-8 h-[320px] flex flex-col justify-between">
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#202B33]">Evolución del patrimonio</h2>
          <p className="text-[11px] text-[#64748B]">Tu crecimiento, mes a mes</p>
        </div>
        <div className="bg-[#F1F5F9] p-1 rounded-xl flex items-center text-xs">
          <button
            type="button"
            onClick={() => onPeriodChange('6m')}
            className={`px-3 py-1 rounded-lg transition ${
              period === '6m' ? 'bg-white text-[#202B33] font-semibold shadow-xs' : 'text-[#778089] hover:text-[#202B33]'
            }`}
          >
            6 meses
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange('1y')}
            className={`px-3 py-1 rounded-lg transition ${
              period === '1y' ? 'bg-white text-[#202B33] font-semibold shadow-xs' : 'text-[#778089] hover:text-[#202B33]'
            }`}
          >
            1 año
          </button>
        </div>
      </div>

      {/* Contenedor principal de la gráfica con altura fija responsiva */}
      <div className="relative w-full h-[215px] my-2 select-none">
        {/* CAPA 1: LÍNEAS GUÍA HORIZONTALES (Recorren todo el ancho al 100%) */}
        <div className="absolute inset-0 flex flex-col justify-between pb-7 pt-1 pointer-events-none">
          {/* Nivel $16 mil */}
          <div className="flex items-center w-full gap-3">
            <span className="w-12 text-[11px] text-[#778089] tabular-nums font-medium flex-shrink-0">$16 mil</span>
            <div className="flex-1 border-t border-slate-100" />
          </div>

          {/* Nivel $14 mil */}
          <div className="flex items-center w-full gap-3">
            <span className="w-12 text-[11px] text-[#778089] tabular-nums font-medium flex-shrink-0">$14 mil</span>
            <div className="flex-1 border-t border-slate-100" />
          </div>

          {/* Nivel $12 mil */}
          <div className="flex items-center w-full gap-3">
            <span className="w-12 text-[11px] text-[#778089] tabular-nums font-medium flex-shrink-0">$12 mil</span>
            <div className="flex-1 border-t border-slate-100" />
          </div>

          {/* Nivel base $10 mil */}
          <div className="flex items-center w-full gap-3">
            <span className="w-12 text-[11px] text-[#778089] tabular-nums font-medium flex-shrink-0">$10 mil</span>
            <div className="flex-1 border-t border-[#EBE7E0]" />
          </div>
        </div>

        {/* CAPA 2: BARRAS INTERACTIVAS Y ETIQUETAS DE MESES (Superpuestas) */}
        <div className="absolute inset-0 pl-16 pr-2 flex items-end justify-between z-10">
          {chartBars.map((item) => (
            <div key={item.month} className="group relative flex-1 flex flex-col items-center justify-end h-full pb-7">
              {/* Tooltip sutil en hover */}
              <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-2 bg-[#202B33] text-white text-[10px] font-mono py-0.5 px-2 rounded shadow-sm transition-opacity duration-150 z-20 whitespace-nowrap">
                {item.amount}
              </div>

              {/* Barra individual con ancho controlado */}
              <div
                className={`w-7 sm:w-9 md:w-10 max-w-[44px] rounded-t-md transition-all duration-200 ${item.height} ${
                  item.active
                    ? 'bg-[#315B50] shadow-2xs group-hover:bg-[#25463D]'
                    : 'bg-[#DDE8E2] group-hover:bg-[#CBDCD2]'
                }`}
              />

              {/* Etiqueta del mes debajo de la barra */}
              <span
                className={`absolute bottom-0 text-[11px] sm:text-xs font-medium transition-colors ${
                  item.active ? 'text-[#202B33] font-bold' : 'text-[#778089]'
                }`}
              >
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pie de la tarjeta */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#315B50] shrink-0" />
          <span>Patrimonio total en MXN</span>
        </div>
        <span className="font-semibold text-slate-700 font-mono tabular-nums">Octubre 2026: $14,950.00</span>
      </div>
    </section>
  );
}

