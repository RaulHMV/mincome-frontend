import { ArrowLeft, Banknote, CreditCard, MoreHorizontal } from 'lucide-react';
import { expenseCategories } from '../../data/mockData';
import { cn, formatMXN } from '../../lib/utils';
import BudgetImpactPreview from './Components/BudgetImpactPreview';
import {
  EXPENSE_CATEGORY_ICONS,
  INCOME_SOURCES,
  NEW_OPERATION_TABS,
  RECURRENCE_OPTIONS,
} from './Constants/movimientosConstants';
import { cardExpenseOptionLabel, formatCurrencyMXN } from './functions/movimientosHelpers';
import { useNuevaOperacion } from './hooks/useNuevaOperacion';

/** Vista de registro de nuevas operaciones de gasto o ingreso conectada a Redux. */
export default function NuevaOperacion() {
  const {
    type,
    cents,
    amount,
    concept,
    date,
    incomeSource,
    depositMethod,
    debitCardId,
    debitCards,
    category,
    payment,
    cardId,
    cards,
    recurrence,
    selectedBudget,
    fondosEfectivo,
    isSelectedCardCredit,
    error,
    navigate,
    setIncomeSource,
    setDepositMethod,
    setDebitCardId,
    setCategory,
    setRecurrence,
    handleTypeChange,
    onAmountChange,
    handleConceptChange,
    handleDateChange,
    handlePaymentChange,
    handleCardIdChange,
    submit,
  } = useNuevaOperacion();

  return (
    <div className="w-full space-y-6 pb-6">
      {/* 1. Cabecera alineada a la izquierda */}
      <div className="flex items-start sm:items-center gap-3.5">
        <button
          type="button"
          onClick={() => navigate('/movimientos')}
          aria-label="Regresar a movimientos"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-[#E8EBED] hover:text-[#202B33] transition-colors shrink-0 cursor-pointer mt-0.5 sm:mt-0"
        >
          <ArrowLeft className="h-5 w-5 stroke-[2]" />
        </button>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Registrar transacción
          </h1>
          <p className="text-sm text-slate-500">
            Captura ingresos o gastos para actualizar tus balances
          </p>
        </div>
      </div>

      {/* 2. Tarjeta principal del formulario */}
      <form
        onSubmit={submit}
        noValidate
        className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-7 space-y-6"
      >
        {/* Cabecera interna de la tarjeta */}
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900">Nueva operación</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registra lo que entra, sale o se convierte en ahorro.
          </p>
        </div>

        {/* Pestañas de Tipo (Gasto e Ingreso full width) */}
        <div className="bg-slate-100/70 p-1.5 rounded-xl grid grid-cols-2 gap-1.5" role="tablist">
          {NEW_OPERATION_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={type === t.id}
              onClick={() => handleTypeChange(t.id)}
              className={cn(
                'py-2.5 text-sm font-semibold transition-all cursor-pointer select-none text-center rounded-lg',
                type === t.id
                  ? 'bg-white text-[#202B33] shadow-xs'
                  : 'text-slate-600 hover:text-[#202B33]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Fila de 3 Inputs Principales (Monto, Concepto, Fecha) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Monto */}
          <div>
            <label htmlFor="amount" className="mb-1.5 block text-xs font-semibold text-slate-600">
              Monto (MXN)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                $
              </span>
              <input
                id="amount"
                inputMode="numeric"
                value={
                  cents === 0
                    ? ''
                    : (cents / 100).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                }
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="100.00"
                className="w-full h-11 pl-8 pr-3.5 rounded-lg border border-slate-200 bg-white text-sm text-[#202B33] outline-none transition placeholder:text-slate-400 focus:border-[#202B33] focus:ring-1 focus:ring-[#202B33]/10"
              />
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label htmlFor="concept" className="mb-1.5 block text-xs font-semibold text-slate-600">
              Concepto
            </label>
            <input
              id="concept"
              value={concept}
              onChange={(e) => handleConceptChange(e.target.value)}
              placeholder={type === 'ingreso' ? 'Ej. Nómina, Freelance' : 'Ej. Supermercado, Uber'}
              className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-[#202B33] outline-none transition placeholder:text-slate-400 focus:border-[#202B33] focus:ring-1 focus:ring-[#202B33]/10"
            />
          </div>

          {/* Fecha */}
          <div>
            <label htmlFor="date" className="mb-1.5 block text-xs font-semibold text-slate-600">
              Fecha
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-[#202B33] outline-none transition focus:border-[#202B33] focus:ring-1 focus:ring-[#202B33]/10"
            />
          </div>
        </div>

        {/* 5. Rejilla de Categorías / Fuente del ingreso */}
        {type === 'gasto' ? (
          <div>
            <span className="mb-2 block text-xs font-semibold text-slate-600">Categoría</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
                      'h-11 px-3 rounded-lg flex items-center justify-center gap-2 text-xs transition cursor-pointer select-none whitespace-nowrap font-medium',
                      active
                        ? 'bg-[#E8EBED] border border-[#D5DCD9] text-[#202B33] font-semibold shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>

            <BudgetImpactPreview budget={selectedBudget} pendingAmount={amount} />
          </div>
        ) : (
          <div>
            <span className="mb-2 block text-xs font-semibold text-slate-600">Fuente del ingreso</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {INCOME_SOURCES.map((item) => {
                const Icon = item.icon;
                const isSelected = incomeSource === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setIncomeSource(item.id)}
                    className={cn(
                      'h-11 px-3 rounded-lg flex items-center justify-center gap-2 text-xs transition cursor-pointer select-none whitespace-nowrap font-medium',
                      isSelected
                        ? 'bg-[#E8EBED] border border-[#D5DCD9] text-[#202B33] font-semibold shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Cargo / Medio de Pago */}
        {type === 'gasto' ? (
          <div>
            <span className="mb-2 block text-xs font-semibold text-slate-600">Cargo</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                aria-pressed={payment === 'Tarjeta'}
                onClick={() => handlePaymentChange('Tarjeta')}
                className={cn(
                  'h-11 rounded-lg px-4 flex items-center justify-center gap-2 text-xs sm:text-sm transition cursor-pointer select-none',
                  payment === 'Tarjeta'
                    ? 'bg-[#E8EBED] text-[#202B33] border border-[#D5DCD9] shadow-2xs font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium',
                )}
              >
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span>Tarjeta</span>
              </button>
              <button
                type="button"
                aria-pressed={payment === 'Efectivo'}
                onClick={() => handlePaymentChange('Efectivo')}
                className={cn(
                  'h-11 rounded-lg px-4 flex items-center justify-center gap-2 text-xs sm:text-sm transition cursor-pointer select-none',
                  payment === 'Efectivo'
                    ? 'bg-[#E8EBED] text-[#202B33] border border-[#D5DCD9] shadow-2xs font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium',
                )}
              >
                <Banknote className="w-4 h-4 text-slate-500" />
                <span>Efectivo</span>
              </button>
            </div>

            {payment === 'Tarjeta' ? (
              <div className="mt-3.5">
                <label htmlFor="account" className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Cuenta o Tarjeta
                </label>
                <select
                  id="account"
                  value={cardId}
                  onChange={(e) => handleCardIdChange(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-[#202B33] outline-none focus:border-[#202B33]"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {cardExpenseOptionLabel(c)}
                    </option>
                  ))}
                </select>
                {isSelectedCardCredit ? (
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Este gasto aumentará el saldo a pagar de tu tarjeta de crédito.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Se descontará inmediatamente del saldo disponible en tu cuenta.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3.5">
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">Efectivo líquido disponible</span>
                    <span className="font-semibold text-[#202B33] tabular-nums">
                      {formatCurrencyMXN(fondosEfectivo)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <span className="mb-2 block text-xs font-semibold text-slate-600">Medio de recepción</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                aria-pressed={depositMethod === 'debito'}
                onClick={() => setDepositMethod('debito')}
                className={cn(
                  'h-11 rounded-lg px-4 flex items-center justify-center gap-2 text-xs sm:text-sm transition cursor-pointer select-none',
                  depositMethod === 'debito'
                    ? 'bg-[#E8EBED] text-[#202B33] border border-[#D5DCD9] shadow-2xs font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium',
                )}
              >
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span>Cuenta Débito</span>
              </button>
              <button
                type="button"
                aria-pressed={depositMethod === 'efectivo'}
                onClick={() => setDepositMethod('efectivo')}
                className={cn(
                  'h-11 rounded-lg px-4 flex items-center justify-center gap-2 text-xs sm:text-sm transition cursor-pointer select-none',
                  depositMethod === 'efectivo'
                    ? 'bg-[#E8EBED] text-[#202B33] border border-[#D5DCD9] shadow-2xs font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium',
                )}
              >
                <Banknote className="w-4 h-4 text-slate-500" />
                <span>Efectivo</span>
              </button>
            </div>

            {depositMethod === 'debito' && (
              <div className="mt-3.5">
                <label htmlFor="debit-account" className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Cuenta receptora de débito
                </label>
                <select
                  id="debit-account"
                  value={debitCardId}
                  onChange={(e) => setDebitCardId(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm font-medium text-[#202B33] outline-none focus:border-[#202B33]"
                >
                  {debitCards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.bank} · {c.alias} •••• {c.last4} (Disp: {formatMXN(c.balance ?? 0)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* 7. Control de Recurrencia */}
        <div>
          <span className="mb-2 block text-xs font-semibold text-slate-600" id="rec-label">
            ¿Movimiento recurrente?
          </span>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3" role="radiogroup" aria-labelledby="rec-label">
            {RECURRENCE_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={recurrence === r}
                onClick={() => setRecurrence(r)}
                className={cn(
                  'h-11 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center justify-center cursor-pointer select-none',
                  recurrence === r
                    ? 'bg-[#E8EBED] text-[#202B33] border border-[#D5DCD9] shadow-2xs font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium',
                )}
              >
                {r}
              </button>
            ))}
          </div>
          {recurrence !== 'Puntual' && (
            <p className="mt-2 text-xs text-slate-400">
              Se registrará periódicamente como evento {recurrence.toLowerCase()}.
            </p>
          )}
        </div>

        {/* Mensaje de validación operativa */}
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm font-medium text-rose-700"
          >
            {error}
          </p>
        )}

        {/* 8. Pie de Formulario */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-[#778089]">
            Se registrará como un {type === 'gasto' ? 'gasto' : 'ingreso'}.
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/movimientos')}
              className="text-xs sm:text-sm font-medium text-[#778089] hover:text-[#202B33] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white text-xs sm:text-sm font-semibold shadow-2xs transition-all active:scale-[0.98] select-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              Registrar {type === 'gasto' ? 'gasto' : 'ingreso'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

