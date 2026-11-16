import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatMXN } from '../../../lib/utils';
import type { UpcomingCardDateRow } from '../types/tarjetas.types';

interface UpcomingDatesTableProps {
  rows: UpcomingCardDateRow[];
}

/** Tabla inferior "Fechas que importan" (Conexión con Calendario RF5). */
export default function UpcomingDatesTable({ rows }: UpcomingDatesTableProps) {
  return (
    <section className="space-y-2.5 pt-1">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#202B33]">
            Fechas que importan
          </h2>
          <p className="text-xs text-[#778089]">
            Control consolidado de cortes y pagos para no generar intereses.
          </p>
        </div>
        <Link
          to="/calendario"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#202B33] transition"
        >
          <span>Ver calendario</span>
          <ArrowRight className="h-3.5 w-3.5 stroke-[1.5]" />
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-[#F8FAFC]/70">
            <tr>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tarjeta
              </th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Próximo corte
              </th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Fecha de pago
              </th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                Pago para no generar intereses
              </th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Días restantes
              </th>
              <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-xs text-[#778089]">
                  No hay tarjetas de crédito registradas para mostrar.
                </td>
              </tr>
            ) : (
              rows.map(({ card, cutDay, dueDay, daysUntilDue, hasDebt }) => (
                <tr key={card.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-[13px] font-semibold text-[#202B33]">
                      {card.alias}
                    </div>
                    <div className="text-[11px] text-[#778089] flex items-center gap-1.5 mt-0.5">
                      <span>{card.banco || card.bank}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-slate-500">
                        •••• {card.terminacion || card.last4}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-slate-600">
                    Día {cutDay} de cada mes
                  </td>
                  <td className="py-3 px-4 text-[13px] text-slate-600">
                    Día {dueDay} de cada mes
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[13px] font-bold tabular-nums text-[#202B33]">
                      {formatMXN(card.used)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[11px] font-semibold text-slate-700 tabular-nums">
                      {daysUntilDue} días
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {hasDebt ? (
                      <span className="inline-flex items-center rounded-md border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        Pendiente
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Al corriente
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
