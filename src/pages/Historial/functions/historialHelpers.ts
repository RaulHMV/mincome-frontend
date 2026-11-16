import { TODAY } from '../../../data/mockData';
import type { Transaction } from '../../../types';
import type {
  HistorialAdvancedFilters,
  HistorialMetrics,
  HistorialPeriodo,
} from '../types/historial.types';

interface FilterHistorialParams {
  cuentaFiltro: string | null;
  searchTerm: string;
  periodo: HistorialPeriodo;
  filters: HistorialAdvancedFilters;
  referenceDate?: Date;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Normaliza texto eliminando diacríticos y pasando a minúsculas para búsquedas tolerantes a acentos. */
export function normalizeSearchText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function parseTransactionDate(rawDate: string): Date {
  const parts = rawDate.split('-').map(Number);
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(rawDate);
}

/** Filtra movimientos por cuenta/tarjeta URL, texto, periodo rápido y criterios avanzados. */
export function filterHistorialTransactions(
  transactions: Transaction[],
  {
    cuentaFiltro,
    searchTerm,
    periodo,
    filters,
    referenceDate = TODAY,
  }: FilterHistorialParams,
): Transaction[] {
  const normalizedCuenta = cuentaFiltro
    ? normalizeSearchText(cuentaFiltro.trim())
    : '';
  const rawCuentaLower = cuentaFiltro ? cuentaFiltro.trim().toLowerCase() : '';

  const trimmedSearch = searchTerm.trim();
  const rawSearchLower = trimmedSearch.toLowerCase();
  const normalizedSearch = normalizeSearchText(trimmedSearch);

  const hasMin = filters.min.trim() !== '';
  const hasMax = filters.max.trim() !== '';
  const minAmount = hasMin ? Number(filters.min) : NaN;
  const maxAmount = hasMax ? Number(filters.max) : NaN;

  const refStartOfDay = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );
  const ninetyDaysAgo = new Date(refStartOfDay);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  return transactions.filter((t) => {
    // 1. Filtro por Tarjeta / Cuenta / Medio desde URL (?cuenta= o ?medio=)
    if (rawCuentaLower) {
      const cuentaStr = (t.cuenta ?? '').toLowerCase();
      const normCuenta = normalizeSearchText(t.cuenta ?? '');
      const methodStr = (t.method ?? '').toLowerCase();
      const normMethod = normalizeSearchText(t.method ?? '');

      const matchesCuenta =
        cuentaStr.includes(rawCuentaLower) ||
        normCuenta.includes(normalizedCuenta) ||
        methodStr.includes(rawCuentaLower) ||
        normMethod.includes(normalizedCuenta);

      if (!matchesCuenta) return false;
    }

    // 2. Filtro por Buscador de texto
    if (trimmedSearch !== '') {
      const concept = t.concept || t.concepto || '';
      const category = t.category || t.categoria || '';
      const cuenta = t.cuenta ?? '';

      const matchesText =
        concept.toLowerCase().includes(rawSearchLower) ||
        normalizeSearchText(concept).includes(normalizedSearch) ||
        category.toLowerCase().includes(rawSearchLower) ||
        normalizeSearchText(category).includes(normalizedSearch) ||
        (cuenta !== '' &&
          (cuenta.toLowerCase().includes(rawSearchLower) ||
            normalizeSearchText(cuenta).includes(normalizedSearch)));

      if (!matchesText) return false;
    }

    // 3. Filtro por Periodo Temporal respecto a referenceDate
    if (periodo !== 'todo') {
      const txDate = parseTransactionDate(t.date || '');
      if (Number.isNaN(txDate.getTime())) return false;

      if (periodo === 'mes') {
        if (
          txDate.getMonth() !== refStartOfDay.getMonth() ||
          txDate.getFullYear() !== refStartOfDay.getFullYear()
        ) {
          return false;
        }
      } else if (periodo === '3meses') {
        if (txDate < ninetyDaysAgo) return false;
      } else if (periodo === 'año') {
        if (txDate.getFullYear() !== refStartOfDay.getFullYear()) return false;
      }
    }

    // 4. Filtros Avanzados
    if (filters.from && t.date < filters.from) return false;
    if (filters.to && t.date > filters.to) return false;
    if (filters.category !== 'todas' && t.category !== filters.category) return false;
    if (filters.type !== 'todos' && t.type !== filters.type) return false;
    if (filters.method !== 'todos' && t.method !== filters.method) return false;

    const absAmount = Math.abs(t.amount);
    if (hasMin && Number.isFinite(minAmount) && absAmount < minAmount) return false;
    if (hasMax && Number.isFinite(maxAmount) && absAmount > maxAmount) return false;

    return true;
  });
}

/** Calcula ingresos, gastos y balance neto sobre el subconjunto filtrado. */
export function calculateHistorialMetrics(
  results: Transaction[],
): HistorialMetrics {
  let ingresos = 0;
  let gastos = 0;

  for (const tx of results) {
    const absAmount = Math.abs(tx.amount);
    if (tx.type === 'ingreso') ingresos += absAmount;
    else if (tx.type === 'gasto') gastos += absAmount;
  }

  const roundedIngresos = roundMoney(ingresos);
  const roundedGastos = roundMoney(gastos);

  return {
    ingresos: roundedIngresos,
    gastos: roundedGastos,
    balance: roundMoney(roundedIngresos - roundedGastos),
  };
}
