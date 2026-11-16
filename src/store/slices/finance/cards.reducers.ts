import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  cardSchema,
  payCardSchema,
  type CardSchemaValues,
  type PayCardSchemaValues,
} from '../../../schemas/finance.schema';
import {
  TODAY_ISO_DATE,
  type FinanceState,
  type UpdateCardPayload,
} from './finance.types';
import { roundMoney, syncDebitCardBalance } from './financeHelpers';

const addCard: CaseReducer<FinanceState, PayloadAction<CardSchemaValues>> = (
  state,
  action,
) => {
  const candidate: CardSchemaValues =
    action.payload.kind === 'Débito'
      ? {
          alias: action.payload.alias,
          bank: action.payload.bank,
          last4: action.payload.last4,
          kind: 'Débito',
          limit: 0,
          used: 0,
          balance: roundMoney(action.payload.balance ?? 0),
          cutDay: action.payload.cutDay,
          dueDay: action.payload.dueDay,
        }
      : {
          alias: action.payload.alias,
          bank: action.payload.bank,
          last4: action.payload.last4,
          kind: 'Crédito',
          limit: roundMoney(action.payload.limit),
          used: roundMoney(action.payload.used),
          cutDay: action.payload.cutDay,
          dueDay: action.payload.dueDay,
        };

  const parsed = cardSchema.safeParse(candidate);
  if (!parsed.success) {
    state.lastError = parsed.error.issues[0]?.message ?? 'Datos de tarjeta inválidos';
    return;
  }

  const aliasLower = parsed.data.alias.toLowerCase();
  const bankLower = parsed.data.bank.toLowerCase();

  if (state.cards.some((c) => c.alias.trim().toLowerCase() === aliasLower)) {
    state.lastError = 'Ya existe una tarjeta registrada con ese alias.';
    return;
  }

  if (
    state.cards.some(
      (c) =>
        c.bank.trim().toLowerCase() === bankLower &&
        c.last4 === parsed.data.last4,
    )
  ) {
    state.lastError =
      'Ya existe una tarjeta registrada con ese banco y terminación.';
    return;
  }

  state.cards.push({
    id: `card-${Date.now()}`,
    ...parsed.data,
  });
  state.lastError = null;
};

const updateCard: CaseReducer<FinanceState, PayloadAction<UpdateCardPayload>> = (
  state,
  action,
) => {
  const idx = state.cards.findIndex((c) => c.id === action.payload.id);
  if (idx === -1) {
    state.lastError = 'Tarjeta no encontrada.';
    return;
  }

  const current = state.cards[idx];
  const merged = { ...current, ...action.payload.changes };
  const candidate: CardSchemaValues =
    merged.kind === 'Débito'
      ? {
          alias: merged.alias,
          bank: merged.bank,
          last4: merged.last4,
          kind: 'Débito',
          limit: 0,
          used: 0,
          balance: roundMoney(merged.balance ?? 0),
          cutDay: merged.cutDay,
          dueDay: merged.dueDay,
        }
      : {
          alias: merged.alias,
          bank: merged.bank,
          last4: merged.last4,
          kind: 'Crédito',
          limit: roundMoney(merged.limit),
          used: roundMoney(merged.used),
          cutDay: merged.cutDay,
          dueDay: merged.dueDay,
        };

  const parsed = cardSchema.safeParse(candidate);
  if (!parsed.success) {
    state.lastError = parsed.error.issues[0]?.message ?? 'Datos de tarjeta inválidos';
    return;
  }

  const aliasLower = parsed.data.alias.toLowerCase();
  const bankLower = parsed.data.bank.toLowerCase();

  if (
    state.cards.some(
      (c) => c.id !== current.id && c.alias.trim().toLowerCase() === aliasLower,
    )
  ) {
    state.lastError = 'Ya existe otra tarjeta registrada con ese alias.';
    return;
  }

  if (
    state.cards.some(
      (c) =>
        c.id !== current.id &&
        c.bank.trim().toLowerCase() === bankLower &&
        c.last4 === parsed.data.last4,
    )
  ) {
    state.lastError =
      'Ya existe otra tarjeta registrada con ese banco y terminación.';
    return;
  }

  state.cards[idx] = {
    id: current.id,
    ...parsed.data,
  };
  state.lastError = null;
};

const removeCard: CaseReducer<FinanceState, PayloadAction<string>> = (
  state,
  action,
) => {
  const idx = state.cards.findIndex((c) => c.id === action.payload);
  if (idx === -1) {
    state.lastError = 'Tarjeta no encontrada.';
    return;
  }
  state.cards.splice(idx, 1);
  state.lastError = null;
};

const payCreditCard: CaseReducer<
  FinanceState,
  PayloadAction<PayCardSchemaValues>
> = (state, action) => {
  const parsed = payCardSchema.safeParse(action.payload);
  if (!parsed.success) {
    state.lastError = parsed.error.issues[0]?.message ?? 'Datos de pago inválidos';
    return;
  }

  const { cardId, amount, sourceMethod } = parsed.data;
  const pago = roundMoney(amount);

  const card = state.cards.find((c) => c.id === cardId);
  if (!card || card.kind !== 'Crédito') {
    state.lastError = 'Tarjeta de crédito no encontrada.';
    return;
  }

  if (pago > roundMoney(card.used)) {
    state.lastError = 'El monto excede la deuda actual de la tarjeta.';
    return;
  }

  const sourceId = sourceMethod === 'Efectivo' ? 'cash' : 'debit';
  const sourceAccount = state.liquidAccounts.find((a) => a.id === sourceId);
  if (!sourceAccount || roundMoney(sourceAccount.amount) < pago) {
    state.lastError = 'Saldo insuficiente en la cuenta seleccionada';
    return;
  }

  sourceAccount.amount = roundMoney(sourceAccount.amount - pago);
  if (sourceMethod === 'Débito') {
    syncDebitCardBalance(state, -pago);
  }

  card.used = roundMoney(Math.max(0, card.used - pago));

  state.transactions.unshift({
    id: `tx-pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: TODAY_ISO_DATE,
    concept: `Pago tarjeta ${card.alias}`,
    category: 'Otro',
    type: 'gasto',
    method: sourceMethod,
    amount: pago,
    recurring: false,
    cuenta: sourceMethod === 'Efectivo' ? 'Efectivo' : 'Débito Nómina',
  });

  state.lastError = null;
};

export const cardsReducers = {
  addCard,
  updateCard,
  removeCard,
  payCreditCard,
};
