import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import type { Goal } from '../../../types';
import {
  MAX_GOALS,
  type AddGoalPayload,
  type FinanceState,
  type GoalTransferPayload,
  type UpdateGoalPayload,
} from './finance.types';
import {
  addToDebitLiquidAccount,
  deductFromLiquidAccountsCascade,
  getLiquidBalance,
  isValidNonNegativeNumber,
  isValidPositiveNumber,
  recordGoalTransaction,
  roundMoney,
  validateGoalName,
} from './financeHelpers';

const addGoal: CaseReducer<FinanceState, PayloadAction<AddGoalPayload>> = (
  state,
  action,
) => {
  if (state.goals.length >= MAX_GOALS) {
    state.lastError = `Puedes mantener un máximo de ${MAX_GOALS} apartados activos.`;
    return;
  }

  const nameValidation = validateGoalName(state.goals, action.payload.name);
  if (!nameValidation.valid) {
    state.lastError =
      'error' in nameValidation
        ? nameValidation.error
        : 'Nombre de apartado inválido.';
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
};

const updateGoal: CaseReducer<FinanceState, PayloadAction<UpdateGoalPayload>> = (
  state,
  action,
) => {
  const targetGoal = state.goals.find((g) => g.id === action.payload.id);
  if (!targetGoal) {
    state.lastError = 'Apartado no encontrado.';
    return;
  }

  const nameValidation = validateGoalName(
    state.goals,
    action.payload.name,
    targetGoal.id,
  );
  if (!nameValidation.valid) {
    state.lastError =
      'error' in nameValidation
        ? nameValidation.error
        : 'Nombre de apartado inválido.';
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
};

const abonarGoal: CaseReducer<
  FinanceState,
  PayloadAction<GoalTransferPayload>
> = (state, action) => {
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
};

const retirarGoal: CaseReducer<
  FinanceState,
  PayloadAction<GoalTransferPayload>
> = (state, action) => {
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
};

const releaseGoal: CaseReducer<FinanceState, PayloadAction<string>> = (
  state,
  action,
) => {
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
};

export const goalsReducers = {
  addGoal,
  updateGoal,
  abonarGoal,
  retirarGoal,
  releaseGoal,
};
