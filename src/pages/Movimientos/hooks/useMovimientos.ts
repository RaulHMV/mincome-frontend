import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  removeTransaction,
  selectAllTransactions,
  selectMovimientosTotals,
  updateTransaction,
} from '../../../store/slices/financeSlice';
import type { Transaction } from '../../../types';
import { MOVIMIENTOS_PAGE_SIZE } from '../Constants/movimientosConstants';
import { extractMetaNameFromSavingsConcept } from '../functions/movimientosHelpers';
import type { MovimientosTab } from '../types/movimientos.types';

/** Hook de estado, filtros, paginación y acciones CRUD para el módulo de Movimientos. */
export function useMovimientos() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const movements = useAppSelector(selectAllTransactions);
  const totals = useAppSelector(selectMovimientosTotals);

  const [filter, setFilter] = useState<MovimientosTab>('Todos');
  const [page, setPage] = useState(1);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const filteredMovements = useMemo(
    () =>
      movements.filter((m) => {
        if (filter === 'Todos') return true;
        if (filter === 'Gastos') return m.type === 'gasto';
        if (filter === 'Ingresos') return m.type === 'ingreso';
        if (filter === 'Ahorros') return m.type === 'ahorro';
        return true;
      }),
    [movements, filter],
  );

  const pages = Math.max(1, Math.ceil(filteredMovements.length / MOVIMIENTOS_PAGE_SIZE));
  const current = Math.min(page, pages);

  const visible = useMemo(
    () =>
      filteredMovements.slice(
        (current - 1) * MOVIMIENTOS_PAGE_SIZE,
        current * MOVIMIENTOS_PAGE_SIZE,
      ),
    [filteredMovements, current],
  );

  const handleFilterChange = (tab: MovimientosTab) => {
    setFilter(tab);
    setPage(1);
  };

  const handleEdit = (tx: Transaction) => {
    const isAhorro = tx.type === 'ahorro' || tx.category.toLowerCase() === 'ahorro';
    if (isAhorro) {
      const metaName = extractMetaNameFromSavingsConcept(tx.concept || tx.concepto || '');
      navigate(`/apartados?editMeta=${encodeURIComponent(metaName)}`);
      return;
    }
    setEditingTx(tx);
  };

  const handleSaveEdit = (updatedTx: Transaction) => {
    dispatch(updateTransaction(updatedTx));
    setEditingTx(null);
  };

  const handleDeleteRequest = (id: string) => {
    const tx = movements.find((item) => item.id === id) ?? null;
    setDeletingTx(tx);
  };

  const handleConfirmDelete = () => {
    if (!deletingTx) return;
    dispatch(removeTransaction(deletingTx.id));
    setDeletingTx(null);
  };

  return {
    totals,
    filter,
    current,
    pages,
    visible,
    editingTx,
    deletingTx,
    setPage,
    setEditingTx,
    setDeletingTx,
    handleFilterChange,
    handleEdit,
    handleSaveEdit,
    handleDeleteRequest,
    handleConfirmDelete,
  };
}

