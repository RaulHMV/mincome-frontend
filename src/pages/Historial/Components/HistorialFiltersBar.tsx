import type { KeyboardEvent } from 'react';
import { CreditCard, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { allCategories } from '../../../data/mockData';
import { cn } from '../../../lib/utils';
import type { PaymentMethod, TxType } from '../../../types';
import {
  HISTORIAL_INPUT_CLS,
  HISTORIAL_LABEL_CLS,
  METHOD_FILTER_OPTIONS,
  PERIODO_OPTIONS,
  TYPE_FILTER_OPTIONS,
} from '../Constants/historialConstants';
import type {
  HistorialAdvancedFilters,
  HistorialPeriodo,
} from '../types/historial.types';

interface HistorialFiltersBarProps {
  cuentaFiltro: string | null;
  searchTerm: string;
  periodo: HistorialPeriodo;
  showFilters: boolean;
  filters: HistorialAdvancedFilters;
  onSearchChange: (value: string) => void;
  onPeriodoChange: (periodo: HistorialPeriodo) => void;
  onToggleFilters: () => void;
  onUpdateFilters: (patch: Partial<HistorialAdvancedFilters>) => void;
  onClearCuentaFiltro: () => void;
  onResetAll: () => void;
}

function blockInvalidAmountKeys(e: KeyboardEvent<HTMLInputElement>) {
  if (['-', '+', 'e', 'E'].includes(e.key)) {
    e.preventDefault();
  }
}

/** Barra de búsqueda, selectores de periodo rápido, píldora de cuenta y panel de filtros avanzados. */
export default function HistorialFiltersBar({
  cuentaFiltro,
  searchTerm,
  periodo,
  showFilters,
  filters,
  onSearchChange,
  onPeriodoChange,
  onToggleFilters,
  onUpdateFilters,
  onClearCuentaFiltro,
  onResetAll,
}: HistorialFiltersBarProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-2xs space-y-3.5">
      {/* Buscador y botón de filtros avanzados */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por concepto o categoría…"
            aria-label="Buscar movimientos"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm outline-none focus:border-[#202B33] focus:ring-1 focus:ring-[#202B33] transition"
          />
        </div>
        <button
          type="button"
          onClick={onToggleFilters}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer w-full sm:w-auto select-none',
            showFilters
              ? 'border-[#202B33] bg-[#202B33] text-white shadow-2xs'
              : 'border-slate-200 text-[#202B33] bg-white hover:bg-slate-50 shadow-2xs',
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filtros avanzados</span>
        </button>
      </div>

      {/* Fila de botones rápidos de periodos */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {PERIODO_OPTIONS.map((option) => {
          const isActive = periodo === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onPeriodoChange(option.id)}
              className={cn(
                'transition-all duration-150 cursor-pointer whitespace-nowrap h-9 px-3 sm:px-4 text-xs sm:text-sm rounded-lg select-none shrink-0',
                isActive
                  ? 'bg-[#E8EBED] text-[#202B33] font-semibold border border-[#D5DCD9] shadow-2xs'
                  : 'text-[#64748B] hover:bg-[#E8EBED]/70 hover:text-[#202B33] font-medium border border-transparent transition-colors',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Píldora de Filtro Activo desde URL (?cuenta= / ?medio=) */}
      {cuentaFiltro && (
        <div className="flex items-center pt-0.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 max-w-full">
            <CreditCard className="h-3.5 w-3.5 shrink-0 text-emerald-700 stroke-[1.75]" />
            <span className="truncate">
              Tarjeta: <strong>{cuentaFiltro}</strong>
            </span>
            <button
              type="button"
              onClick={onClearCuentaFiltro}
              className="ml-1 text-emerald-800 hover:text-emerald-950 shrink-0 cursor-pointer p-0.5 rounded hover:bg-emerald-100/70 transition"
              title="Quitar filtro"
              aria-label="Quitar filtro"
            >
              <X className="h-3.5 w-3.5 stroke-[2]" />
            </button>
          </div>
        </div>
      )}

      {/* Panel de Filtros Avanzados (Colapsable) */}
      {showFilters && (
        <div className="mt-4 border-t border-slate-100 pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Fecha "Desde" */}
            <div>
              <label htmlFor="from" className={HISTORIAL_LABEL_CLS}>
                Desde
              </label>
              <input
                id="from"
                type="date"
                value={filters.from}
                onChange={(e) => onUpdateFilters({ from: e.target.value })}
                className={HISTORIAL_INPUT_CLS}
              />
            </div>

            {/* Fecha "Hasta" */}
            <div>
              <label htmlFor="to" className={HISTORIAL_LABEL_CLS}>
                Hasta
              </label>
              <input
                id="to"
                type="date"
                value={filters.to}
                onChange={(e) => onUpdateFilters({ to: e.target.value })}
                className={HISTORIAL_INPUT_CLS}
              />
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="cat" className={HISTORIAL_LABEL_CLS}>
                Categoría
              </label>
              <select
                id="cat"
                value={filters.category}
                onChange={(e) => onUpdateFilters({ category: e.target.value })}
                className={HISTORIAL_INPUT_CLS}
              >
                <option value="todas">Todas</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Medio de pago */}
            <div>
              <label htmlFor="method" className={HISTORIAL_LABEL_CLS}>
                Medio de pago
              </label>
              <select
                id="method"
                value={filters.method}
                onChange={(e) =>
                  onUpdateFilters({
                    method: e.target.value as 'todos' | PaymentMethod,
                  })
                }
                className={HISTORIAL_INPUT_CLS}
              >
                {METHOD_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de flujo */}
            <div>
              <label htmlFor="type" className={HISTORIAL_LABEL_CLS}>
                Tipo de flujo
              </label>
              <select
                id="type"
                value={filters.type}
                onChange={(e) =>
                  onUpdateFilters({
                    type: e.target.value as 'todos' | TxType,
                  })
                }
                className={HISTORIAL_INPUT_CLS}
              >
                {TYPE_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rango de montos */}
            <div>
              <label className={HISTORIAL_LABEL_CLS}>Rango de monto ($)</label>
              <div className="flex items-center gap-2">
                <input
                  id="min"
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.min}
                  onKeyDown={blockInvalidAmountKeys}
                  onChange={(e) => onUpdateFilters({ min: e.target.value })}
                  placeholder="Mín: $0"
                  aria-label="Monto mínimo"
                  className={cn(HISTORIAL_INPUT_CLS, 'min-w-0 flex-1')}
                />
                <span className="text-slate-400 text-sm shrink-0">−</span>
                <input
                  id="max"
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.max}
                  onKeyDown={blockInvalidAmountKeys}
                  onChange={(e) => onUpdateFilters({ max: e.target.value })}
                  placeholder="Máx: $20,000"
                  aria-label="Monto máximo"
                  className={cn(HISTORIAL_INPUT_CLS, 'min-w-0 flex-1')}
                />
              </div>
            </div>
          </div>

          {/* Barra inferior de acciones */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onResetAll}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#202B33] py-2 px-3 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Limpiar filtros</span>
            </button>
            <button
              type="button"
              onClick={onToggleFilters}
              className="inline-flex items-center justify-center text-xs font-semibold text-slate-500 hover:text-[#202B33] py-2 px-3 rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              Ocultar filtros
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
