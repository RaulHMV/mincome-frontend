import { createSelector } from '@reduxjs/toolkit';
import { daysUntilDay } from '../../../data/mockData';
import type { RootState } from '../../store';
import {
  CURRENT_MONTH_PREFIX,
  type PreventiveAlertItem,
} from './finance.types';
import { getLiquidBalance, roundMoney } from './financeHelpers';

const selectLiquidAccountsRaw = (state: RootState) => state.finance.liquidAccounts;
const selectGoalsRaw = (state: RootState) => state.finance.goals;
const selectCardsRaw = (state: RootState) => state.finance.cards;
const selectTransactionsRaw = (state: RootState) => state.finance.transactions;

export const selectBudgets = (state: RootState) => state.finance.budgets;
export const selectCards = (state: RootState) => state.finance.cards;
export const selectLiquidAccounts = (state: RootState) => state.finance.liquidAccounts;
export const selectFinanceError = (state: RootState) => state.finance.lastError;
export const selectGoals = createSelector([selectGoalsRaw], (goals) => goals);

export const selectCardsOverview = createSelector(
  [selectCardsRaw, selectLiquidAccountsRaw],
  (cards, liquidAccounts) => {
    const creditCards = cards.filter((card) => card.kind === 'Crédito');
    const debitCards = cards.filter((card) => card.kind === 'Débito');

    const creditUsed = roundMoney(creditCards.reduce((sum, card) => sum + card.used, 0));
    const creditLimit = roundMoney(creditCards.reduce((sum, card) => sum + card.limit, 0));
    const creditAvailable = roundMoney(Math.max(0, creditLimit - creditUsed));
    const utilizationPct =
      creditLimit > 0 ? Math.round((creditUsed / creditLimit) * 100) : 0;
    const liquidBalance = getLiquidBalance(liquidAccounts);

    return {
      creditUsed,
      creditLimit,
      creditAvailable,
      utilizationPct,
      liquidBalance,
      creditCount: creditCards.length,
      debitCount: debitCards.length,
    };
  },
);

export const selectAllTransactions = createSelector(
  [selectTransactionsRaw],
  (transactions) => transactions,
);

export const selectMovimientosTotals = createSelector(
  [selectTransactionsRaw],
  (transactions) => {
    let totalIngreso = 0;
    let totalGasto = 0;
    let totalAhorro = 0;

    for (const tx of transactions) {
      const absAmount = Math.abs(tx.amount);
      if (tx.type === 'ingreso') totalIngreso += absAmount;
      else if (tx.type === 'gasto') totalGasto += absAmount;
      else if (tx.type === 'ahorro') totalAhorro += absAmount;
    }

    return {
      totalIngreso: roundMoney(totalIngreso),
      totalGasto: roundMoney(totalGasto),
      totalAhorro: roundMoney(totalAhorro),
    };
  },
);

export const selectLiquidBalance = createSelector([selectLiquidAccountsRaw], (accounts) =>
  roundMoney(accounts.reduce((sum, acc) => sum + acc.amount, 0)),
);

export const selectGoalsSummary = createSelector([selectGoalsRaw], (goals) => ({
  totalSaved: roundMoney(goals.reduce((sum, goal) => sum + goal.saved, 0)),
  count: goals.length,
}));

export const selectTotalNetWorth = createSelector(
  [selectLiquidBalance, selectGoalsSummary],
  (liquidBalance, goalsSummary) => roundMoney(liquidBalance + goalsSummary.totalSaved),
);

export const selectOctoberExpenses = createSelector(
  [selectTransactionsRaw],
  (transactions) => {
    const octoberTxs = transactions.filter((tx) =>
      tx.date.startsWith(CURRENT_MONTH_PREFIX),
    );
    const total = roundMoney(
      octoberTxs.filter((tx) => tx.type === 'gasto').reduce((sum, tx) => sum + tx.amount, 0),
    );
    const totalIncome = roundMoney(
      octoberTxs
        .filter((tx) => tx.type === 'ingreso')
        .reduce((sum, tx) => sum + tx.amount, 0),
    );
    const percentage = totalIncome > 0 ? Math.round((total / totalIncome) * 100) : 0;

    return {
      total,
      totalIncome,
      percentage,
    };
  },
);

export const selectCreditSummary = createSelector([selectCardsRaw], (cards) => {
  const creditCards = cards.filter((card) => card.kind === 'Crédito');
  return {
    used: roundMoney(creditCards.reduce((sum, card) => sum + card.used, 0)),
    limit: roundMoney(creditCards.reduce((sum, card) => sum + card.limit, 0)),
  };
});

export const selectRecentTransactions = createSelector(
  [selectTransactionsRaw],
  (transactions) => transactions.slice(0, 3),
);

export const selectPreventiveAlerts = createSelector(
  [selectBudgets, selectCardsRaw],
  (budgets, cards): PreventiveAlertItem[] => {
    const dangerAlerts: PreventiveAlertItem[] = [];
    const warningAlerts: PreventiveAlertItem[] = [];

    for (const b of budgets) {
      if (b.limit <= 0) continue;
      const pct = Math.round((b.spent / b.limit) * 100);
      const umbral = b.umbralAlerta ?? 80;

      if (pct >= 100) {
        dangerAlerts.push({
          id: `budget-danger-${b.category.toLowerCase()}`,
          severity: 'danger',
          message: `${b.category} superó su tope mensual (${pct}%).`,
        });
      } else if (pct >= umbral) {
        warningAlerts.push({
          id: `budget-warning-${b.category.toLowerCase()}`,
          severity: 'warning',
          message: `${b.category} alcanzó el ${pct}% de su presupuesto.`,
        });
      }
    }

    for (const card of cards) {
      if (card.kind !== 'Crédito' || card.used <= 0) continue;
      const days = daysUntilDay(card.dueDay);
      if (days <= 10) {
        warningAlerts.push({
          id: `card-due-${card.id}`,
          severity: 'warning',
          message:
            days === 0
              ? `Pago de tarjeta ${card.alias} vence hoy.`
              : `Pago de tarjeta ${card.alias} vence en ${days} días.`,
        });
      }
    }

    return [...dangerAlerts, ...warningAlerts];
  },
);
