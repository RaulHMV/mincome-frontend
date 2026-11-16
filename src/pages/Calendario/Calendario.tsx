import CalendarGrid from './Components/CalendarGrid';
import DayDetailMobileSheet from './Components/DayDetailMobileSheet';
import MobileTabSwitcher from './Components/MobileTabSwitcher';
import ProjectionSimulatorPanel from './Components/ProjectionSimulatorPanel';
import { getEventsForDay } from './functions/calendarHelpers';
import { useCalendarSimulator } from './hooks/useCalendarSimulator';

export default function Calendario() {
  const {
    today,
    monthLabel,
    mesNombre,
    cells,
    selectedDate,
    events,
    verDetalleDia,
    activeTab,
    simulation,
    projectedSummary,
    fieldErrors,
    setActiveTab,
    handleSelectDay,
    handleCloseDetail,
    handleGoToToday,
    handleMoveMonth,
    handleSimulationFieldChange,
    handleResetSimulation,
  } = useCalendarSimulator();

  const selectedDayEvents = getEventsForDay(events, selectedDate.getDate());

  return (
    <div className="py-2.5 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* 1. CABECERA GENERAL DE LA PÁGINA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202B33] tracking-tight">Calendario</h1>
          <p className="text-xs sm:text-sm text-[#778089] mt-0.5">
            Anticipa tus pagos y explora cómo puede cambiar tu mes.
          </p>
        </div>
      </div>

      {/* SEGMENTED CONTROL EXCLUSIVO MÓVIL (< sm) */}
      <MobileTabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
        {/* 2. COLUMNA IZQUIERDA: CALENDARIO */}
        <CalendarGrid
          visibleOnMobile={activeTab === 'calendario'}
          monthLabel={monthLabel}
          cells={cells}
          selectedDate={selectedDate}
          today={today}
          events={events}
          verDetalleDia={verDetalleDia}
          saldoBaseFecha={projectedSummary.saldoBaseFecha}
          onSelectDay={handleSelectDay}
          onCloseDetail={handleCloseDetail}
          onGoToToday={handleGoToToday}
          onMoveMonth={handleMoveMonth}
        />

        {/* 3. PANEL DERECHO: TARJETA DE PROYECCIÓN CON VISOR VERDE OLIVO */}
        <ProjectionSimulatorPanel
          visibleOnMobile={activeTab === 'proyecciones'}
          dineroExtra={simulation.dineroExtra}
          gastoImprevisto={simulation.gastoImprevisto}
          ahorroDiario={simulation.ahorroDiario}
          cuotaDiaria={projectedSummary.cuotaDiaria}
          alcanciaProyectada={projectedSummary.alcanciaProyectada}
          libreParaGastar={projectedSummary.libreParaGastar}
          diaSeleccionado={projectedSummary.diaSeleccionado}
          mesNombre={mesNombre}
          fieldErrors={fieldErrors}
          onFieldChange={handleSimulationFieldChange}
          onReset={handleResetSimulation}
        />
      </div>

      {/* Bottom Sheet Móvil Flotante (<sm) con Portal */}
      <DayDetailMobileSheet
        isOpen={verDetalleDia}
        selectedDate={selectedDate}
        events={selectedDayEvents}
        saldoBaseFecha={projectedSummary.saldoBaseFecha}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
