import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { cn, formatMXN } from '../../../lib/utils';
import type { CalendarSimulationField } from '../../../store/slices/calendarSlice';
import type { ProjectionSimulatorPanelProps } from '../types/calendar.types';

interface SimulationFieldConfig {
  id: string;
  field: CalendarSimulationField;
  label: string;
  suffix: string;
  suffixIsWord?: boolean;
}

const SIMULATION_FIELDS: SimulationFieldConfig[] = [
  {
    id: 'sim-ingreso',
    field: 'dineroExtra',
    label: 'Ingreso extra (MXN)',
    suffix: '+',
  },
  {
    id: 'sim-gasto',
    field: 'gastoImprevisto',
    label: 'Gasto imprevisto o compra (MXN)',
    suffix: '−',
  },
  {
    id: 'sim-ahorro-diario',
    field: 'ahorroDiario',
    label: 'Ahorro diario proyectado ($/día)',
    suffix: 'por día',
    suffixIsWord: true,
  },
];

export default function ProjectionSimulatorPanel({
  visibleOnMobile,
  dineroExtra,
  gastoImprevisto,
  ahorroDiario,
  cuotaDiaria,
  alcanciaProyectada,
  libreParaGastar,
  diaSeleccionado,
  mesNombre,
  fieldErrors,
  onFieldChange,
  onReset,
}: ProjectionSimulatorPanelProps) {
  const valuesByField: Record<CalendarSimulationField, string> = {
    dineroExtra,
    gastoImprevisto,
    ahorroDiario,
  };

  return (
    <aside
      className={cn(
        'sm:col-span-5 xl:col-span-4 flex-col',
        visibleOnMobile ? 'flex' : 'hidden sm:flex',
      )}
    >
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs flex flex-col gap-3">
        {/* Encabezado */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <SlidersHorizontal className="text-zinc-700 h-4 w-4 shrink-0" />
            <h2 className="text-sm font-bold text-zinc-900">Proyecta tu próximo mes</h2>
          </div>
          <p className="text-[11px] text-zinc-500 leading-tight">
            Descubre el impacto de un dinero extra, gastos o ahorro sin modificar tus movimientos reales.
          </p>
        </div>

        {/* Inputs de simulación */}
        <div className="space-y-2.5">
          {SIMULATION_FIELDS.map((cfg) => {
            const rawVal = valuesByField[cfg.field];
            const errorMsg = fieldErrors[cfg.field];

            return (
              <div key={cfg.field}>
                <label
                  htmlFor={cfg.id}
                  className="text-[11px] font-semibold text-zinc-700 mb-1 block"
                >
                  {cfg.label}
                </label>
                <div
                  className={cn(
                    'h-8 px-2.5 rounded-xl border bg-white flex items-center justify-between shadow-2xs focus-within:ring-1 transition',
                    errorMsg
                      ? 'border-rose-400 focus-within:border-rose-600 focus-within:ring-rose-500/20'
                      : 'border-zinc-200 focus-within:border-zinc-900 focus-within:ring-zinc-900',
                  )}
                >
                  <div className="flex items-center flex-1 mr-2 min-w-0">
                    <span className="text-zinc-400 font-mono text-xs font-semibold mr-1 select-none">
                      $
                    </span>
                    <input
                      id={cfg.id}
                      type="text"
                      inputMode="decimal"
                      value={rawVal === '0' ? '' : rawVal}
                      onChange={(e) => onFieldChange(cfg.field, e.target.value)}
                      placeholder="0.00"
                      aria-invalid={Boolean(errorMsg)}
                      className="w-full bg-transparent border-none outline-none text-xs font-mono font-semibold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal py-1"
                    />
                  </div>
                  <span
                    className={cn(
                      'text-zinc-400 shrink-0 select-none',
                      cfg.suffixIsWord ? 'text-[10px] font-medium' : 'text-xs font-bold',
                    )}
                  >
                    {cfg.suffix}
                  </span>
                </div>
                {errorMsg && (
                  <p className="mt-1 text-[10px] font-medium text-rose-600" role="alert">
                    {errorMsg}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Tarjeta de Resultado: VERDE OLIVO / SALVIA PREMIUM */}
        <div className="bg-[#edf5f0] border border-[#c2dac8] rounded-xl p-3 shadow-2xs mt-1">
          {/* Desglose Dual (2 Columnas con separador) */}
          <div className="grid grid-cols-2 divide-x divide-[#c2dac8] gap-3 items-center py-1">
            {/* Columna Izquierda (Dinero Libre para Gastar) */}
            <div className="min-w-0 pr-1">
              <span className="text-[10px] font-bold tracking-wider text-[#2f5c43] uppercase block">
                Libre para gastar
              </span>
              <p
                className={cn(
                  'text-xl sm:text-2xl font-extrabold font-mono tabular-nums leading-tight mt-0.5',
                  libreParaGastar < 0 ? 'text-rose-700' : 'text-[#0f2e1e]',
                )}
              >
                {formatMXN(libreParaGastar)} MXN
              </p>
              <p className="text-[9.5px] text-[#3a6b50] leading-tight mt-1">
                Disponible tras cubrir gastos y apartar ahorro.
              </p>
            </div>

            {/* Columna Derecha (Dinero Acumulado en Alcancía) */}
            <div className="min-w-0 pl-3">
              <span className="text-[10px] font-bold tracking-wider text-[#1e4530] uppercase block">
                En alcancía
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-mono text-[#1e4530] tabular-nums leading-tight mt-0.5">
                +{formatMXN(alcanciaProyectada)} MXN
              </p>
              <p className="text-[9.5px] text-[#3a6b50] leading-tight mt-1">
                {cuotaDiaria > 0
                  ? `${diaSeleccionado} días a $${ahorroDiario.trim()}/día.`
                  : 'Sin ahorro diario configurado.'}
              </p>
            </div>
          </div>

          {/* Sub-barra de Estado al pie de la tarjeta verde */}
          <div className="pt-2 mt-2 border-t border-[#c2dac8]/70 flex items-center justify-between text-[10px] text-[#2f5c43] font-medium">
            <span>
              Día meta seleccionado: {diaSeleccionado} de {mesNombre}
            </span>
            {libreParaGastar < 0 && (
              <span className="text-rose-700 font-semibold shrink-0 ml-1">
                ⚠️ Saldo insuficiente proyectado
              </span>
            )}
          </div>
        </div>

        {/* Pie del panel */}
        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 mt-0.5">
          <p className="text-[9px] text-zinc-400">
            Proyección temporal en memoria. No altera cuentas bancarias.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 transition shrink-0 ml-2 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Restablecer valores
          </button>
        </div>
      </div>
    </aside>
  );
}
