import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { formatMXN } from '../../../lib/utils';
import type { GoalTransferModalProps } from '../types/apartados.types';

export default function GoalTransferModal({
  dialog,
  goal,
  freeBalance,
  amount,
  amountValue,
  maxAmount,
  isInvalid,
  error,
  onAmountChange,
  onClose,
  onConfirm,
}: GoalTransferModalProps) {
  if (!dialog || !goal) return null;

  const isDeposit = dialog.mode === 'abonar';
  const exceededMessage =
    amountValue > maxAmount
      ? isDeposit
        ? `El monto excede tu Saldo Libre (${formatMXN(maxAmount)})`
        : `El monto excede el capital acumulado (${formatMXN(maxAmount)})`
      : null;
  const visibleError = exceededMessage ?? error;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#202B33]/60">
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-[#202B33]">
            {isDeposit ? 'Abonar a' : 'Retirar de'} {goal.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Información contextual del saldo */}
        <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
          {isDeposit ? (
            <>
              <p className="font-medium text-slate-700">Saldo Libre disponible:</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-emerald-600">
                {formatMXN(freeBalance)}
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-slate-700">Capital acumulado en esta meta:</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-[#202B33]">
                {formatMXN(goal.saved)}
              </p>
            </>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm();
          }}
        >
          <label htmlFor="amt" className="mb-1.5 block text-xs font-medium text-slate-500">
            {isDeposit ? 'Monto a transferir (MXN)' : 'Monto a retirar hacia Saldo Libre (MXN)'}
          </label>
          <input
            id="amt"
            type="number"
            min="0"
            step="any"
            autoFocus
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-lg font-semibold tabular-nums outline-none focus:border-[#202B33] focus:ring-2 focus:ring-[#202B33]/10"
          />
          {visibleError && (
            <p className="mt-2 text-xs font-medium text-rose-500" role="alert">
              {visibleError}
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs sm:text-sm font-medium text-[#778089] hover:text-[#202B33] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isInvalid}
              className="flex-1 h-10 px-4 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white text-xs sm:text-sm font-semibold shadow-2xs transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isDeposit ? 'Confirmar abono' : 'Confirmar retiro'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
