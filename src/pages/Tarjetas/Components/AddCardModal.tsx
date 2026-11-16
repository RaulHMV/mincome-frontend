import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { CardSchemaValues } from '../../../schemas/finance.schema';
import {
  CARD_MODAL_BACKDROP_CLASS,
  DEFAULT_CUT_DAY,
  DEFAULT_DUE_DAY,
  inputCls,
} from '../Constants/tarjetasConstants';
import type { AddCardFormState } from '../types/tarjetas.types';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CardSchemaValues) => string | null;
}

const initialFormState: AddCardFormState = {
  kind: 'Crédito',
  alias: '',
  bank: '',
  last4: '',
  limit: '',
  balance: '',
  cutDay: DEFAULT_CUT_DAY,
  dueDay: DEFAULT_DUE_DAY,
};

function blockInvalidNumberKeys(e: KeyboardEvent<HTMLInputElement>) {
  if (['-', '+', 'e', 'E'].includes(e.key)) {
    e.preventDefault();
  }
}

/** Formulario interno: se monta solo cuando el modal está abierto para iniciar siempre limpio. */
function AddCardForm({
  onClose,
  onSave,
}: Omit<AddCardModalProps, 'isOpen'>) {
  const [form, setForm] = useState<AddCardFormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);

  const isCredit = form.kind === 'Crédito';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedLimit = form.limit.trim() === '' ? NaN : Number(form.limit);
    const parsedBalance = form.balance.trim() === '' ? 0 : Number(form.balance);
    const parsedCutDay = Number(form.cutDay);
    const parsedDueDay = Number(form.dueDay);

    const candidate: CardSchemaValues = isCredit
      ? {
          alias: form.alias,
          bank: form.bank,
          last4: form.last4,
          kind: 'Crédito',
          limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : -1,
          used: 0,
          cutDay: Number.isFinite(parsedCutDay) ? parsedCutDay : 0,
          dueDay: Number.isFinite(parsedDueDay) ? parsedDueDay : 0,
        }
      : {
          alias: form.alias,
          bank: form.bank,
          last4: form.last4,
          kind: 'Débito',
          limit: 0,
          used: 0,
          balance: Number.isFinite(parsedBalance) ? parsedBalance : -1,
          cutDay: 1,
          dueDay: 20,
        };

    const validationError = onSave(candidate);
    if (validationError) {
      setError(validationError);
    }
  };

  return createPortal(
    <div className={CARD_MODAL_BACKDROP_CLASS}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Agregar tarjeta o cuenta"
        className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#202B33]">
              Agregar tarjeta o cuenta
            </h2>
            <p className="text-xs text-[#778089] mt-0.5">
              Registra un método de pago para monitoreo y fechas de corte (RF6)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          {/* Selector de Tipo */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Tipo de método de pago
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, kind: 'Crédito' });
                  setError(null);
                }}
                className={cn(
                  'py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                  isCredit
                    ? 'bg-white text-[#202B33] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800',
                )}
              >
                Crédito
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, kind: 'Débito' });
                  setError(null);
                }}
                className={cn(
                  'py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                  !isCredit
                    ? 'bg-white text-[#202B33] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800',
                )}
              >
                Débito
              </button>
            </div>
          </div>

          {/* Campos principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="nuevo-alias"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Alias de la tarjeta
              </label>
              <input
                id="nuevo-alias"
                type="text"
                maxLength={50}
                value={form.alias}
                onChange={(e) => {
                  setForm({ ...form, alias: e.target.value });
                  setError(null);
                }}
                placeholder="Ej. BBVA Oro, Débito Santander"
                className={inputCls}
              />
            </div>

            <div>
              <label
                htmlFor="nuevo-banco"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Banco emisor
              </label>
              <input
                id="nuevo-banco"
                type="text"
                maxLength={50}
                value={form.bank}
                onChange={(e) => {
                  setForm({ ...form, bank: e.target.value });
                  setError(null);
                }}
                placeholder="Ej. BBVA, Santander, Nu"
                className={inputCls}
              />
            </div>

            <div>
              <label
                htmlFor="nuevo-ultimosDigitos"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Últimos 4 dígitos
              </label>
              <input
                id="nuevo-ultimosDigitos"
                type="text"
                maxLength={4}
                inputMode="numeric"
                pattern="[0-9]{4}"
                placeholder="Ej. 7712"
                value={form.last4}
                onChange={(e) => {
                  setForm({
                    ...form,
                    last4: e.target.value.replace(/\D/g, '').slice(0, 4),
                  });
                  setError(null);
                }}
                className={inputCls}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Sólo para referencia visual (RNF3).
              </p>
            </div>

            {isCredit ? (
              <div>
                <label
                  htmlFor="nuevo-limite"
                  className="mb-1.5 block text-xs font-medium text-slate-600"
                >
                  Límite de crédito (MXN)
                </label>
                <input
                  id="nuevo-limite"
                  type="number"
                  min="1"
                  step="100"
                  value={form.limit}
                  onKeyDown={blockInvalidNumberKeys}
                  onChange={(e) => {
                    setForm({ ...form, limit: e.target.value });
                    setError(null);
                  }}
                  placeholder="30000"
                  className={inputCls}
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="nuevo-saldo"
                  className="mb-1.5 block text-xs font-medium text-slate-600"
                >
                  Saldo disponible inicial (MXN)
                </label>
                <input
                  id="nuevo-saldo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.balance}
                  onKeyDown={blockInvalidNumberKeys}
                  onChange={(e) => {
                    setForm({ ...form, balance: e.target.value });
                    setError(null);
                  }}
                  placeholder="0.00"
                  className={inputCls}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Fondos iniciales en cuenta bancaria.
                </p>
              </div>
            )}

            {isCredit && (
              <>
                <div>
                  <label
                    htmlFor="nuevo-corte"
                    className="mb-1.5 block text-xs font-medium text-slate-600"
                  >
                    Día de corte
                  </label>
                  <input
                    id="nuevo-corte"
                    type="number"
                    min="1"
                    max="31"
                    value={form.cutDay}
                    onKeyDown={blockInvalidNumberKeys}
                    onChange={(e) => {
                      setForm({ ...form, cutDay: e.target.value });
                      setError(null);
                    }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label
                    htmlFor="nuevo-pago"
                    className="mb-1.5 block text-xs font-medium text-slate-600"
                  >
                    Día límite de pago
                  </label>
                  <input
                    id="nuevo-pago"
                    type="number"
                    min="1"
                    max="31"
                    value={form.dueDay}
                    onKeyDown={blockInvalidNumberKeys}
                    onChange={(e) => {
                      setForm({ ...form, dueDay: e.target.value });
                      setError(null);
                    }}
                    className={inputCls}
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {/* Botones de Acción al pie */}
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white font-semibold py-2.5 px-4 transition-colors text-xs cursor-pointer"
            >
              Guardar tarjeta
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

/** Modal estandarizado para agregar tarjetas de crédito o débito (RNF3). */
export default function AddCardModal({
  isOpen,
  onClose,
  onSave,
}: AddCardModalProps) {
  if (!isOpen) return null;
  return <AddCardForm onClose={onClose} onSave={onSave} />;
}
