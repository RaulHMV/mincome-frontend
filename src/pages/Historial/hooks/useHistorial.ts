import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../../store/hooks';
import { selectAllTransactions } from '../../../store/slices/financeSlice';
import {
  EMPTY_HISTORIAL_FILTERS,
  HISTORIAL_PAGE_SIZE,
} from '../Constants/historialConstants';
import {
  calculateHistorialMetrics,
  filterHistorialTransactions,
} from '../functions/historialHelpers';
import type {
  HistorialAdvancedFilters,
  HistorialPeriodo,
} from '../types/historial.types';

/** Hook de estado, búsqueda, filtros avanzados, métricas y paginación para Historial (RF8). */
export function useHistorial() {
  const [searchParams, setSearchParams] = useSearchParams();
  const transactions = useAppSelector(selectAllTransactions);

  const cuentaFiltro = searchParams.get('cuenta') || searchParams.get('medio');

  const [searchTerm, setSearchTerm] = useState('');
  const [periodo, setPeriodo] = useState<HistorialPeriodo>('todo');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<HistorialAdvancedFilters>(
    EMPTY_HISTORIAL_FILTERS,
  );
  const [page, setPage] = useState(1);

  const filteredTransactions = useMemo(
    () =>
      filterHistorialTransactions(transactions, {
        cuentaFiltro,
        searchTerm,
        periodo,
        filters,
      }),
    [transactions, cuentaFiltro, searchTerm, periodo, filters],
  );

  const metrics = useMemo(
    () => calculateHistorialMetrics(filteredTransactions),
    [filteredTransactions],
  );

  const totalResults = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / HISTORIAL_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(
    () =>
      filteredTransactions.slice(
        (currentPage - 1) * HISTORIAL_PAGE_SIZE,
        currentPage * HISTORIAL_PAGE_SIZE,
      ),
    [filteredTransactions, currentPage],
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handlePeriodoChange = (nextPeriodo: HistorialPeriodo) => {
    setPeriodo(nextPeriodo);
    setPage(1);
  };

  const toggleShowFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const updateFilters = (patch: Partial<HistorialAdvancedFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const clearCuentaFiltro = () => {
    setSearchParams({});
    setPage(1);
  };

  const resetAllFilters = () => {
    setFilters(EMPTY_HISTORIAL_FILTERS);
    setSearchTerm('');
    setPeriodo('todo');
    setPage(1);
    setSearchParams({});
  };

  return {
    cuentaFiltro,
    searchTerm,
    periodo,
    showFilters,
    filters,
    metrics,
    totalResults,
    paginatedItems,
    currentPage,
    totalPages,
    handleSearchChange,
    handlePeriodoChange,
    toggleShowFilters,
    updateFilters,
    clearCuentaFiltro,
    resetAllFilters,
    setPage,
  };
}
