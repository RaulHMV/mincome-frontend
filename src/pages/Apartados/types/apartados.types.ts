import type { FormEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Goal, GoalIcon } from '../../../types';

export type TransferMode = 'abonar' | 'retirar';

export type TransferDialogState = {
  goalId: string;
  mode: TransferMode;
} | null;

export interface GoalIconOption {
  id: GoalIcon;
  label: string;
  icon: LucideIcon;
}

export interface ApartadosHeaderProps {
  goalsCount: number;
  maxGoals: number;
  onOpenCreate: () => void;
}

export interface ApartadosSummaryCardsProps {
  freeBalance: number;
  totalSaved: number;
  totalNetWorth: number;
  goalsCount: number;
}

export interface GoalCardProps {
  goal: Goal;
  onOpenTransfer: (goalId: string, mode: TransferMode) => void;
  onOpenEdit: (goal: Goal) => void;
  onRelease: (goal: Goal) => void;
}

export interface GoalIconPickerProps {
  selectedIcon: GoalIcon;
  onSelect: (icon: GoalIcon) => void;
  variant?: 'create' | 'edit';
}

export interface GoalTransferModalProps {
  dialog: TransferDialogState;
  goal: Goal | undefined;
  freeBalance: number;
  amount: string;
  amountValue: number;
  maxAmount: number;
  isInvalid: boolean;
  error: string | null;
  onAmountChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export interface CreateGoalModalProps {
  isOpen: boolean;
  goalsCount: number;
  maxGoals: number;
  isLimitReached: boolean;
  freeBalance: number;
  name: string;
  target: string;
  initialAmount: string;
  targetNum: number;
  initialNum: number;
  selectedIcon: GoalIcon;
  error: string | null;
  onNameChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onInitialAmountChange: (value: string) => void;
  onIconSelect: (icon: GoalIcon) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export interface EditGoalModalProps {
  editingGoal: Goal | null;
  name: string;
  target: string;
  targetNum: number;
  selectedIcon: GoalIcon;
  error: string | null;
  onNameChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onIconSelect: (icon: GoalIcon) => void;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}
