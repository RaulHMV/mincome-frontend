import { createSlice } from '@reduxjs/toolkit';
import {
  budgets as initialBudgets,
  initialCards,
  initialGoals,
  initialTransactions,
  liquidAccounts as initialLiquidAccounts,
} from '../../data/mockData';
import { cardsReducers } from './finance/cards.reducers';
import type { FinanceState } from './finance/finance.types';
import { goalsReducers } from './finance/goals.reducers';
import { transactionsReducers } from './finance/transactions.reducers';

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
    ...transactionsReducers,
    ...goalsReducers,
    ...cardsReducers,
  },
});

export const {
  addTransaction,
  updateTransaction,
  removeTransaction,
  updateBudgetLimits,
  clearFinanceError,
  addGoal,
  updateGoal,
  abonarGoal,
  retirarGoal,
  releaseGoal,
  addCard,
  updateCard,
  removeCard,
  payCreditCard,
} = financeSlice.actions;

export {
  selectAllTransactions,
  selectBudgets,
  selectCards,
  selectCardsOverview,
  selectCreditSummary,
  selectFinanceError,
  selectGoals,
  selectGoalsSummary,
  selectLiquidAccounts,
  selectLiquidBalance,
  selectMovimientosTotals,
  selectOctoberExpenses,
  selectPreventiveAlerts,
  selectRecentTransactions,
  selectTotalNetWorth,
} from './finance/finance.selectors';

export type {
  AddGoalPayload,
  FinanceState,
  GoalTransferPayload,
  PreventiveAlertItem,
  UpdateCardPayload,
  UpdateGoalPayload,
} from './finance/finance.types';

export default financeSlice.reducer;
