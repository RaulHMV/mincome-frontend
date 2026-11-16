import { cn, formatMXN } from '../../../lib/utils';
import {
  formatEventAmountLabel,
  getEventTitle,
  resolveEventKind,
} from '../functions/calendarHelpers';
import type { DayDetailPopoverProps } from '../types/calendar.types';

export default function DayDetailPopover({
  date,
  events,
  saldoBaseFecha,
  isRightSide,
  isBottomSide,
  onClose,
}: DayDetailPopoverProps) {
  const mesNombre = date.toLocaleDateString('es-MX', { month: 'long' });

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'hidden sm:block absolute z-40 w-[270px] bg-white border border-zinc-200/90 rounded-xl shadow-lg p-3 animate-in fade-in zoom-in-95 duration-150 cursor-default select-text',
        isRightSide ? 'right-0' : 'left-0',
        isBottomSide ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
      )}
    >
      {/* Micro-cabecera */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 shrink-0" />
          <span className="text-xs font-bold text-zinc-900 capitalize truncate">
            {date.getDate()} de {mesNombre}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-zinc-400 hover:text-zinc-700 h-4 w-4 rounded text-[11px] flex items-center justify-center transition shrink-0 cursor-pointer"
          aria-label="Cerrar detalle"
        >
          ✕
        </button>
      </div>

      {/* Lista de eventos contextual */}
      {events.length > 0 ? (
        <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-0.5">
          {events.map((ev) => {
            const kind = resolveEventKind(ev);
            const isIngreso = kind === 'ingreso';
            const isCorte = kind === 'corte';

            return (
              <div
                key={ev.id}
                className={cn(
                  'p-2 rounded-lg border text-left flex items-start justify-between gap-2',
                  isIngreso
                    ? 'bg-emerald-50/70 border-emerald-200/70'
                    : isCorte
                      ? 'bg-amber-50/70 border-amber-200/70'
                      : 'bg-zinc-50 border-zinc-200/70',
                )}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-xs font-bold truncate leading-snug',
                      isIngreso
                        ? 'text-emerald-900'
                        : isCorte
                          ? 'text-amber-900'
                          : 'text-zinc-900',
                    )}
                  >
                    {getEventTitle(ev)}
                  </p>
                  <p className="text-[10px] text-zinc-500 capitalize">
                    {isIngreso
                      ? 'Ingreso programado'
                      : isCorte
                        ? 'Corte de tarjeta'
                        : 'Gasto recurrente'}
                    {ev.isSimulated ? ' · Simulado' : ''}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-xs font-bold font-mono shrink-0 pt-0.5',
                    isIngreso
                      ? 'text-emerald-700'
                      : isCorte
                        ? 'text-amber-700'
                        : 'text-zinc-700',
                  )}
                >
                  {formatEventAmountLabel(ev)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-2.5 text-center">
          <p className="text-[11px] text-zinc-400">Sin cobros ni pagos programados</p>
        </div>
      )}

      {/* Micro-footer con saldo a esta fecha */}
      <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
        <span className="text-zinc-500 font-medium">Saldo a esta fecha:</span>
        <span className="font-bold text-zinc-900 font-mono">{formatMXN(saldoBaseFecha)}</span>
      </div>
    </div>
  );
}
