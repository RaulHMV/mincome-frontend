import type { CalendarDisplayEvent, CalendarSimulationField } from '../../../store/slices/calendarSlice';

export type CalendarMobileTab = 'calendario' | 'proyecciones';

export interface CalendarCellData {
  date: Date;
  isCurrentMonth: boolean;
}

export type SimulationFieldErrors = Partial<Record<CalendarSimulationField, string>>;

export interface MobileTabSwitcherProps {
  activeTab: CalendarMobileTab;
  onTabChange: (tab: CalendarMobileTab) => void;
}

export interface DayDetailPopoverProps {
  date: Date;
  events: CalendarDisplayEvent[];
  saldoBaseFecha: number;
  isRightSide: boolean;
  isBottomSide: boolean;
  onClose: () => void;
}

export interface DayDetailMobileSheetProps {
  isOpen: boolean;
  selectedDate: Date;
  events: CalendarDisplayEvent[];
  saldoBaseFecha: number;
  onClose: () => void;
}

export interface CalendarGridProps {
  visibleOnMobile: boolean;
  monthLabel: string;
  cells: CalendarCellData[];
  selectedDate: Date;
  today: Date;
  events: CalendarDisplayEvent[];
  verDetalleDia: boolean;
  saldoBaseFecha: number;
  onSelectDay: (date: Date) => void;
  onCloseDetail: () => void;
  onGoToToday: () => void;
  onMoveMonth: (direction: -1 | 1) => void;
}

export interface ProjectionSimulatorPanelProps {
  visibleOnMobile: boolean;
  dineroExtra: string;
  gastoImprevisto: string;
  ahorroDiario: string;
  cuotaDiaria: number;
  alcanciaProyectada: number;
  libreParaGastar: number;
  diaSeleccionado: number;
  mesNombre: string;
  fieldErrors: SimulationFieldErrors;
  onFieldChange: (field: CalendarSimulationField, value: string) => void;
  onReset: () => void;
}
