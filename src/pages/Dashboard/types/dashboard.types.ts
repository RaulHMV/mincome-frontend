import type { LucideIcon } from 'lucide-react';

export type ChartPeriod = '6m' | '1y';

export type BudgetStatus = 'warning' | 'danger' | 'ok';

export interface MetricItem {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
}

export interface ChartBarItem {
  month: string;
  height: string;
  active: boolean;
  amount: string;
}

export interface BudgetItem {
  id: string;
  name: string;
  icon: LucideIcon;
  limit: number;
  spent: number;
  pct: number;
  status: BudgetStatus;
}

export interface RecentTransactionItem {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: string;
  tone: string;
  icon: LucideIcon;
}

