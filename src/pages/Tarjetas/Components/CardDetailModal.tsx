import { createPortal } from 'react-dom';
import { CheckCircle2, CreditCard, PlusCircle, X } from 'lucide-react';
import { cn, formatMXN } from '../../../lib/utils';
import type { BankCard } from '../../../types';
import { CARD_MODAL_BACKDROP_CLASS } from '../Constants/tarjetasConstants';
import {
  getAvailableCredit,
  getCardLimit,
  getCreditUsagePercentage,
  getDaysUntilDue,
  isHealthyCreditUsage,
} from '../functions/tarjetasHelpers';

interface CardDetailModalProps {
  isOpen: boolean;
  card: BankCard | null;
  onClose: () => void;
  onOpenEdit: (card: BankCard) => void;
  onOpenPay: (card: BankCard) => void;
  onAddFunds: (card: BankCard) => void;
  onViewMovements: () => void;
}

/** Modal de detalle completo de tarjeta (Crédito o Débito) cumpliendo RNF3. */
export default function CardDetailModal({
  isOpen,
  card,
  onClose,
  onOpenEdit,
  onOpenPay,
  onAddFunds,
  onViewMovements,
}: CardDetailModalProps) {
  if (!isOpen || !card) return null;

  const isCredit = card.kind === 'Crédito';
  const cardLimit = getCardLimit(card);
  const pct = isCredit ? getCreditUsagePercentage(card.used, cardLimit) : 0;
  const days = getDaysUntilDue(card);
  const isHealthy = isHealthyCreditUsage(pct);
  const availableCredit = getAvailableCredit(card);
  const bankLabel = card.banco || card.bank;
  const last4Label = card.terminacion || card.last4;
  const cutDay = card.diaCorte ?? card.cutDay;
  const dueDay = card.diaLimitePago ?? card.dueDay;

  return createPortal(
    <div className={CARD_MODAL_BACKDROP_CLASS}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de tarjeta ${card.alias}`}
        className="w-full bg-white p-6 shadow-2xl max-w-lg rounded-3xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">
              {bankLabel}
            </p>
            <h2 className="text-lg font-bold text-zinc-900 leading-tight">
              {card.alias}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {isCredit ? (
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
                Crédito
              </span>
            ) : (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Débito
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal de detalle"
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Representación esquemática del plástico */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-700/50 bg-[#202B33] p-4 text-white shadow-md">
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span className="font-semibold tracking-wider uppercase text-zinc-300">
              {bankLabel}
            </span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-medium tracking-widest text-zinc-200">
              {isCredit ? 'CRÉDITO' : 'DÉBITO'}
            </span>
          </div>
          <div className="my-4 flex items-center gap-3">
            <div className="h-5 w-7 rounded bg-amber-400/90 border border-amber-300/60 flex items-center justify-center">
              <div className="h-2.5 w-3.5 border border-amber-700/50 rounded-xs" />
            </div>
            <span className="font-mono text-sm sm:text-base font-semibold tracking-widest text-zinc-100">
              •••• •••• •••• {last4Label}
            </span>
          </div>
          <div className="flex items-end justify-between text-xs">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Alias
              </p>
              <p className="font-medium text-zinc-200">{card.alias}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                {isCredit ? 'Línea de Crédito' : 'Cuenta de Débito'}
              </p>
              <p className="font-bold text-white tabular-nums">
                {isCredit ? formatMXN(cardLimit) : formatMXN(card.balance ?? 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Crédito o Débito */}
        {isCredit ? (
          <div className="space-y-3.5">
            {/* Rejilla métricas crédito */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 text-center">
                <p className="text-[10px] text-zinc-500 font-medium">
                  Límite Total
                </p>
                <p className="text-xs sm:text-sm font-bold text-zinc-900 mt-0.5 tabular-nums">
                  {formatMXN(cardLimit)}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 text-center">
                <p className="text-[10px] text-zinc-500 font-medium">
                  Saldo Utilizado
                </p>
                <p className="text-xs sm:text-sm font-bold text-zinc-900 mt-0.5 tabular-nums">
                  {formatMXN(card.used)}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 text-center">
                <p className="text-[10px] text-zinc-500 font-medium">
                  Línea Disponible
                </p>
                <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5 tabular-nums">
                  {formatMXN(availableCredit)}
                </p>
              </div>
            </div>

            {/* Barra de progreso de uso */}
            <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/50 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-700">
                  Porcentaje de uso
                </span>
                <span
                  className={cn(
                    'font-bold tabular-nums text-[11px] px-2 py-0.5 rounded-full border',
                    isHealthy
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200',
                  )}
                >
                  {pct}% · {isHealthy ? 'Saludable (< 30%)' : 'Alerta (> 30%)'}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-200/70 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isHealthy ? 'bg-emerald-500' : 'bg-amber-500',
                  )}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500">
                {isHealthy
                  ? 'Uso responsable. Mantenerte por debajo del 30% protege tu historial crediticio.'
                  : 'Recomendación: Abona a tu saldo para reducir el índice de utilización.'}
              </p>
            </div>

            {/* Bloque de Fechas */}
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3 flex items-center justify-between">
              <div className="space-y-0.5 text-xs text-zinc-600">
                <p>
                  <span className="font-medium text-zinc-500">
                    Día de corte mensual:
                  </span>{' '}
                  <span className="font-semibold text-zinc-900">
                    Día {cutDay}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-zinc-500">
                    Día límite de pago:
                  </span>{' '}
                  <span className="font-semibold text-zinc-900">
                    Día {dueDay}
                  </span>
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs tabular-nums">
                {days} días restantes
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Bloque Débito */}
            <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4">
              <p className="text-xs font-medium text-emerald-800">
                Saldo líquido en cuenta bancaria
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tabular-nums mt-1">
                {formatMXN(card.balance ?? 0)}
              </p>
              <p className="text-xs text-emerald-700/90 mt-2 leading-relaxed">
                Cuenta receptora para ingresos de nómina, gastos corrientes y
                traspasos a apartados.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-zinc-700 font-medium">
                  Cuenta activa sin comisiones ni anualidad
                </span>
              </div>
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                Operativa
              </span>
            </div>
          </div>
        )}

        {/* Pie del modal */}
        <div className="space-y-2.5 pt-2">
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => onOpenEdit(card)}
              className="flex-1 rounded-xl border border-zinc-200 py-2.5 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              Editar información
            </button>

            {isCredit ? (
              <button
                type="button"
                onClick={() => onOpenPay(card)}
                className="flex-1 rounded-xl bg-[#202B33] hover:bg-[#141A29] py-2.5 px-3 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Ir a pagar tarjeta</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onViewMovements}
                  className="flex-1 rounded-xl border border-zinc-200 py-2.5 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Ver movimientos
                </button>
                <button
                  type="button"
                  onClick={() => onAddFunds(card)}
                  className="flex-1 rounded-xl bg-[#202B33] hover:bg-[#141A29] py-2.5 px-3 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Ingresar dinero</span>
                </button>
              </>
            )}
          </div>

          <p className="text-center text-[10px] text-zinc-400">
            Información referencial protegida. No se almacena CVV ni número
            completo del plástico.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
