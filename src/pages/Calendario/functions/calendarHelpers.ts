import { TODAY } from '../../../data/mockData';
import { formatMXN } from '../../../lib/utils';
import type { CalendarDisplayEvent } from '../../../store/slices/calendarSlice';
import type { CalendarCellData } from '../types/calendar.types';

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return TODAY;
  const [y, m, d] = iso.split('-').map(Number);
  const parsed = new Date(y, m - 1, d);
  if (parsed.getFullYear() !== y || parsed.getMonth() !== m - 1 || parsed.getDate() !== d) {
    return TODAY;
  }
  return parsed;
}

export function buildMonthCells(year: number, month: number): CalendarCellData[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const prevCells: CalendarCellData[] = Array.from({ length: offset }, (_, i) => {
    const day = prevMonthDays - offset + 1 + i;
    return { date: new Date(year, month - 1, day), isCurrentMonth: false };
  });

  const currentCells: CalendarCellData[] = Array.from({ length: daysInMonth }, (_, i) => ({
    date: new Date(year, month, i + 1),
    isCurrentMonth: true,
  }));

  const totalCount = prevCells.length + currentCells.length;
  const remainder = totalCount % 7 === 0 ? 0 : 7 - (totalCount % 7);
  const nextCells: CalendarCellData[] = Array.from({ length: remainder }, (_, i) => ({
    date: new Date(year, month + 1, i + 1),
    isCurrentMonth: false,
  }));

  return [...prevCells, ...currentCells, ...nextCells];
}

export function sanitizeDecimalInput(rawValue: string): string {
  if (rawValue === '') return '';
  const sanitized = rawValue.replace(/[^0-9.]/g, '');
  const parts = sanitized.split('.');
  return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitized;
}

export function getEventsForDay(
  events: CalendarDisplayEvent[],
  day: number,
): CalendarDisplayEvent[] {
  return events.filter((ev) => ev.day === day);
}

export function resolveEventKind(ev: CalendarDisplayEvent): 'ingreso' | 'corte' | 'pago' {
  if (ev.kind === 'ingreso' || ev.type === 'ingreso') return 'ingreso';
  if (ev.kind === 'corte' || ev.type === 'corte') return 'corte';
  return 'pago';
}

export function getEventTitle(ev: CalendarDisplayEvent): string {
  return ev.title || ev.concepto || ev.concept || '';
}

export function formatEventAmountLabel(ev: CalendarDisplayEvent): string {
  const kind = resolveEventKind(ev);
  if (kind === 'ingreso') return `+${formatMXN(ev.amount)}`;
  if (kind === 'corte') return 'Corte';
  return `-${formatMXN(ev.amount)}`;
}
