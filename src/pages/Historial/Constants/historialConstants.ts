import type { PaymentMethod, TxType } from '../../../types';
import type {
  HistorialAdvancedFilters,
  HistorialPeriodo,
} from '../types/historial.types';

export const HISTORIAL_PAGE_SIZE = 8;

export const EMPTY_HISTORIAL_FILTERS: HistorialAdvancedFilters = {
  from: '',
  to: '',
  category: 'todas',
  type: 'todos',
  method: 'todos',
  min: '',
  max: '',
};

export const PERIODO_OPTIONS: ReadonlyArray<{
  id: HistorialPeriodo;
  label: string;
}> = [
  { id: 'mes', label: 'Mes actual' },
  { id: '3meses', label: 'Últimos 3 meses' },
  { id: 'año', label: 'Este año' },
  { id: 'todo', label: 'Todo' },
] as const;

export const METHOD_FILTER_OPTIONS: ReadonlyArray<{
  value: 'todos' | PaymentMethod;
  label: string;
}> = [
  { value: 'todos', label: 'Todos' },
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Débito', label: 'Débito' },
  { value: 'Crédito', label: 'Crédito' },
] as const;

export const TYPE_FILTER_OPTIONS: ReadonlyArray<{
  value: 'todos' | TxType;
  label: string;
}> = [
  { value: 'todos', label: 'Todos' },
  { value: 'ingreso', label: 'Ingresos' },
  { value: 'gasto', label: 'Gastos' },
  { value: 'ahorro', label: 'Ahorros' },
] as const;

export const HISTORIAL_INPUT_CLS =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#202B33] focus:ring-1 focus:ring-[#202B33] transition';

export const HISTORIAL_LABEL_CLS =
  'mb-1 block text-xs font-semibold text-slate-600';
