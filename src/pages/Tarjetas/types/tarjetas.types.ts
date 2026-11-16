import type { BankCard } from '../../../types';

export type CardFormKind = 'Crédito' | 'Débito';

export type PaymentSourceMethod = 'Efectivo' | 'Débito';

export interface AddCardFormState {
  kind: CardFormKind;
  alias: string;
  bank: string;
  last4: string;
  limit: string;
  balance: string;
  cutDay: string;
  dueDay: string;
}

export interface EditCardFormState {
  alias: string;
  bank: string;
  last4: string;
  limit: string;
  cutDay: string;
  dueDay: string;
}

export interface UpcomingCardDateRow {
  card: BankCard;
  cutDay: number;
  dueDay: number;
  daysUntilCut: number;
  daysUntilDue: number;
  hasDebt: boolean;
}

export interface CardsOverviewMetrics {
  creditUsed: number;
  creditLimit: number;
  creditAvailable: number;
  utilizationPct: number;
  liquidBalance: number;
  creditCount: number;
  debitCount: number;
}
