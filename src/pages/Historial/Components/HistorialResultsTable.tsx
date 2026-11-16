import { ChevronLeft, ChevronRight } from 'lucide-react';
import TransactionsTable from '../../../components/common/TransactionsTable';
import type { Transaction } from '../../../types';

interface HistorialResultsTableProps {
  totalResults: number;
  paginatedItems: Transaction[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Tabla de resultados de Historial en solo lectura con conteo y paginación. */
export default function HistorialResultsTable({
  totalResults,
  paginatedItems,
  currentPage,
  totalPages,
  onPageChange,
}: HistorialResultsTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
      <div className="border-b border-slate-100 px-4 sm:px-5 py-3 text-xs sm:text-sm text-slate-500 font-medium">
        {totalResults}{' '}
        {totalResults === 1 ? 'resultado encontrado' : 'resultados encontrados'}
      </div>

      <TransactionsTable items={paginatedItems} />

      <div className="flex items-center justify-between border-t border-slate-100 px-4 sm:px-5 py-3 bg-white">
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Página {currentPage} de {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Página anterior"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Página siguiente"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>
    </section>
  );
}
