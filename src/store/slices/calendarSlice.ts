import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { calendarEvents as initialCalendarEvents, TODAY } from '../../data/mockData';
import {
  simulatedMovementSchema,
  simulationAmountInputSchema,
  type SimulatedMovementValues,
} from '../../schemas/calendar.schema';
import type { BankCard, CalendarEvent } from '../../types';
import type { RootState } from '../store';
import { selectLiquidBalance } from './financeSlice';

export type CalendarSimulationField = 'dineroExtra' | 'gastoImprevisto' | 'ahorroDiario';

export type CalendarDisplayEvent = CalendarEvent & {
  isSimulated?: boolean;
};

export interface CalendarCursor {
  year: number;
  month: number;
}

export interface CalendarSimulationState {
  scenarioName: string;
  dineroExtra: string;
  gastoImprevisto: string;
  ahorroDiario: string;
  extraItems: CalendarEvent[];
}

export interface CalendarState {
  events: CalendarEvent[];
  cursor: CalendarCursor;
  selectedDateIso: string;
  simulation: CalendarSimulationState;
  lastError: string | null;
}

export interface ProjectedSummary {
  saldoLibreBase: number;
  diaSeleccionado: number;
  ingresosHastaLaFecha: number;
  gastosHastaLaFecha: number;
  saldoBaseFecha: number;
  cuotaDiaria: number;
  alcanciaProyectada: number;
  libreParaGastar: number;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isValidIsoDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function parseIsoDateSafe(iso: string): Date {
  if (!isValidIsoDate(iso)) return TODAY;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function parseSimulationAmount(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === '') return 0;
  if (!simulationAmountInputSchema.safeParse(trimmed).success) return 0;
  const num = Number(trimmed);
  return Number.isFinite(num) && num >= 0 ? roundMoney(num) : 0;
}

function getEventLabel(ev: CalendarEvent): string {
  return (ev.title || ev.concepto || ev.concept || '').toLowerCase();
}

function isIngresoEvent(ev: CalendarEvent): boolean {
  return ev.kind === 'ingreso' || ev.type === 'ingreso';
}

function isPagoEvent(ev: CalendarEvent): boolean {
  return ev.kind === 'pago' || ev.type === 'pago';
}

function hasCardEventMatch(
  events: CalendarEvent[],
  card: BankCard,
  kind: 'corte' | 'pago',
  day: number,
): boolean {
  const aliasLower = card.alias.trim().toLowerCase();
  return events.some(
    (ev) =>
      ev.kind === kind &&
      ev.day === day &&
      aliasLower.length > 0 &&
      getEventLabel(ev).includes(aliasLower),
  );
}

const TODAY_ISO_DATE = formatDateToIso(TODAY);

const initialState: CalendarState = {
  events: initialCalendarEvents,
  cursor: {
    year: TODAY.getFullYear(),
    month: TODAY.getMonth(),
  },
  selectedDateIso: TODAY_ISO_DATE,
  simulation: {
    scenarioName: 'Escenario base',
    dineroExtra: '',
    gastoImprevisto: '',
    ahorroDiario: '',
    extraItems: [],
  },
  lastError: null,
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setCursor: (state, action: PayloadAction<CalendarCursor>) => {
      const normalized = new Date(action.payload.year, action.payload.month, 1);
      state.cursor = {
        year: normalized.getFullYear(),
        month: normalized.getMonth(),
      };
    },

    selectDate: (state, action: PayloadAction<string>) => {
      if (!isValidIsoDate(action.payload)) {
        state.lastError = 'La fecha seleccionada no es válida';
        return;
      }
      state.selectedDateIso = action.payload;
      state.lastError = null;
    },

    goToToday: (state) => {
      state.cursor = {
        year: TODAY.getFullYear(),
        month: TODAY.getMonth(),
      };
      state.selectedDateIso = TODAY_ISO_DATE;
      state.lastError = null;
    },

    updateSimulationField: (
      state,
      action: PayloadAction<{ field: CalendarSimulationField; value: string }>,
    ) => {
      state.simulation[action.payload.field] = action.payload.value;
      state.lastError = null;
    },

    addSimulatedEvent: (
      state,
      action: PayloadAction<SimulatedMovementValues & { id?: string }>,
    ) => {
      const { id, ...candidate } = action.payload;
      if (id !== undefined && typeof id !== 'string') {
        state.lastError = 'Identificador de movimiento simulado inválido';
        return;
      }

      const parsed = simulatedMovementSchema.safeParse(candidate);
      if (!parsed.success) {
        state.lastError = parsed.error.issues[0]?.message ?? 'Movimiento simulado inválido';
        return;
      }

      const simulatedItem: CalendarEvent = {
        id: id?.trim() || `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        day: parsed.data.day,
        title: parsed.data.title,
        amount: roundMoney(parsed.data.amount),
        kind: parsed.data.kind,
        type: parsed.data.kind,
        concepto: parsed.data.title,
      };

      state.simulation.extraItems.push(simulatedItem);
      state.lastError = null;
    },

    removeSimulatedEvent: (state, action: PayloadAction<string>) => {
      const idx = state.simulation.extraItems.findIndex((ev) => ev.id === action.payload);
      if (idx === -1) return;
      state.simulation.extraItems.splice(idx, 1);
      state.lastError = null;
    },

    resetSimulation: (state) => {
      state.simulation.dineroExtra = '';
      state.simulation.gastoImprevisto = '';
      state.simulation.ahorroDiario = '';
      state.simulation.extraItems = [];
      state.lastError = null;
    },
  },
});

export const {
  setCursor,
  selectDate,
  goToToday,
  updateSimulationField,
  addSimulatedEvent,
  removeSimulatedEvent,
  resetSimulation,
} = calendarSlice.actions;

export default calendarSlice.reducer;

/* ───────── Selectores memoizados ───────── */

const selectBaseEventsRaw = (state: RootState) => state.calendar.events;
const selectExtraItemsRaw = (state: RootState) => state.calendar.simulation.extraItems;
const selectFinanceCardsRaw = (state: RootState) => state.finance.cards;

export const selectCalendarCursor = (state: RootState) => state.calendar.cursor;
export const selectSelectedDateIso = (state: RootState) => state.calendar.selectedDateIso;
export const selectSimulationState = (state: RootState) => state.calendar.simulation;
export const selectCalendarError = (state: RootState) => state.calendar.lastError;

export const selectCalendarEvents = createSelector(
  [selectBaseEventsRaw, selectExtraItemsRaw, selectFinanceCardsRaw],
  (baseEvents, extraItems, cards): CalendarDisplayEvent[] => {
    const baseDisplay: CalendarDisplayEvent[] = baseEvents.map((ev) => ({
      ...ev,
      isSimulated: false,
    }));

    const syncedCardEvents: CalendarDisplayEvent[] = [];

    for (const card of cards) {
      if (card.kind !== 'Crédito') continue;

      if (!hasCardEventMatch(baseEvents, card, 'corte', card.cutDay)) {
        syncedCardEvents.push({
          id: `card-cut-${card.id}`,
          day: card.cutDay,
          title: `Corte ${card.alias}`,
          amount: 0,
          kind: 'corte',
          isSimulated: false,
        });
      }

      if (card.used > 0 && !hasCardEventMatch(baseEvents, card, 'pago', card.dueDay)) {
        syncedCardEvents.push({
          id: `card-due-${card.id}`,
          day: card.dueDay,
          title: `Pago tarjeta ${card.alias}`,
          amount: roundMoney(card.used),
          kind: 'pago',
          isSimulated: false,
        });
      }
    }

    const simulatedDisplay: CalendarDisplayEvent[] = extraItems.map((ev) => ({
      ...ev,
      isSimulated: true,
    }));

    return [...baseDisplay, ...syncedCardEvents, ...simulatedDisplay];
  },
);

export const selectProjectedSummary = createSelector(
  [selectLiquidBalance, selectCalendarEvents, selectSelectedDateIso, selectSimulationState],
  (saldoLibreBase, events, selectedDateIso, simulation): ProjectedSummary => {
    const selectedDate = parseIsoDateSafe(selectedDateIso);
    const diaSeleccionado = selectedDate.getDate();

    const eventosHastaFecha = events.filter((ev) => ev.day <= diaSeleccionado);
    const ingresosHastaLaFecha = roundMoney(
      eventosHastaFecha
        .filter(isIngresoEvent)
        .reduce((sum, ev) => sum + ev.amount, 0),
    );
    const gastosHastaLaFecha = roundMoney(
      eventosHastaFecha
        .filter(isPagoEvent)
        .reduce((sum, ev) => sum + ev.amount, 0),
    );

    const saldoBaseFecha = roundMoney(
      saldoLibreBase + ingresosHastaLaFecha - gastosHastaLaFecha,
    );

    const diaMeta = diaSeleccionado || 1;
    const totalExtra = parseSimulationAmount(simulation.dineroExtra);
    const totalGasto = parseSimulationAmount(simulation.gastoImprevisto);
    const cuotaDiaria = parseSimulationAmount(simulation.ahorroDiario);

    const alcanciaProyectada = roundMoney(cuotaDiaria * diaMeta);
    const libreParaGastar = roundMoney(
      saldoBaseFecha + totalExtra - totalGasto - alcanciaProyectada,
    );

    return {
      saldoLibreBase,
      diaSeleccionado,
      ingresosHastaLaFecha,
      gastosHastaLaFecha,
      saldoBaseFecha,
      cuotaDiaria,
      alcanciaProyectada,
      libreParaGastar,
    };
  },
);
