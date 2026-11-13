import { useEffect, useState } from 'react';
import { defaultBudgets } from '../Constants/dashboardConstants';
import type { BudgetItem } from '../types/dashboard.types';

export function useDashboardBudgets(initialBudgets: BudgetItem[] = defaultBudgets) {
  const [budgets] = useState<BudgetItem[]>(initialBudgets);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const saveBudgets = () => setIsModalOpen(false);

  return {
    budgets,
    isModalOpen,
    openModal,
    closeModal,
    saveBudgets,
  };
}

