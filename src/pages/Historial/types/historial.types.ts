import type { PaymentMethod, TxType } from '../../../types';

export type HistorialPeriodo = 'mes' | '3meses' | 'año' | 'todo';

export interface HistorialAdvancedFilters {
  from: string;
  to: string;
  category: string;
  type: 'todos' | TxType;
  method: 'todos' | PaymentMethod;
  min: string;
  max: string;
}

export interface HistorialMetrics {
  ingresos: number;
  gastos: number;
  balance: number;
}
