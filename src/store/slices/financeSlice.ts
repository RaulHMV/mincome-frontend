import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { initialCards, initialGoals, initialTransactions } from '../../data/mockData';
import type { BankCard, Goal, Transaction } from '../../types';

export interface FinanceState {
  transactions: Transaction[];
  cards: BankCard[];
  goals: Goal[];
}

const initialState: FinanceState = {
  transactions: initialTransactions,
  cards: initialCards,
  goals: initialGoals,
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    removeTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter((tx) => tx.id !== action.payload);
    },
  },
});

export const { addTransaction, removeTransaction } = financeSlice.actions;
export default financeSlice.reducer;

