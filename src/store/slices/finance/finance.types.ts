import { TODAY } from '../../../data/mockData';
import type {
  BankCard,
  Budget,
  Goal,
  GoalIcon,
  LiquidAccount,
  Transaction,
} from '../../../types';

export interface FinanceState {
  transactions: Transaction[];
  cards: BankCard[];
  goals: Goal[];
  budgets: Budget[];
  liquidAccounts: LiquidAccount[];
  lastError: string | null;
}

export interface AddGoalPayload {
  name: string;
  target: number;
  initialAmount?: number;
  icon: GoalIcon;
}

export interface UpdateGoalPayload {
  id: string;
  name: string;
  target: number;
  icon: GoalIcon;
}

export interface GoalTransferPayload {
  goalId: string;
  amount: number;
}

export interface UpdateCardPayload {
  id: string;
  changes: Partial<Omit<BankCard, 'id'>>;
}

export interface PreventiveAlertItem {
  id: string;
  severity: 'danger' | 'warning';
  message: string;
}

export const MAX_GOALS = 10;
export const MAX_GOAL_NAME_LENGTH = 60;
export const DEFAULT_DEBIT_ACCOUNT_LABEL = 'Nómina Santander ••7712';
export const TODAY_ISO_DATE = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}-${String(TODAY.getDate()).padStart(2, '0')}`;
export const CURRENT_MONTH_PREFIX = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}`;
