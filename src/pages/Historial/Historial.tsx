import HistorialFiltersBar from './Components/HistorialFiltersBar';
import HistorialKpis from './Components/HistorialKpis';
import HistorialResultsTable from './Components/HistorialResultsTable';
import { useHistorial } from './hooks/useHistorial';

/** Vista de consulta histórica y filtrado avanzado de movimientos financieros (RF8). */
export default function Historial() {
  const {
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
  } = useHistorial();

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Cabecera */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202B33] tracking-tight">
            Historial
          </h1>
          <p className="text-xs sm:text-sm text-[#778089] mt-0.5">
            Busca y filtra todos tus movimientos pasados.
          </p>
        </div>
      </div>

      {/* 2. Tarjetas métricas dinámicas */}
      <HistorialKpis metrics={metrics} />

      {/* 3. Barra de búsqueda y filtros */}
      <HistorialFiltersBar
        cuentaFiltro={cuentaFiltro}
        searchTerm={searchTerm}
        periodo={periodo}
        showFilters={showFilters}
        filters={filters}
        onSearchChange={handleSearchChange}
        onPeriodoChange={handlePeriodoChange}
        onToggleFilters={toggleShowFilters}
        onUpdateFilters={updateFilters}
        onClearCuentaFiltro={clearCuentaFiltro}
        onResetAll={resetAllFilters}
      />

      {/* 4. Tabla de resultados y paginación */}
      <HistorialResultsTable
        totalResults={totalResults}
        paginatedItems={paginatedItems}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
