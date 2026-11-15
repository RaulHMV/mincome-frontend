import { useEffect, useMemo, useState } from 'react';
import { budgetsBatchSchema } from '../../../schemas/finance.schema';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectBudgets, updateBudgetLimits } from '../../../store/slices/financeSlice';
import { MoreHorizontal } from 'lucide-react';
import { CATEGORY_ICON_MAP } from '../Constants/dashboardConstants';
import { calculateBudgetPercentage, getBudgetStatus } from '../functions/dashboardHelpers';
import type { BudgetItem } from '../types/dashboard.types';

export type BudgetFieldErrors = Record<string, string>;

export function useDashboardBudgets() {
  const dispatch = useAppDispatch();
  const rawBudgets = useAppSelector(selectBudgets);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const budgets: BudgetItem[] = useMemo(
    () =>
      rawBudgets.map((b) => {
        const pct = calculateBudgetPercentage(b.spent, b.limit);
        return {
          id: b.category.toLowerCase(),
          name: b.category,
          icon: CATEGORY_ICON_MAP[b.category] ?? MoreHorizontal,
          limit: b.limit,
          spent: b.spent,
          pct,
          status: getBudgetStatus(pct),
        };
      }),
    [rawBudgets],
  );

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const saveBudgets = (
    updatedLimits: Array<{ category: string; limit: number }>,
  ): BudgetFieldErrors | null => {
    const result = budgetsBatchSchema.safeParse(updatedLimits);

    if (!result.success) {
      const errorsByCategory: BudgetFieldErrors = {};
      for (const issue of result.error.issues) {
        const idx = issue.path[0];
        if (typeof idx === 'number') {
          const categoryName = updatedLimits[idx]?.category;
          if (categoryName && !errorsByCategory[categoryName]) {
            errorsByCategory[categoryName] = issue.message;
          }
        }
      }
      if (Object.keys(errorsByCategory).length === 0 && updatedLimits[0]) {
        errorsByCategory[updatedLimits[0].category] =
          result.error.issues[0]?.message ?? 'Revisa los límites ingresados';
      }
      return errorsByCategory;
    }

    dispatch(updateBudgetLimits(result.data));
    setIsModalOpen(false);
    return null;
  };

  return {
    budgets,
    isModalOpen,
    openModal,
    closeModal,
    saveBudgets,
  };
}
