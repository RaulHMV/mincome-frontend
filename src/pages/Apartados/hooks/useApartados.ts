import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatMXN } from '../../../lib/utils';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  abonarGoal,
  addGoal,
  clearFinanceError,
  releaseGoal,
  retirarGoal,
  selectGoals,
  selectGoalsSummary,
  selectLiquidBalance,
  selectTotalNetWorth,
  updateGoal,
} from '../../../store/slices/financeSlice';
import type { Goal, GoalIcon } from '../../../types';
import { MAX_GOAL_NAME_LENGTH, MAX_GOALS } from '../Constants/apartadosConstants';
import type { TransferDialogState, TransferMode } from '../types/apartados.types';

function parseNumericInput(raw: string): number {
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function hasDuplicateGoalName(goals: Goal[], name: string, excludeId?: string): boolean {
  const normalized = name.trim().toLowerCase();
  return goals.some((g) => g.id !== excludeId && g.name.trim().toLowerCase() === normalized);
}

interface EditGoalDraft {
  goalId: string;
  name: string;
  target: string;
  icon: GoalIcon;
  error: string | null;
}

export function useApartados() {
  const dispatch = useAppDispatch();
  const goals = useAppSelector(selectGoals);
  const freeBalance = useAppSelector(selectLiquidBalance);
  const goalsSummary = useAppSelector(selectGoalsSummary);
  const totalNetWorth = useAppSelector(selectTotalNetWorth);

  const [searchParams, setSearchParams] = useSearchParams();
  const editMetaParam = searchParams.get('editMeta');

  // Estado del modal de transferencia (+ Abonar / - Retirar)
  const [dialog, setDialog] = useState<TransferDialogState>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);

  // Estado del modal "Nueva meta de ahorro"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createTarget, setCreateTarget] = useState('');
  const [createInitial, setCreateInitial] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<GoalIcon>('ahorro');
  const [createError, setCreateError] = useState<string | null>(null);

  // Estado del modal "Editar meta de ahorro" (soporta apertura manual o por ?editMeta=)
  const [manualEditingGoalId, setManualEditingGoalId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditGoalDraft | null>(null);

  const urlMatchedGoal = useMemo(() => {
    if (!editMetaParam || goals.length === 0) return null;
    const targetParam = editMetaParam.toLowerCase().trim();
    return (
      goals.find((g) => {
        const nameLower = g.name.toLowerCase().trim();
        return (
          nameLower === targetParam ||
          nameLower.includes(targetParam) ||
          targetParam.includes(nameLower)
        );
      }) ?? null
    );
  }, [editMetaParam, goals]);

  const editingGoal = useMemo(() => {
    if (manualEditingGoalId) {
      return goals.find((g) => g.id === manualEditingGoalId) ?? null;
    }
    return urlMatchedGoal;
  }, [goals, manualEditingGoalId, urlMatchedGoal]);

  const activeEditDraft: EditGoalDraft | null = editingGoal
    ? editDraft && editDraft.goalId === editingGoal.id
      ? editDraft
      : {
          goalId: editingGoal.id,
          name: editingGoal.name,
          target: editingGoal.target.toString(),
          icon: editingGoal.icon,
          error: null,
        }
    : null;

  const editName = activeEditDraft?.name ?? '';
  const editTarget = activeEditDraft?.target ?? '';
  const editIcon: GoalIcon = activeEditDraft?.icon ?? 'ahorro';
  const editError = activeEditDraft?.error ?? null;
  const editTargetNum = parseNumericInput(editTarget);

  // Bloqueo total de scroll de fondo cuando cualquier modal esté abierto
  useEffect(() => {
    const isAnyModalOpen = isCreateModalOpen || Boolean(editingGoal) || Boolean(dialog);
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCreateModalOpen, editingGoal, dialog]);

  const clearEditMetaSearchParam = () => {
    if (searchParams.has('editMeta')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('editMeta');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const openEditModal = (goalToEdit: Goal) => {
    dispatch(clearFinanceError());
    setManualEditingGoalId(goalToEdit.id);
    setEditDraft({
      goalId: goalToEdit.id,
      name: goalToEdit.name,
      target: goalToEdit.target.toString(),
      icon: goalToEdit.icon,
      error: null,
    });
  };

  const closeEditModal = () => {
    setManualEditingGoalId(null);
    setEditDraft(null);
    clearEditMetaSearchParam();
  };

  const updateEditDraft = (patch: Partial<Omit<EditGoalDraft, 'goalId'>>) => {
    if (!editingGoal) return;
    setEditDraft((prev) => {
      const base: EditGoalDraft =
        prev && prev.goalId === editingGoal.id
          ? prev
          : {
              goalId: editingGoal.id,
              name: editingGoal.name,
              target: editingGoal.target.toString(),
              icon: editingGoal.icon,
              error: null,
            };
      return {
        ...base,
        ...patch,
      };
    });
  };

  const handleSaveEdit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingGoal) return;

    const cleanName = editName.trim();
    if (!cleanName) {
      updateEditDraft({ error: 'Ingresa un nombre para la meta.' });
      return;
    }
    if (cleanName.length > MAX_GOAL_NAME_LENGTH) {
      updateEditDraft({
        error: `El nombre no puede exceder ${MAX_GOAL_NAME_LENGTH} caracteres.`,
      });
      return;
    }
    if (hasDuplicateGoalName(goals, cleanName, editingGoal.id)) {
      updateEditDraft({ error: 'Ya existe otro apartado con ese nombre.' });
      return;
    }
    if (editTargetNum <= 0) {
      updateEditDraft({ error: 'El monto objetivo debe ser mayor a 0.' });
      return;
    }

    dispatch(
      updateGoal({
        id: editingGoal.id,
        name: cleanName,
        target: editTargetNum,
        icon: editIcon,
      }),
    );

    closeEditModal();
  };

  // Transferencias (+ Abonar / - Retirar)
  const activeTransferGoal = dialog ? goals.find((g) => g.id === dialog.goalId) : undefined;
  const transferValue = parseNumericInput(transferAmount);
  const transferMax =
    dialog?.mode === 'abonar' ? freeBalance : (activeTransferGoal?.saved ?? 0);
  const isTransferInvalid = transferValue <= 0 || transferValue > transferMax;

  const openTransferDialog = (goalId: string, mode: TransferMode) => {
    dispatch(clearFinanceError());
    setDialog({ goalId, mode });
    setTransferAmount('');
    setTransferError(null);
  };

  const closeTransferDialog = () => {
    setDialog(null);
    setTransferAmount('');
    setTransferError(null);
  };

  const handleTransferAmountChange = (value: string) => {
    setTransferAmount(value);
    setTransferError(null);
  };

  const confirmTransfer = () => {
    if (!dialog || !activeTransferGoal) return;

    if (transferValue <= 0) {
      setTransferError('Ingresa un monto mayor a 0.');
      return;
    }
    if (transferValue > transferMax) {
      setTransferError(
        dialog.mode === 'abonar'
          ? `El monto excede tu Saldo Libre (${formatMXN(transferMax)})`
          : `El monto excede el capital acumulado (${formatMXN(transferMax)})`,
      );
      return;
    }

    if (dialog.mode === 'abonar') {
      dispatch(abonarGoal({ goalId: activeTransferGoal.id, amount: transferValue }));
    } else {
      dispatch(retirarGoal({ goalId: activeTransferGoal.id, amount: transferValue }));
    }

    closeTransferDialog();
  };

  // Liberar y completar meta
  const handleReleaseGoal = (goalToRelease: Goal) => {
    dispatch(releaseGoal(goalToRelease.id));
    if (dialog?.goalId === goalToRelease.id) {
      closeTransferDialog();
    }
    if (editingGoal?.id === goalToRelease.id) {
      closeEditModal();
    }
  };

  // Crear nueva meta de ahorro
  const isLimitReached = goals.length >= MAX_GOALS;
  const createTargetNum = parseNumericInput(createTarget);
  const createInitialNum = parseNumericInput(createInitial);

  const openCreateModal = () => {
    dispatch(clearFinanceError());
    setCreateName('');
    setCreateTarget('');
    setCreateInitial('');
    setSelectedIcon('ahorro');
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateError(null);
  };

  const handleCreateGoal = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (goals.length >= MAX_GOALS) {
      setCreateError(`Puedes mantener un máximo de ${MAX_GOALS} apartados activos.`);
      return;
    }

    const cleanName = createName.trim();
    if (!cleanName) {
      setCreateError('Ingresa un nombre para la meta.');
      return;
    }
    if (cleanName.length > MAX_GOAL_NAME_LENGTH) {
      setCreateError(`El nombre no puede exceder ${MAX_GOAL_NAME_LENGTH} caracteres.`);
      return;
    }
    if (hasDuplicateGoalName(goals, cleanName)) {
      setCreateError('Ya existe un apartado con ese nombre.');
      return;
    }
    if (createTargetNum <= 0) {
      setCreateError('El monto objetivo debe ser mayor a 0.');
      return;
    }
    if (createInitialNum < 0) {
      setCreateError('La asignación inicial no puede ser negativa.');
      return;
    }
    if (createInitialNum > freeBalance) {
      setCreateError(
        `La asignación inicial no puede superar el Saldo Libre (${formatMXN(freeBalance)}).`,
      );
      return;
    }
    if (createInitialNum > createTargetNum) {
      setCreateError('La asignación inicial no puede superar el monto objetivo.');
      return;
    }

    dispatch(
      addGoal({
        name: cleanName,
        target: createTargetNum,
        initialAmount: createInitialNum,
        icon: selectedIcon,
      }),
    );

    setCreateName('');
    setCreateTarget('');
    setCreateInitial('');
    setSelectedIcon('ahorro');
    setCreateError(null);
    setIsCreateModalOpen(false);
  };

  return {
    goals,
    freeBalance,
    totalSaved: goalsSummary.totalSaved,
    totalNetWorth,
    isLimitReached,
    // Transfer modal
    dialog,
    activeTransferGoal,
    transferAmount,
    transferValue,
    transferMax,
    isTransferInvalid,
    transferError,
    openTransferDialog,
    closeTransferDialog,
    handleTransferAmountChange,
    confirmTransfer,
    // Release goal
    handleReleaseGoal,
    // Create modal
    isCreateModalOpen,
    createName,
    createTarget,
    createInitial,
    createTargetNum,
    createInitialNum,
    selectedIcon,
    createError,
    openCreateModal,
    closeCreateModal,
    setCreateName: (value: string) => {
      setCreateName(value);
      setCreateError(null);
    },
    setCreateTarget: (value: string) => {
      setCreateTarget(value);
      setCreateError(null);
    },
    setCreateInitial: (value: string) => {
      setCreateInitial(value);
      setCreateError(null);
    },
    setSelectedIcon,
    handleCreateGoal,
    // Edit modal
    editingGoal,
    editName,
    editTarget,
    editTargetNum,
    editIcon,
    editError,
    openEditModal,
    closeEditModal,
    setEditName: (value: string) => updateEditDraft({ name: value, error: null }),
    setEditTarget: (value: string) => updateEditDraft({ target: value, error: null }),
    setEditIcon: (icon: GoalIcon) => updateEditDraft({ icon }),
    handleSaveEdit,
  };
}
