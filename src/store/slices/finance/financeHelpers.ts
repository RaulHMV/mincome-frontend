import { TODAY } from '../../../data/mockData';
import type { BankCard, Goal, LiquidAccount, Transaction } from '../../../types';
import {
  DEFAULT_DEBIT_ACCOUNT_LABEL,
  MAX_GOAL_NAME_LENGTH,
  TODAY_ISO_DATE,
  type FinanceState,
} from './finance.types';

/** Redondea importes monetarios a 2 decimales evitando ruido IEEE-754. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Suma el saldo líquido total de efectivo y cuentas de débito. */
export function getLiquidBalance(accounts: LiquidAccount[]): number {
  return roundMoney(accounts.reduce((sum, acc) => sum + acc.amount, 0));
}

export function isValidPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function isValidNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/** Valida nombre de meta/apartado (no vacío, longitud máxima y unicidad). */
export function validateGoalName(
  goals: Goal[],
  rawName: string,
  excludeId?: string,
): { valid: true; cleanName: string } | { valid: false; error: string } {
  const cleanName = rawName.trim();
  if (!cleanName) {
    return { valid: false, error: 'Ingresa un nombre para la meta.' };
  }
  if (cleanName.length > MAX_GOAL_NAME_LENGTH) {
    return {
      valid: false,
      error: `El nombre no puede exceder ${MAX_GOAL_NAME_LENGTH} caracteres.`,
    };
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

/** Busca una tarjeta por tipo y coincidencia parcial de alias o terminación. */
export function findMatchingCard(
  cards: BankCard[],
  kind: 'Crédito' | 'Débito',
  cuenta?: string,
): BankCard | undefined {
  const sameKind = cards.filter((c) => c.kind === kind);
  if (sameKind.length === 0) return undefined;
  if (!cuenta) return sameKind[0];
  const normalized = cuenta.toLowerCase();
  return (
    sameKind.find(
      (c) =>
        normalized.includes(c.last4.toLowerCase()) ||
        normalized.includes(c.alias.toLowerCase()),
    ) ?? sameKind[0]
  );
}

/** Sincroniza el saldo de la tarjeta de débito principal con cambios de liquidez. */
export function syncDebitCardBalance(state: FinanceState, delta: number): void {
  const debitCard = findMatchingCard(
    state.cards,
    'Débito',
    DEFAULT_DEBIT_ACCOUNT_LABEL,
  );
  if (debitCard && typeof debitCard.balance === 'number') {
    const next = roundMoney(debitCard.balance + delta);
    debitCard.balance = delta < 0 ? Math.max(0, next) : next;
  }
}

/** Descuenta un monto en cascada primero de débito y luego de efectivo. */
export function deductFromLiquidAccountsCascade(
  state: FinanceState,
  amount: number,
): void {
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

/** Abona liquidez a la cuenta de débito principal y sincroniza su tarjeta. */
export function addToDebitLiquidAccount(
  state: FinanceState,
  amount: number,
): void {
  const rounded = roundMoney(amount);
  const debit = state.liquidAccounts.find((a) => a.id === 'debit');
  if (debit) {
    debit.amount = roundMoney(debit.amount + rounded);
  }
  syncDebitCardBalance(state, rounded);
}

/** Registra en el historial un movimiento asociado a abono o retiro de apartado. */
export function recordGoalTransaction(
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

/** Aplica (1) o revierte (-1) los efectos contables de un movimiento sobre presupuestos, liquidez y tarjetas. */
export function applyTransactionSideEffects(
  state: FinanceState,
  tx: Transaction,
  direction: 1 | -1,
): void {
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
        creditCard.used = Math.max(
          0,
          roundMoney(creditCard.used + direction * tx.amount),
        );
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

/** Resuelve la etiqueta de cuenta asociada cuando se edita un movimiento. */
export function resolveUpdatedCuenta(
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
