import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn, formatMXN } from '../../../lib/utils';
import {
  formatEventAmountLabel,
  getEventTitle,
  resolveEventKind,
} from '../functions/calendarHelpers';
import type { DayDetailMobileSheetProps } from '../types/calendar.types';

export default function DayDetailMobileSheet({
  isOpen,
  selectedDate,
  events,
  saldoBaseFecha,
  onClose,
}: DayDetailMobileSheetProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  const mesNombre = selectedDate.toLocaleDateString('es-MX', { month: 'long' });

  return createPortal(
    <div className="sm:hidden">
      {/* Backdrop translúcido limpio */}
      <div
        className="fixed inset-0 z-[9998] bg-[#202B33]/60 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Hoja inferior deslizable (Bottom Sheet) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle del día ${selectedDate.getDate()} de ${mesNombre}`}
        className="fixed inset-x-0 bottom-0 z-[9999] bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 max-h-[82vh] flex flex-col animate-in slide-in-from-bottom duration-300"
      >
        {/* Tirador visual de arrastre */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3.5 shrink-0" />

        {/* Cabecera */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Detalle del día
            </span>
            <h3 className="text-base font-bold text-[#202B33] capitalize leading-snug mt-0.5 truncate">
              {selectedDate.toLocaleDateString('es-MX', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition shrink-0 cursor-pointer"
            aria-label="Cerrar detalle"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista de eventos del día con scroll */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {events.length > 0 ? (
            events.map((ev) => {
              const kind = resolveEventKind(ev);
              const isIngreso = kind === 'ingreso';
              const isCorte = kind === 'corte';

              return (
                <div
                  key={ev.id}
                  className={cn(
                    'p-3 rounded-xl border text-left flex items-start justify-between gap-3',
                    isIngreso
                      ? 'bg-emerald-50/70 border-emerald-200/70'
                      : isCorte
                        ? 'bg-amber-50/70 border-amber-200/70'
                        : 'bg-slate-50 border-slate-200/70',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-xs font-bold leading-snug',
                        isIngreso
                          ? 'text-emerald-900'
                          : isCorte
                            ? 'text-amber-900'
                            : 'text-[#202B33]',
                      )}
                    >
                      {getEventTitle(ev)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 capitalize">
                      {isIngreso
                        ? 'Ingreso programado'
                        : isCorte
                          ? 'Corte de tarjeta'
                          : 'Gasto / Pago recurrente'}
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
                          : 'text-[#202B33]',
                    )}
                  >
                    {formatEventAmountLabel(ev)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs">Sin cobros ni pagos programados para este día.</p>
            </div>
          )}
        </div>

        {/* Pie con saldo proyectado y botón de acción */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Saldo a esta fecha</p>
            <p className="text-base sm:text-lg font-bold text-[#202B33] tabular-nums font-mono">
              {formatMXN(saldoBaseFecha)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white text-xs font-semibold transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
