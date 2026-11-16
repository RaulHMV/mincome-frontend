import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  budgetsBatchSchema,
  transactionSchema,
  type BudgetLimitUpdateValues,
  type TransactionSchemaValues,
} from '../../../schemas/finance.schema';
import type { Transaction } from '../../../types';
import type { FinanceState } from './finance.types';
import {
  applyTransactionSideEffects,
  resolveUpdatedCuenta,
  roundMoney,
} from './financeHelpers';

const addTransaction: CaseReducer<
  FinanceState,
  PayloadAction<TransactionSchemaValues & { id?: string }>
> = (state, action) => {
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
    state.lastError =
      parsed.error.issues[0]?.message ?? 'Movimiento financiero inválido';
    return;
  }

  const newTx: Transaction = {
    id: id?.trim() || `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...parsed.data,
  };

  state.transactions.unshift(newTx);
  applyTransactionSideEffects(state, newTx, 1);
  state.lastError = null;
};

const updateTransaction: CaseReducer<FinanceState, PayloadAction<Transaction>> = (
  state,
  action,
) => {
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
    state.lastError =
      parsed.error.issues[0]?.message ?? 'Movimiento financiero inválido';
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
};

const removeTransaction: CaseReducer<FinanceState, PayloadAction<string>> = (
  state,
  action,
) => {
  const idx = state.transactions.findIndex((tx) => tx.id === action.payload);
  if (idx === -1) return;
  const target = state.transactions[idx];
  applyTransactionSideEffects(state, target, -1);
  state.transactions.splice(idx, 1);
  state.lastError = null;
};

const updateBudgetLimits: CaseReducer<
  FinanceState,
  PayloadAction<BudgetLimitUpdateValues[]>
> = (state, action) => {
  const parsed = budgetsBatchSchema.safeParse(action.payload);
  if (!parsed.success) {
    state.lastError =
      parsed.error.issues[0]?.message ?? 'Límites de presupuesto inválidos';
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
};

const clearFinanceError: CaseReducer<FinanceState, PayloadAction<void>> = (
  state,
) => {
  state.lastError = null;
};

export const transactionsReducers = {
  addTransaction,
  updateTransaction,
  removeTransaction,
  updateBudgetLimits,
  clearFinanceError,
};
