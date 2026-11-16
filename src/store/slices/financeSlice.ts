import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  budgets as initialBudgets,
  daysUntilDay,
  initialCards,
  initialGoals,
  initialTransactions,
  liquidAccounts as initialLiquidAccounts,
  TODAY,
} from '../../data/mockData';
import {
  budgetsBatchSchema,
  transactionSchema,
  type BudgetLimitUpdateValues,
  type TransactionSchemaValues,
} from '../../schemas/finance.schema';
import type { BankCard, Budget, Goal, LiquidAccount, Transaction } from '../../types';
import type { RootState } from '../store';

export interface FinanceState {
  transactions: Transaction[];
  cards: BankCard[];
  goals: Goal[];
  budgets: Budget[];
  liquidAccounts: LiquidAccount[];
  lastError: string | null;
}

const CURRENT_MONTH_PREFIX = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}`;

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function findMatchingCard(cards: BankCard[], kind: 'Crédito' | 'Débito', cuenta?: string): BankCard | undefined {
  const sameKind = cards.filter((c) => c.kind === kind);
  if (sameKind.length === 0) return undefined;
  if (!cuenta) return sameKind[0];
  const normalized = cuenta.toLowerCase();
  return (
    sameKind.find(
      (c) => normalized.includes(c.last4.toLowerCase()) || normalized.includes(c.alias.toLowerCase()),
    ) ?? sameKind[0]
  );
}

function applyTransactionSideEffects(state: FinanceState, tx: Transaction, direction: 1 | -1): void {
  if (tx.type === 'gasto') {
    const budget = state.budgets.find(
      (b) => b.category.toLowerCase() === tx.category.toLowerCase(),
    );
    if (budget) {
      budget.spent = Math.max(0, roundMoney(budget.spent + direction * tx.amount));
    }

    if (tx.method === 'Efectivo') {
      const cash = state.liquidAccounts.find((a) => a.id === 'cash');
      if (cash) cash.amount = roundMoney(cash.amount - direction * tx.amount);
    } else if (tx.method === 'Débito') {
      const debit = state.liquidAccounts.find((a) => a.id === 'debit');
      if (debit) debit.amount = roundMoney(debit.amount - direction * tx.amount);
      const debitCard = findMatchingCard(state.cards, 'Débito', tx.cuenta);
      if (debitCard && typeof debitCard.balance === 'number') {
        debitCard.balance = roundMoney(debitCard.balance - direction * tx.amount);
      }
    } else if (tx.method === 'Crédito') {
      const creditCard = findMatchingCard(state.cards, 'Crédito', tx.cuenta);
      if (creditCard) {
        creditCard.used = Math.max(0, roundMoney(creditCard.used + direction * tx.amount));
      }
    }
    return;
  }

  if (tx.type === 'ingreso') {
    if (tx.method === 'Efectivo') {
      const cash = state.liquidAccounts.find((a) => a.id === 'cash');
      if (cash) cash.amount = roundMoney(cash.amount + direction * tx.amount);
    } else if (tx.method === 'Débito') {
      const debit = state.liquidAccounts.find((a) => a.id === 'debit');
      if (debit) debit.amount = roundMoney(debit.amount + direction * tx.amount);
      const debitCard = findMatchingCard(state.cards, 'Débito', tx.cuenta);
      if (debitCard && typeof debitCard.balance === 'number') {
        debitCard.balance = roundMoney(debitCard.balance + direction * tx.amount);
      }
    }
  }
}

function resolveUpdatedCuenta(
  cards: BankCard[],
  oldTx: Transaction,
  updated: Transaction,
): string | undefined {
  if (updated.method === 'Efectivo') return 'Efectivo';

  if (
    oldTx.method === updated.method &&
    updated.cuenta &&
    updated.cuenta.trim().length > 0 &&
    updated.cuenta.toLowerCase() !== 'efectivo'
  ) {
    return updated.cuenta.trim();
  }

  const matchingCard = findMatchingCard(cards, updated.method, updated.cuenta);
  if (matchingCard) {
    return `${matchingCard.alias} ••${matchingCard.last4}`;
  }

  return updated.cuenta?.trim() || updated.method;
}

const initialState: FinanceState = {
  transactions: initialTransactions,
  cards: initialCards,
  goals: initialGoals,
  budgets: initialBudgets,
  liquidAccounts: initialLiquidAccounts,
  lastError: null,
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<TransactionSchemaValues & { id?: string }>) => {
      const { id, ...rest } = action.payload;
      if (id !== undefined && typeof id !== 'string') {
        state.lastError = 'Identificador de movimiento inválido';
        return;
      }

      const candidate: TransactionSchemaValues = {
        date: rest.date,
        concept: rest.concept,
        category: rest.category,
        type: rest.type,
        method: rest.method,
        amount: roundMoney(Math.abs(rest.amount)),
        recurring: rest.recurring,
        ...(rest.cuenta !== undefined ? { cuenta: rest.cuenta } : {}),
      };

      const parsed = transactionSchema.safeParse(candidate);
      if (!parsed.success) {
        state.lastError = parsed.error.issues[0]?.message ?? 'Movimiento financiero inválido';
        return;
      }

      const newTx: Transaction = {
        id: id?.trim() || `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...parsed.data,
      };

      state.transactions.unshift(newTx);
      applyTransactionSideEffects(state, newTx, 1);
      state.lastError = null;
    },

    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const idx = state.transactions.findIndex((tx) => tx.id === action.payload.id);
      if (idx === -1) {
        state.lastError = 'No se encontró el movimiento a actualizar';
        return;
      }

      const oldTx = state.transactions[idx];
      const resolvedCuenta = resolveUpdatedCuenta(state.cards, oldTx, action.payload);
      const candidate: TransactionSchemaValues = {
        date: action.payload.date,
        concept: action.payload.concept,
        category: action.payload.category,
        type: action.payload.type,
        method: action.payload.method,
        amount: roundMoney(Math.abs(action.payload.amount)),
        recurring: action.payload.recurring,
        ...(resolvedCuenta !== undefined ? { cuenta: resolvedCuenta } : {}),
      };

      const parsed = transactionSchema.safeParse(candidate);
      if (!parsed.success) {
        state.lastError = parsed.error.issues[0]?.message ?? 'Movimiento financiero inválido';
        return;
      }

      applyTransactionSideEffects(state, oldTx, -1);

      const updatedTx: Transaction = {
        ...oldTx,
        ...parsed.data,
        id: oldTx.id,
        ...(oldTx.concepto !== undefined ? { concepto: parsed.data.concept } : {}),
        ...(oldTx.categoria !== undefined ? { categoria: parsed.data.category } : {}),
        ...(oldTx.medio !== undefined ? { medio: parsed.data.method } : {}),
        ...(oldTx.monto !== undefined ? { monto: parsed.data.amount } : {}),
      };

      state.transactions[idx] = updatedTx;
      applyTransactionSideEffects(state, updatedTx, 1);
      state.lastError = null;
    },

    removeTransaction: (state, action: PayloadAction<string>) => {
      const idx = state.transactions.findIndex((tx) => tx.id === action.payload);
      if (idx === -1) return;
      const target = state.transactions[idx];
      applyTransactionSideEffects(state, target, -1);
      state.transactions.splice(idx, 1);
      state.lastError = null;
    },

    updateBudgetLimits: (state, action: PayloadAction<BudgetLimitUpdateValues[]>) => {
      const parsed = budgetsBatchSchema.safeParse(action.payload);
      if (!parsed.success) {
        state.lastError = parsed.error.issues[0]?.message ?? 'Límites de presupuesto inválidos';
        return;
      }

      for (const item of parsed.data) {
        const target = state.budgets.find(
          (b) => b.category.toLowerCase() === item.category.toLowerCase(),
        );
        if (target) {
          target.limit = roundMoney(item.limit);
          if (item.umbralAlerta !== undefined) {
            target.umbralAlerta = item.umbralAlerta;
          }
        }
      }
      state.lastError = null;
    },

    clearFinanceError: (state) => {
      state.lastError = null;
    },
  },
});

export const {
  addTransaction,
  updateTransaction,
  removeTransaction,
  updateBudgetLimits,
  clearFinanceError,
} = financeSlice.actions;

export default financeSlice.reducer;

/* ───────── Selectores memoizados ───────── */

const selectLiquidAccountsRaw = (state: RootState) => state.finance.liquidAccounts;
const selectGoalsRaw = (state: RootState) => state.finance.goals;
const selectCardsRaw = (state: RootState) => state.finance.cards;
const selectTransactionsRaw = (state: RootState) => state.finance.transactions;

export const selectBudgets = (state: RootState) => state.finance.budgets;

export const selectAllTransactions = createSelector(
  [selectTransactionsRaw],
  (transactions) => transactions,
);

export const selectMovimientosTotals = createSelector([selectTransactionsRaw], (transactions) => {
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
});

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

export const selectOctoberExpenses = createSelector([selectTransactionsRaw], (transactions) => {
  const octoberTxs = transactions.filter((tx) => tx.date.startsWith(CURRENT_MONTH_PREFIX));
  const total = roundMoney(
    octoberTxs.filter((tx) => tx.type === 'gasto').reduce((sum, tx) => sum + tx.amount, 0),
  );
  const totalIncome = roundMoney(
    octoberTxs.filter((tx) => tx.type === 'ingreso').reduce((sum, tx) => sum + tx.amount, 0),
  );
  const percentage = totalIncome > 0 ? Math.round((total / totalIncome) * 100) : 0;

  return {
    total,
    totalIncome,
    percentage,
  };
});

export const selectCreditSummary = createSelector([selectCardsRaw], (cards) => {
  const creditCards = cards.filter((card) => card.kind === 'Crédito');
  return {
    used: roundMoney(creditCards.reduce((sum, card) => sum + card.used, 0)),
    limit: roundMoney(creditCards.reduce((sum, card) => sum + card.limit, 0)),
  };
});

export const selectRecentTransactions = createSelector([selectTransactionsRaw], (transactions) =>
  transactions.slice(0, 3),
);

export interface PreventiveAlertItem {
  id: string;
  severity: 'danger' | 'warning';
  message: string;
}

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
