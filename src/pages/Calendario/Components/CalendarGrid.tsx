import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CALENDAR_LEGEND_LABELS, WEEK_DAYS } from '../Constants/calendarConstants';
import {
  getEventsForDay,
  getEventTitle,
  resolveEventKind,
  sameDay,
} from '../functions/calendarHelpers';
import type { CalendarGridProps } from '../types/calendar.types';
import DayDetailPopover from './DayDetailPopover';

export default function CalendarGrid({
  visibleOnMobile,
  monthLabel,
  cells,
  selectedDate,
  today,
  events,
  verDetalleDia,
  saldoBaseFecha,
  onSelectDay,
  onCloseDetail,
  onGoToToday,
  onMoveMonth,
}: CalendarGridProps) {
  return (
    <section
      className={cn(
        'sm:col-span-7 xl:col-span-8 flex-col',
        visibleOnMobile ? 'flex' : 'hidden sm:flex',
      )}
    >
      {/* Tarjeta del Calendario */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
        {/* Barra superior del mes */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-zinc-900 capitalize">{monthLabel}</h2>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onGoToToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition cursor-pointer"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => onMoveMonth(-1)}
              aria-label="Mes anterior"
              className="h-7 w-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onMoveMonth(1)}
              aria-label="Mes siguiente"
              className="h-7 w-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 text-center mb-1">
          {WEEK_DAYS.map((d) => (
            <div
              key={d}
              className="text-[10px] font-bold tracking-wider text-zinc-400 py-1 text-center"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Malla de celdas continua (Esquinas cuadradas y bordes compartidos) */}
        <div className="grid grid-cols-7 border border-zinc-200 bg-zinc-200 gap-[1px] rounded-lg relative">
          {cells.map((cell, idx) => {
            const isTopLeft = idx === 0;
            const isTopRight = idx === 6;
            const isBottomLeft = idx === cells.length - 7;
            const isBottomRight = idx === cells.length - 1;

            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={`outside-${cell.date.toISOString()}`}
                  className={cn(
                    'bg-zinc-50/40 min-h-[46px] sm:min-h-[62px] max-h-[68px] p-1 sm:p-1.5 flex flex-col justify-between text-left select-none relative',
                    isTopLeft && 'rounded-tl-[7px]',
                    isTopRight && 'rounded-tr-[7px]',
                    isBottomLeft && 'rounded-bl-[7px]',
                    isBottomRight && 'rounded-br-[7px]',
                  )}
                >
                  <span className="text-[11px] font-semibold text-zinc-300 leading-none">
                    {cell.date.getDate()}
                  </span>
                </div>
              );
            }

            const evs = getEventsForDay(events, cell.date.getDate());
            const isSel = sameDay(cell.date, selectedDate);
            const isToday = sameDay(cell.date, today);

            const colIndex = idx % 7;
            const rowIndex = Math.floor(idx / 7);
            const isRightSide = colIndex >= 4;
            const isBottomSide = rowIndex >= 3;

            return (
              <div
                key={cell.date.toISOString()}
                role="button"
                tabIndex={0}
                onClick={() => onSelectDay(cell.date)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDay(cell.date);
                  }
                }}
                className={cn(
                  'bg-white min-h-[46px] sm:min-h-[62px] max-h-[68px] p-1 sm:p-1.5 flex flex-col justify-between text-left transition select-none relative group cursor-pointer focus:outline-none',
                  isSel
                    ? 'ring-2 ring-inset ring-zinc-900 bg-zinc-50/60 z-30'
                    : isToday
                      ? 'ring-1 ring-inset ring-emerald-600/40 z-0'
                      : 'hover:bg-zinc-50/80 z-0',
                  isTopLeft && 'rounded-tl-[7px]',
                  isTopRight && 'rounded-tr-[7px]',
                  isBottomLeft && 'rounded-bl-[7px]',
                  isBottomRight && 'rounded-br-[7px]',
                )}
              >
                {/* Contenido interior de cada celda */}
                <div className="flex flex-col justify-between h-full w-full select-none">
                  {/* Número del día */}
                  <div className="flex items-center justify-between w-full leading-none">
                    <span
                      className={cn(
                        'text-xs font-semibold leading-none',
                        isSel
                          ? 'text-[#202B33] font-bold'
                          : isToday
                            ? 'text-emerald-700 font-bold'
                            : 'text-slate-600 group-hover:text-[#202B33]',
                      )}
                    >
                      {cell.date.getDate()}
                    </span>
                    {isToday && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"
                        title="Hoy"
                      />
                    )}
                  </div>

                  {/* A) VISTA MÓVIL (< sm): MICRO-PUNTOS LIMPIOS (CERO TEXTOS CORTADOS) */}
                  <div className="flex sm:hidden items-center justify-center gap-1 mt-1">
                    {evs.slice(0, 3).map((ev) => {
                      const kind = resolveEventKind(ev);
                      return (
                        <span
                          key={ev.id}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            kind === 'ingreso'
                              ? 'bg-emerald-500'
                              : kind === 'corte'
                                ? 'bg-amber-500'
                                : 'bg-[#202B33]',
                          )}
                        />
                      );
                    })}
                    {evs.length > 3 && <span className="w-1 h-1 rounded-full bg-slate-400" />}
                  </div>

                  {/* B) VISTA ESCRITORIO (sm: EN ADELANTE): NOTAS Y MONTOS COMPLETOS */}
                  <div className="hidden sm:flex flex-col gap-0.5 mt-1">
                    {evs.slice(0, 2).map((ev) => {
                      const kind = resolveEventKind(ev);
                      return (
                        <div
                          key={ev.id}
                          className={cn(
                            'text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-tight',
                            kind === 'ingreso'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                              : kind === 'corte'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                                : 'bg-slate-100 text-[#202B33] border border-slate-200',
                          )}
                        >
                          {getEventTitle(ev)}
                        </div>
                      );
                    })}
                    {evs.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-semibold pl-0.5">
                        +{evs.length - 2} más
                      </span>
                    )}
                  </div>
                </div>

                {/* Popover anclado flotante (Escritorio sm: en adelante) */}
                {isSel && verDetalleDia && (
                  <DayDetailPopover
                    date={cell.date}
                    events={evs}
                    saldoBaseFecha={saldoBaseFecha}
                    isRightSide={isRightSide}
                    isBottomSide={isBottomSide}
                    onClose={onCloseDetail}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Leyenda inferior */}
        <div className="text-[11px] text-zinc-500 mt-2.5 pt-2 border-t border-zinc-100 flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>{CALENDAR_LEGEND_LABELS.incomes}</span>
          </span>
          <span className="text-zinc-300">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-700 shrink-0" />
            <span>{CALENDAR_LEGEND_LABELS.expenses}</span>
          </span>
          <span className="text-zinc-300">·</span>
          <span>
            Hoy: {today.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>
    </section>
  );
}
