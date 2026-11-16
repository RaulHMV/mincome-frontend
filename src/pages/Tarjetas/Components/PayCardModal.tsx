import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn, formatMXN } from '../../../lib/utils';
import type { PayCardSchemaValues } from '../../../schemas/finance.schema';
import type { BankCard } from '../../../types';
import {
  CARD_MODAL_BACKDROP_CLASS,
  inputCls,
} from '../Constants/tarjetasConstants';
import { getAvailableCredit, getCardLimit } from '../functions/tarjetasHelpers';
import type { PaymentSourceMethod } from '../types/tarjetas.types';

interface PayCardModalProps {
  isOpen: boolean;
  card: BankCard | null;
  debitCards: BankCard[];
  debitBalance: number;
  cashBalance: number;
  onClose: () => void;
  onConfirmPay: (payload: PayCardSchemaValues) => string | null;
}

interface PayFormProps extends Omit<PayCardModalProps, 'isOpen' | 'card'> {
  card: BankCard;
}

function blockInvalidNumberKeys(e: KeyboardEvent<HTMLInputElement>) {
  if (['-', '+', 'e', 'E'].includes(e.key)) {
    e.preventDefault();
  }
}

/** Formulario interno: se monta al abrir, reiniciando su estado por tarjeta. */
function PayCardForm({
  card,
  debitCards,
  debitBalance,
  cashBalance,
  onClose,
  onConfirmPay,
}: PayFormProps) {
  const [payAmount, setPayAmount] = useState('');
  const [sourceMethod, setSourceMethod] = useState<PaymentSourceMethod>(() =>
    debitBalance > 0 || debitCards.length > 0 ? 'Débito' : 'Efectivo',
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  const amountNum = parseFloat(payAmount) || 0;
  const isCash = sourceMethod === 'Efectivo';
  const primaryDebitLabel = debitCards[0]?.alias ?? 'Débito Nómina';
  const originAvailable = isCash ? cashBalance : debitBalance;
  const originName = isCash ? 'Efectivo' : `${primaryDebitLabel} (Débito)`;

  const cardLimit = getCardLimit(card);
  const availableCredit = getAvailableCredit(card);
  const exceedsDebt = amountNum > card.used;
  const exceedsBalance = amountNum > originAvailable;
  const isPaymentValid =
    amountNum > 0 && !exceedsDebt && !exceedsBalance && card.used > 0;

  const handleConfirmPayment = (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const parsedAmount = Number(payAmount);
    const errorMessage = onConfirmPay({
      cardId: card.id,
      amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
      sourceMethod,
    });

    if (errorMessage) {
      setSubmitError(errorMessage);
    }
  };

  return createPortal(
    <div className={CARD_MODAL_BACKDROP_CLASS}>
      <form
        onSubmit={handleConfirmPayment}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label={`Pagar tarjeta ${card.alias}`}
        className="w-full bg-white p-6 shadow-2xl max-w-md rounded-3xl space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Pagar tarjeta</h2>
            <p className="text-xs text-zinc-500">
              {card.banco || card.bank} · {card.alias} (••••{' '}
              {card.terminacion || card.last4})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Información de Deuda Actual */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-1">
          <p className="text-xs font-medium text-zinc-500">
            Deuda actual acumulada
          </p>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold tabular-nums text-zinc-900">
              {formatMXN(card.used)}
            </p>
            <span className="text-xs font-medium text-zinc-500">
              Disponible: {formatMXN(availableCredit)}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Límite total: {formatMXN(cardLimit)}
          </p>
        </div>

        {card.used === 0 ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-900">
              ¡Tarjeta al corriente!
            </p>
            <p className="text-xs text-emerald-700">
              Esta tarjeta no tiene saldo pendiente por pagar.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full rounded-xl bg-[#202B33] py-2.5 text-xs font-semibold text-white hover:bg-[#141A29] transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        ) : (
          <>
            {/* Selector de Cuenta Origen */}
            <div>
              <label
                htmlFor="origin-account"
                className="mb-1.5 block text-xs font-medium text-zinc-500"
              >
                Cuenta de origen (para debitar el pago)
              </label>
              <select
                id="origin-account"
                value={sourceMethod}
                onChange={(e) => {
                  setSourceMethod(e.target.value as PaymentSourceMethod);
                  setSubmitError(null);
                }}
                className={cn(inputCls, 'font-medium text-zinc-800')}
              >
                <option value="Débito">
                  {primaryDebitLabel} (Débito) - Disp: {formatMXN(debitBalance)}
                </option>
                <option value="Efectivo">
                  Efectivo - Disp: {formatMXN(cashBalance)}
                </option>
              </select>
            </div>

            {/* Monto a Pagar */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="pay-amount"
                  className="text-xs font-medium text-zinc-500"
                >
                  Monto a pagar (MXN)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPayAmount(card.used.toString());
                    setSubmitError(null);
                  }}
                  className="text-xs font-semibold text-zinc-800 hover:text-black underline cursor-pointer"
                >
                  Liquidar total ({formatMXN(card.used)})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                  $
                </span>
                <input
                  id="pay-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={payAmount}
                  onKeyDown={blockInvalidNumberKeys}
                  onChange={(e) => {
                    setPayAmount(e.target.value);
                    setSubmitError(null);
                  }}
                  placeholder="0.00"
                  className={cn(
                    inputCls,
                    'pl-8 text-lg font-semibold tabular-nums text-zinc-900',
                  )}
                  autoFocus
                />
              </div>

              {/* Mensajes de Validación */}
              {exceedsDebt && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  El monto excede la deuda actual ({formatMXN(card.used)}).
                </p>
              )}
              {!exceedsDebt && exceedsBalance && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Saldo insuficiente en {originName} (Disponible:{' '}
                  {formatMXN(originAvailable)}).
                </p>
              )}
              {submitError && !exceedsDebt && !exceedsBalance && (
                <p
                  role="alert"
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {submitError}
                </p>
              )}
              {isPaymentValid && (
                <p className="mt-2 text-xs text-zinc-500">
                  Deuda restante tras el pago:{' '}
                  <span className="font-semibold text-zinc-800 tabular-nums">
                    {formatMXN(Math.max(0, card.used - amountNum))}
                  </span>
                </p>
              )}
            </div>

            {/* Acciones al pie del modal */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isPaymentValid}
                className="flex-1 rounded-xl bg-[#202B33] py-2.5 text-sm font-semibold text-white transition hover:bg-[#141A29] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                Confirmar Pago
              </button>
            </div>
          </>
        )}
      </form>
    </div>,
    document.body,
  );
}

/** Modal estandarizado para abonar o liquidar tarjetas de crédito. */
export default function PayCardModal({
  isOpen,
  card,
  ...rest
}: PayCardModalProps) {
  if (!isOpen || !card) return null;
  return <PayCardForm key={card.id} card={card} {...rest} />;
}
