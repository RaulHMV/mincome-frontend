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
import type { BankCard, Budget, Goal, GoalIcon, LiquidAccount, Transaction } from '../../types';
import type { RootState } from '../store';

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

const MAX_GOALS = 10;
const MAX_GOAL_NAME_LENGTH = 60;
const DEFAULT_DEBIT_ACCOUNT_LABEL = 'Nómina Santander ••7712';
const TODAY_ISO_DATE = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}-${String(TODAY.getDate()).padStart(2, '0')}`;
const CURRENT_MONTH_PREFIX = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}`;

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getLiquidBalance(accounts: LiquidAccount[]): number {
  return roundMoney(accounts.reduce((sum, acc) => sum + acc.amount, 0));
}

function isValidPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isValidNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function validateGoalName(
  goals: Goal[],
  rawName: string,
  excludeId?: string,
): { valid: true; cleanName: string } | { valid: false; error: string } {
  const cleanName = rawName.trim();
  if (!cleanName) {
    return { valid: false, error: 'Ingresa un nombre para la meta.' };
  }
  if (cleanName.length > MAX_GOAL_NAME_LENGTH) {
    return { valid: false, error: `El nombre no puede exceder ${MAX_GOAL_NAME_LENGTH} caracteres.` };
  }
  const normalized = cleanName.toLowerCase();
  const isDuplicate = goals.some(
    (g) => g.id !== excludeId && g.name.trim().toLowerCase() === normalized,
  );
  if (isDuplicate) {
    return { valid: false, error: 'Ya existe un apartado con ese nombre.' };
  }
  return { valid: true, cleanName };
}

function syncDebitCardBalance(state: FinanceState, delta: number): void {
  const debitCard = findMatchingCard(state.cards, 'Débito', DEFAULT_DEBIT_ACCOUNT_LABEL);
  if (debitCard && typeof debitCard.balance === 'number') {
    const next = roundMoney(debitCard.balance + delta);
    debitCard.balance = delta < 0 ? Math.max(0, next) : next;
  }
}

function deductFromLiquidAccountsCascade(state: FinanceState, amount: number): void {
  let remaining = roundMoney(amount);
  const debit = state.liquidAccounts.find((a) => a.id === 'debit');
  if (debit && debit.amount > 0 && remaining > 0) {
    const fromDebit = roundMoney(Math.min(debit.amount, remaining));
    debit.amount = roundMoney(debit.amount - fromDebit);
    syncDebitCardBalance(state, -fromDebit);
    remaining = roundMoney(remaining - fromDebit);
  }
  if (remaining > 0) {
    const cash = state.liquidAccounts.find((a) => a.id === 'cash');
    if (cash) {
      cash.amount = Math.max(0, roundMoney(cash.amount - remaining));
    }
  }
}

function addToDebitLiquidAccount(state: FinanceState, amount: number): void {
  const rounded = roundMoney(amount);
  const debit = state.liquidAccounts.find((a) => a.id === 'debit');
  if (debit) {
    debit.amount = roundMoney(debit.amount + rounded);
  }
  syncDebitCardBalance(state, rounded);
}

function recordGoalTransaction(
  state: FinanceState,
  params: {
    concept: string;
    type: 'ahorro' | 'ingreso';
    tipo: 'Ahorro' | 'Retiro Ahorro';
    amount: number;
  },
): void {
  const rounded = roundMoney(params.amount);
  const fechaMX = TODAY.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const fechaISO = TODAY.toISOString();

  state.transactions.unshift({
    id: `tx-goal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: TODAY_ISO_DATE,
    fecha: fechaMX,
    fechaRaw: fechaISO,
    concept: params.concept,
    concepto: params.concept,
    category: 'Ahorro',
    categoria: 'Ahorro',
    type: params.type,
    tipo: params.tipo,
    method: 'Débito',
    medio: 'Débito',
    cuenta: DEFAULT_DEBIT_ACCOUNT_LABEL,
    amount: rounded,
    monto: rounded,
    recurring: false,
  });
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

    addGoal: (state, action: PayloadAction<AddGoalPayload>) => {
      if (state.goals.length >= MAX_GOALS) {
        state.lastError = `Puedes mantener un máximo de ${MAX_GOALS} apartados activos.`;
        return;
      }

      const nameValidation = validateGoalName(state.goals, action.payload.name);
      if (!nameValidation.valid) {
        state.lastError = 'error' in nameValidation ? nameValidation.error : 'Nombre de apartado inválido.';
        return;
      }

      if (!isValidPositiveNumber(action.payload.target)) {
        state.lastError = 'El monto objetivo debe ser mayor a 0.';
        return;
      }
      const target = roundMoney(action.payload.target);
      if (target <= 0) {
        state.lastError = 'El monto objetivo debe ser mayor a 0.';
        return;
      }

      const rawInitial = action.payload.initialAmount ?? 0;
      if (!isValidNonNegativeNumber(rawInitial)) {
        state.lastError = 'La asignación inicial no puede ser negativa.';
        return;
      }
      const initialAmount = roundMoney(rawInitial);

      if (initialAmount > target) {
        state.lastError = 'La asignación inicial no puede superar el monto objetivo.';
        return;
      }

      const freeBalance = getLiquidBalance(state.liquidAccounts);
      if (initialAmount > freeBalance) {
        state.lastError = 'La asignación inicial no puede superar tu Saldo Libre.';
        return;
      }

      const newGoal: Goal = {
        id: `g-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: nameValidation.cleanName,
        saved: initialAmount,
        target,
        icon: action.payload.icon,
      };

      state.goals.push(newGoal);

      if (initialAmount > 0) {
        deductFromLiquidAccountsCascade(state, initialAmount);
        recordGoalTransaction(state, {
          concept: `Abono inicial a ${newGoal.name}`,
          type: 'ahorro',
          tipo: 'Ahorro',
          amount: initialAmount,
        });
      }

      state.lastError = null;
    },

    updateGoal: (state, action: PayloadAction<UpdateGoalPayload>) => {
      const targetGoal = state.goals.find((g) => g.id === action.payload.id);
      if (!targetGoal) {
        state.lastError = 'Apartado no encontrado.';
        return;
      }

      const nameValidation = validateGoalName(state.goals, action.payload.name, targetGoal.id);
      if (!nameValidation.valid) {
        state.lastError = 'error' in nameValidation ? nameValidation.error : 'Nombre de apartado inválido.';
        return;
      }

      if (!isValidPositiveNumber(action.payload.target)) {
        state.lastError = 'El monto objetivo debe ser mayor a 0.';
        return;
      }
      const target = roundMoney(action.payload.target);
      if (target <= 0) {
        state.lastError = 'El monto objetivo debe ser mayor a 0.';
        return;
      }

      targetGoal.name = nameValidation.cleanName;
      targetGoal.target = target;
      targetGoal.icon = action.payload.icon;
      state.lastError = null;
    },

    abonarGoal: (state, action: PayloadAction<GoalTransferPayload>) => {
      const targetGoal = state.goals.find((g) => g.id === action.payload.goalId);
      if (!targetGoal) {
        state.lastError = 'Apartado no encontrado.';
        return;
      }

      if (!isValidPositiveNumber(action.payload.amount)) {
        state.lastError = 'El monto a abonar debe ser mayor a 0.';
        return;
      }
      const amount = roundMoney(action.payload.amount);
      if (amount <= 0) {
        state.lastError = 'El monto a abonar debe ser mayor a 0.';
        return;
      }

      const freeBalance = getLiquidBalance(state.liquidAccounts);
      if (amount > freeBalance) {
        state.lastError = 'El monto excede tu Saldo Libre disponible.';
        return;
      }

      targetGoal.saved = roundMoney(targetGoal.saved + amount);
      deductFromLiquidAccountsCascade(state, amount);
      recordGoalTransaction(state, {
        concept: `Abono a ${targetGoal.name}`,
        type: 'ahorro',
        tipo: 'Ahorro',
        amount,
      });
      state.lastError = null;
    },

    retirarGoal: (state, action: PayloadAction<GoalTransferPayload>) => {
      const targetGoal = state.goals.find((g) => g.id === action.payload.goalId);
      if (!targetGoal) {
        state.lastError = 'Apartado no encontrado.';
        return;
      }

      if (!isValidPositiveNumber(action.payload.amount)) {
        state.lastError = 'El monto a retirar debe ser mayor a 0.';
        return;
      }
      const amount = roundMoney(action.payload.amount);
      if (amount <= 0) {
        state.lastError = 'El monto a retirar debe ser mayor a 0.';
        return;
      }

      if (amount > targetGoal.saved) {
        state.lastError = 'El monto excede el capital acumulado en este apartado.';
        return;
      }

      targetGoal.saved = Math.max(0, roundMoney(targetGoal.saved - amount));
      addToDebitLiquidAccount(state, amount);
      recordGoalTransaction(state, {
        concept: `Retiro de ${targetGoal.name}`,
        type: 'ingreso',
        tipo: 'Retiro Ahorro',
        amount,
      });
      state.lastError = null;
    },

    releaseGoal: (state, action: PayloadAction<string>) => {
      const idx = state.goals.findIndex((g) => g.id === action.payload);
      if (idx === -1) {
        state.lastError = 'Apartado no encontrado.';
        return;
      }

      const targetGoal = state.goals[idx];
      state.goals.splice(idx, 1);

      if (targetGoal.saved > 0) {
        const releasedAmount = roundMoney(targetGoal.saved);
        addToDebitLiquidAccount(state, releasedAmount);
        recordGoalTransaction(state, {
          concept: `Retiro por liberación de ${targetGoal.name}`,
          type: 'ingreso',
          tipo: 'Retiro Ahorro',
          amount: releasedAmount,
        });
      }

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
  addGoal,
  updateGoal,
  abonarGoal,
  retirarGoal,
  releaseGoal,
} = financeSlice.actions;

export default financeSlice.reducer;

/* ───────── Selectores memoizados ───────── */

const selectLiquidAccountsRaw = (state: RootState) => state.finance.liquidAccounts;
const selectGoalsRaw = (state: RootState) => state.finance.goals;
const selectCardsRaw = (state: RootState) => state.finance.cards;
const selectTransactionsRaw = (state: RootState) => state.finance.transactions;

export const selectBudgets = (state: RootState) => state.finance.budgets;
export const selectFinanceError = (state: RootState) => state.finance.lastError;
export const selectGoals = createSelector([selectGoalsRaw], (goals) => goals);

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
