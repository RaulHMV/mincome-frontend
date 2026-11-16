import { useEffect, useMemo, useState } from 'react';
import { TODAY } from '../../../data/mockData';
import { simulationInputsSchema } from '../../../schemas/calendar.schema';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  goToToday,
  resetSimulation,
  selectCalendarCursor,
  selectCalendarEvents,
  selectDate,
  selectProjectedSummary,
  selectSelectedDateIso,
  selectSimulationState,
  setCursor,
  updateSimulationField,
  type CalendarSimulationField,
} from '../../../store/slices/calendarSlice';
import {
  buildMonthCells,
  parseIsoDate,
  sameDay,
  sanitizeDecimalInput,
  toIsoDate,
} from '../functions/calendarHelpers';
import type { CalendarMobileTab, SimulationFieldErrors } from '../types/calendar.types';

export function useCalendarSimulator() {
  const dispatch = useAppDispatch();
  const cursor = useAppSelector(selectCalendarCursor);
  const selectedDateIso = useAppSelector(selectSelectedDateIso);
  const events = useAppSelector(selectCalendarEvents);
  const simulation = useAppSelector(selectSimulationState);
  const projectedSummary = useAppSelector(selectProjectedSummary);

  const [verDetalleDia, setVerDetalleDia] = useState(false);
  const [activeTab, setActiveTab] = useState<CalendarMobileTab>('calendario');

  // Bloquear scroll de fondo cuando el Bottom Sheet móvil esté activo
  useEffect(() => {
    if (verDetalleDia && typeof window !== 'undefined' && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [verDetalleDia]);

  const selectedDate = useMemo(() => parseIsoDate(selectedDateIso), [selectedDateIso]);

  const monthLabel = useMemo(
    () =>
      new Date(cursor.year, cursor.month, 1).toLocaleDateString('es-MX', {
        month: 'long',
        year: 'numeric',
      }),
    [cursor.year, cursor.month],
  );

  const mesNombre = useMemo(
    () => selectedDate.toLocaleDateString('es-MX', { month: 'long' }),
    [selectedDate],
  );

  const cells = useMemo(
    () => buildMonthCells(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const fieldErrors: SimulationFieldErrors = useMemo(() => {
    const parsed = simulationInputsSchema.safeParse({
      dineroExtra: simulation.dineroExtra,
      gastoImprevisto: simulation.gastoImprevisto,
      ahorroDiario: simulation.ahorroDiario,
    });
    if (parsed.success) return {};

    const errors: SimulationFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (
        (field === 'dineroExtra' || field === 'gastoImprevisto' || field === 'ahorroDiario') &&
        !errors[field]
      ) {
        errors[field] = issue.message;
      }
    }
    return errors;
  }, [simulation.dineroExtra, simulation.gastoImprevisto, simulation.ahorroDiario]);

  const handleSelectDay = (date: Date) => {
    if (sameDay(date, selectedDate)) {
      setVerDetalleDia((prev) => !prev);
      return;
    }
    dispatch(selectDate(toIsoDate(date)));
    setVerDetalleDia(true);
  };

  const handleCloseDetail = () => {
    setVerDetalleDia(false);
  };

  const handleGoToToday = () => {
    dispatch(goToToday());
    setVerDetalleDia(true);
  };

  const handleMoveMonth = (direction: -1 | 1) => {
    dispatch(setCursor({ year: cursor.year, month: cursor.month + direction }));
    setVerDetalleDia(false);
  };

  const handleSimulationFieldChange = (field: CalendarSimulationField, rawValue: string) => {
    const sanitized = sanitizeDecimalInput(rawValue);
    dispatch(updateSimulationField({ field, value: sanitized }));
  };

  const handleResetSimulation = () => {
    dispatch(resetSimulation());
  };

  return {
    today: TODAY,
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
  };
}
