import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import type { Transaction } from '../../../types';
import { formatCurrencyMXN } from '../functions/movimientosHelpers';

interface DeleteTransactionModalProps {
  tx: Transaction;
  onClose: () => void;
  onConfirm: () => void;
}

/** Modal de confirmación destructiva para eliminar un movimiento registrado. */
export default function DeleteTransactionModal({
  tx,
  onClose,
  onConfirm,
}: DeleteTransactionModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const isIngreso = tx.type === 'ingreso' || tx.tipo === 'Retiro Ahorro';
  const isAhorro = tx.type === 'ahorro' && tx.tipo !== 'Retiro Ahorro';

  const absAmount = Math.abs(tx.amount ?? tx.monto ?? 0);
  const formattedAmount =
    isIngreso || isAhorro ? `+${formatCurrencyMXN(absAmount)}` : `-${formatCurrencyMXN(absAmount)}`;

  const amountColor = isIngreso
    ? 'text-emerald-600'
    : isAhorro
      ? 'text-[#315B50]'
      : 'text-[#202B33]';

  const displayDate = /^\d{4}-\d{2}-\d{2}$/.test(tx.date)
    ? formatDate(tx.date)
    : tx.fecha || tx.date;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#202B33]/60">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar eliminación"
        className="w-full max-w-md bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Cabecera con ícono de advertencia */}
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 text-slate-400 hover:text-[#202B33] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Título y descripción */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-[#202B33] tracking-tight">
            ¿Eliminar movimiento?
          </h3>
          <p className="text-xs sm:text-sm text-[#778089] mt-1 leading-relaxed">
            Esta acción no se puede deshacer. El registro se eliminará de tu historial y se actualizarán tus saldos.
          </p>
        </div>

        {/* Tarjeta del movimiento a eliminar */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                {tx.category || tx.categoria || 'Movimiento'}
              </p>
              <p
                className="text-sm font-semibold text-[#202B33] truncate mt-0.5"
                title={tx.concept || tx.concepto}
              >
                {tx.concept || tx.concepto || 'Sin concepto'}
              </p>
            </div>
            <span className={`text-base font-bold tabular-nums shrink-0 ${amountColor}`}>
              {formattedAmount}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#778089] pt-2 border-t border-slate-200/60">
            <span>{displayDate}</span>
            <span className="font-medium text-slate-600">
              {tx.cuenta || tx.method || tx.medio || 'Efectivo'}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs sm:text-sm font-medium text-[#778089] hover:text-[#202B33] transition-colors cursor-pointer px-4 py-2.5"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-2xs transition-all active:scale-[0.98] select-none cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4 stroke-[1.5]" />
            <span>Eliminar movimiento</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

