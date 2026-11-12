export type TxType = 'gasto' | 'ingreso' | 'ahorro';
export type PaymentMethod = 'Efectivo' | 'Débito' | 'Crédito';

export interface Transaction {
  id: string;
  /** Fecha ISO (yyyy-mm-dd) */
  date: string;
  concept: string;
  category: string;
  type: TxType;
  method: PaymentMethod;
  amount: number;
  recurring: boolean;
  cuenta?: string;
  // Campos de trazabilidad contable
  fecha?: string;
  fechaRaw?: string;
  concepto?: string;
  categoria?: string;
  medio?: string;
  tipo?: string;
  monto?: number;
}

export interface Budget {
  category: string;
  limit: number;
  budget?: number;
  spent: number;
}

export type GoalIcon =
  | 'ahorro'
  | 'home'
  | 'shield'
  | 'travel'
  | 'plane'
  | 'car'
  | 'tech'
  | 'laptop'
  | 'leisure'
  | 'education'
  | 'health'
  | 'gift'
  | 'heart';

export interface Goal {
  id: string;
  name: string;
  saved: number;
  target: number;
  icon: GoalIcon;
}

/** RNF3: únicamente alias y últimos 4 dígitos; jamás CVV ni número completo. */
export interface BankCard {
  id: string;
  alias: string;
  bank: string;
  last4: string;
  kind: 'Crédito' | 'Débito';
  tipo?: string;
  limit: number;
  limiteCredito?: number;
  used: number;
  balance?: number;
  cutDay: number;
  dueDay: number;
  diaCorte?: number;
  diaLimitePago?: number;
  banco?: string;
  terminacion?: string;
}

export type EventKind = 'pago' | 'ingreso' | 'corte';

export interface CalendarEvent {
  id: string;
  /** Día del mes en que ocurre (recurrente mensual) */
  day: number;
  title: string;
  amount: number;
  kind: EventKind;
  /** Alias opcionales (compatibilidad con fuentes de datos alternativas) */
  type?: string;
  concept?: string;
  concepto?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}
