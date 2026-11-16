import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import TransactionsTable from '../../components/common/TransactionsTable';
import DeleteTransactionModal from './Components/DeleteTransactionModal';
import EditTransactionModal from './Components/EditTransactionModal';
import MovimientosKpis from './Components/MovimientosKpis';
import { MOVIMIENTOS_TABS } from './Constants/movimientosConstants';
import { useMovimientos } from './hooks/useMovimientos';

/** Vista principal de gestión y consulta de movimientos financieros. */
export default function Movimientos() {
  const {
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
  } = useMovimientos();

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Cabecera y Botón idénticos al Dashboard */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202B33] tracking-tight">
            Movimientos
          </h1>
          <p className="text-xs sm:text-sm text-[#778089] mt-0.5">
            Registra y consulta tus ingresos, gastos y ahorros.
          </p>
        </div>

        {/* Botón alineado a la derecha en móvil y desktop (mismas medidas que Dashboard) */}
        <div className="flex justify-end w-full sm:w-auto">
          <Link
            className="h-10 px-4 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white text-xs font-semibold flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98] select-none cursor-pointer leading-none"
            to="/movimientos/nuevo"
          >
            <Plus className="w-4 h-4 stroke-[1.5]" />
            <span>Nuevo Movimiento</span>
          </Link>
        </div>
      </div>

      {/* 2. 3 Tarjetas Superiores */}
      <MovimientosKpis
        totalIngreso={totals.totalIngreso}
        totalGasto={totals.totalGasto}
        totalAhorro={totals.totalAhorro}
      />

      {/* 3. Contenedor de Tabla con Filtros y Componente Reutilizable TransactionsTable */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Barra superior de filtros rápidos */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-2">
          {MOVIMIENTOS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleFilterChange(tab)}
              className={`transition-all duration-150 cursor-pointer ${
                filter === tab
                  ? 'bg-[#E8EBED] text-[#202B33] font-semibold rounded-lg shadow-2xs h-9 px-4 text-xs sm:text-sm select-none'
                  : 'text-[#64748B] hover:bg-[#E8EBED]/70 hover:text-[#202B33] font-medium rounded-lg h-9 px-4 text-xs sm:text-sm transition-colors select-none'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Componente compartido con Historial */}
        <TransactionsTable
          items={visible}
          showActions
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />

        {/* Paginación */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 bg-white">
          <p className="text-sm text-slate-500">
            Página {current} de {pages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
              aria-label="Página anterior"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
              aria-label="Página siguiente"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Modal de edición estandarizado */}
      {editingTx && (
        <EditTransactionModal
          tx={editingTx}
          onClose={() => setEditingTx(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Modal de confirmación destructiva de eliminación */}
      {deletingTx && (
        <DeleteTransactionModal
          tx={deletingTx}
          onClose={() => setDeletingTx(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

