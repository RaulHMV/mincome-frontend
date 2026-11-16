import { useEffect, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Banknote, CreditCard, MoreHorizontal, X } from 'lucide-react';
import { expenseCategories } from '../../../data/mockData';
import { cn } from '../../../lib/utils';
import type { PaymentMethod, Transaction } from '../../../types';
import { EXPENSE_CATEGORY_ICONS, INCOME_SOURCES } from '../Constants/movimientosConstants';

interface EditTransactionModalProps {
  tx: Transaction;
  onClose: () => void;
  onSave: (updatedTx: Transaction) => void;
}

/** Modal de edición de movimientos (ingresos y gastos) manteniendo estilos originales. */
export default function EditTransactionModal({
  tx,
  onClose,
  onSave,
}: EditTransactionModalProps) {
  const isIngreso = tx.type === 'ingreso';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const [concept, setConcept] = useState(tx.concept || tx.concepto || '');
  const [amount, setAmount] = useState<string>(String(Math.abs(tx.amount)));
  const [date, setDate] = useState(() =>
    /^\d{4}-\d{2}-\d{2}$/.test(tx.date) ? tx.date : '2026-10-24',
  );

  const [category, setCategory] = useState<string>(() => {
    const initial = tx.category || tx.categoria || '';
    if (isIngreso) {
      const match = INCOME_SOURCES.find(
        (s) =>
          s.label.toLowerCase() === initial.toLowerCase() ||
          s.id.toLowerCase() === initial.toLowerCase(),
      );
      if (match) return match.label;
      return 'Nómina';
    }
    return initial || 'Comida';
  });

  const [method, setMethod] = useState<PaymentMethod>(() => {
    if (isIngreso) {
      return tx.method === 'Efectivo' ? 'Efectivo' : 'Débito';
    }
    return tx.method;
  });

  const [error, setError] = useState<string | null>(null);

  const handleAmountKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    const trimmedConcept = concept.trim();
    if (!trimmedConcept) {
      setError('El concepto es obligatorio.');
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto mayor a cero.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Selecciona una fecha válida.');
      return;
    }

    const normalizedAmount = Math.round(Math.abs(parsedAmount) * 100) / 100;
    const finalMethod: PaymentMethod = isIngreso
      ? method === 'Efectivo'
        ? 'Efectivo'
        : 'Débito'
      : method;

    const updatedCuenta = finalMethod === 'Efectivo' ? 'Efectivo' : tx.cuenta;

    onSave({
      ...tx,
      concept: trimmedConcept,
      amount: normalizedAmount,
      date,
      category,
      method: finalMethod,
      cuenta: updatedCuenta,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-[#202B33]/60">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isIngreso ? 'Editar Ingreso' : 'Editar Gasto'}
        className="w-full max-w-xl bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-[#202B33] tracking-tight">
              {isIngreso ? 'Editar Ingreso' : 'Editar Gasto'}
            </h3>
            <p className="text-xs sm:text-sm text-[#778089] mt-0.5">
              {isIngreso
                ? 'Modifica los detalles del ingreso registrado'
                : 'Modifica los detalles del gasto registrado'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs Principales (Concepto, Monto, Fecha) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label
              htmlFor="edit-concept"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Concepto
            </label>
            <input
              id="edit-concept"
              value={concept}
              onChange={(e) => {
                setConcept(e.target.value);
                setError(null);
              }}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-[#202B33] outline-none focus:border-[#202B33]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-amount"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Monto (MXN)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                $
              </span>
              <input
                id="edit-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onKeyDown={handleAmountKeyDown}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                className="w-full h-10 pl-7 pr-3 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-[#202B33] outline-none focus:border-[#202B33]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-date"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Fecha
            </label>
            <input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError(null);
              }}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-[#202B33] outline-none focus:border-[#202B33]"
            />
          </div>
        </div>

        {/* Categorías / Fuente dinámicas según tipo de movimiento */}
        {isIngreso ? (
          <div>
            <span className="mb-2 block text-xs font-semibold text-slate-600">
              Fuente del ingreso
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {INCOME_SOURCES.map((item) => {
                const Icon = item.icon;
                const active = category === item.label || category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(item.label)}
                    className={cn(
                      'rounded-lg h-14 flex flex-col items-center justify-center gap-1 text-[11px] cursor-pointer select-none transition-all',
                      active
                        ? 'bg-[#E8EBED] text-[#202B33] font-semibold border border-[#D5DCD9] shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium',
                    )}
                  >
                    <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <span className="mb-2 block text-xs font-semibold text-slate-600">
              Categoría del gasto
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {expenseCategories.map((c) => {
                const Icon = EXPENSE_CATEGORY_ICONS[c] ?? MoreHorizontal;
                const active = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(c)}
                    className={cn(
                      'rounded-lg h-14 flex flex-col items-center justify-center gap-1 text-[11px] cursor-pointer select-none transition-all',
                      active
                        ? 'bg-[#E8EBED] text-[#202B33] font-semibold border border-[#D5DCD9] shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium',
                    )}
                  >
                    <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate max-w-[90px]">{c}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Medio de pago / recepción según tipo */}
        {isIngreso ? (
          <div>
            <span className="mb-2 block text-xs font-semibold text-slate-600">
              Medio de recepción
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {(['Cuenta Débito', 'Efectivo'] as const).map((m) => {
                const nextMethod: PaymentMethod = m === 'Efectivo' ? 'Efectivo' : 'Débito';
                const active = method === nextMethod;
                const Icon = m === 'Efectivo' ? Banknote : CreditCard;
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMethod(nextMethod)}
                    className={cn(
                      'rounded-lg h-10 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer select-none transition-all',
                      active
                        ? 'bg-[#E8EBED] text-[#202B33] font-semibold border border-[#D5DCD9] shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium',
                    )}
                  >
                    <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{m}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <span className="mb-2 block text-xs font-semibold text-slate-600">
              Medio de pago
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Efectivo', 'Débito', 'Crédito'] as const).map((m) => {
                const active = method === m;
                const Icon = m === 'Efectivo' ? Banknote : CreditCard;
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMethod(m)}
                    className={cn(
                      'rounded-lg h-10 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer select-none transition-all',
                      active
                        ? 'bg-[#E8EBED] text-[#202B33] font-semibold border border-[#D5DCD9] shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium',
                    )}
                  >
                    <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{m}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
            {error}
          </p>
        )}

        {/* Acciones del pie */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="text-xs sm:text-sm font-medium text-[#778089] hover:text-[#202B33] transition-colors cursor-pointer px-4 py-2.5"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-10 px-5 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white text-xs sm:text-sm font-semibold shadow-2xs transition-all active:scale-[0.98] select-none cursor-pointer flex items-center justify-center gap-2"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

