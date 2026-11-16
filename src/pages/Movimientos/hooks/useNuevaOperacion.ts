import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TODAY } from '../../../data/mockData';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addTransaction, selectBudgets } from '../../../store/slices/financeSlice';
import type { BankCard, PaymentMethod } from '../../../types';
import { formatCurrencyMXN } from '../functions/movimientosHelpers';
import type { NewOperationFlowType, RecurrenceOption } from '../types/movimientos.types';

const DEFAULT_TX_DATE = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}-${String(TODAY.getDate()).padStart(2, '0')}`;

function findMatchingDebitCard(debitCards: BankCard[], cuentaParam: string | null): BankCard | undefined {
  if (!cuentaParam) return debitCards[0];
  const normalized = cuentaParam.toLowerCase();
  return (
    debitCards.find(
      (c) =>
        c.alias.toLowerCase() === normalized ||
        c.bank.toLowerCase() === normalized ||
        c.id === cuentaParam ||
        c.alias.toLowerCase().includes(normalized) ||
        normalized.includes(c.alias.toLowerCase()),
    ) ?? debitCards[0]
  );
}

function isValidCalendarDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/** Hook de estado, validaciones operativas y despacho Redux para registrar ingresos o gastos. */
export function useNuevaOperacion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const cards = useAppSelector((state) => state.finance.cards);
  const liquidAccounts = useAppSelector((state) => state.finance.liquidAccounts);
  const budgets = useAppSelector(selectBudgets);

  const debitCards = useMemo(() => cards.filter((c) => c.kind === 'Débito'), [cards]);

  const [type, setType] = useState<NewOperationFlowType>(() =>
    searchParams.get('tipo') === 'ingreso' ? 'ingreso' : 'gasto',
  );
  const [cents, setCents] = useState(0);
  const [concept, setConcept] = useState('');
  const [date, setDate] = useState(DEFAULT_TX_DATE);

  const [incomeSource, setIncomeSource] = useState('Nómina');
  const [depositMethod, setDepositMethod] = useState<'efectivo' | 'debito'>('debito');
  const [debitCardId, setDebitCardId] = useState<string>(
    () => findMatchingDebitCard(debitCards, searchParams.get('cuenta'))?.id ?? debitCards[0]?.id ?? '',
  );

  const [category, setCategory] = useState<string>('Comida');
  const [payment, setPayment] = useState<'Efectivo' | 'Tarjeta'>('Tarjeta');
  const [cardId, setCardId] = useState<string>(() => cards[0]?.id ?? '');
  const [recurrence, setRecurrence] = useState<RecurrenceOption>('Puntual');
  const [error, setError] = useState<string | null>(null);

  const queryKey = `${searchParams.get('tipo') ?? ''}|${searchParams.get('cuenta') ?? ''}`;
  const [prevQueryKey, setPrevQueryKey] = useState(queryKey);

  if (queryKey !== prevQueryKey) {
    setPrevQueryKey(queryKey);
    const tipoParam = searchParams.get('tipo');
    const cuentaParam = searchParams.get('cuenta');

    if (tipoParam === 'ingreso' || tipoParam === 'gasto') {
      setType(tipoParam);
    }
    if (tipoParam === 'ingreso' || cuentaParam) {
      setDepositMethod('debito');
    }
    if (cuentaParam) {
      const match = findMatchingDebitCard(debitCards, cuentaParam);
      if (match) setDebitCardId(match.id);
    }
  }

  const amount = cents / 100;

  const selectedBudget = useMemo(
    () => budgets.find((b) => b.category === category),
    [budgets, category],
  );

  const fondosEfectivo = liquidAccounts.find((a) => a.id === 'cash')?.amount ?? 0;
  const fondosDebito = liquidAccounts.find((a) => a.id === 'debit')?.amount ?? 0;

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === cardId) ?? cards[0],
    [cards, cardId],
  );

  const isSelectedCardCredit = selectedCard
    ? selectedCard.kind === 'Crédito' || selectedCard.tipo === 'Crédito'
    : false;

  const maxDisponible = useMemo(() => {
    if (payment === 'Efectivo') return Math.max(0, fondosEfectivo);
    if (!selectedCard) return 0;
    const isCredit = selectedCard.kind === 'Crédito' || selectedCard.tipo === 'Crédito';
    if (isCredit) {
      return Math.max(0, (selectedCard.limit ?? 0) - (selectedCard.used ?? 0));
    }
    return Math.max(0, selectedCard.balance ?? fondosDebito);
  }, [payment, fondosEfectivo, fondosDebito, selectedCard]);

  const handleTypeChange = (nextType: NewOperationFlowType) => {
    setType(nextType);
    setError(null);
  };

  const onAmountChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setCents(digits ? parseInt(digits, 10) : 0);
    setError(null);
  };

  const handleConceptChange = (value: string) => {
    setConcept(value);
    setError(null);
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    setError(null);
  };

  const handlePaymentChange = (nextPayment: 'Efectivo' | 'Tarjeta') => {
    setPayment(nextPayment);
    setError(null);
  };

  const handleCardIdChange = (nextCardId: string) => {
    setCardId(nextCardId);
    setError(null);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('Ingresa un monto mayor a cero.');
      return;
    }

    if (!isValidCalendarDate(date)) {
      setError('Selecciona una fecha válida.');
      return;
    }

    const trimmedConcept = concept.trim();
    if (trimmedConcept.length > 120) {
      setError('El concepto no puede exceder 120 caracteres.');
      return;
    }

    if (type === 'ingreso') {
      if (!trimmedConcept) {
        setError('El concepto es obligatorio para registrar un ingreso.');
        return;
      }

      const selectedDebitCard = debitCards.find((c) => c.id === debitCardId) ?? debitCards[0];
      if (depositMethod === 'debito' && !selectedDebitCard) {
        setError('No hay una cuenta de débito disponible para recibir el ingreso.');
        return;
      }

      const cuentaName =
        depositMethod === 'efectivo'
          ? 'Efectivo'
          : `${selectedDebitCard.bank} · ${selectedDebitCard.alias} ••${selectedDebitCard.last4}`;

      dispatch(
        addTransaction({
          date,
          concept: trimmedConcept,
          category: incomeSource,
          type: 'ingreso',
          method: depositMethod === 'efectivo' ? 'Efectivo' : 'Débito',
          amount: Math.abs(amount),
          recurring: recurrence !== 'Puntual',
          cuenta: cuentaName,
        }),
      );

      navigate('/movimientos');
      return;
    }

    if (!category) {
      setError('Selecciona una categoría para el gasto.');
      return;
    }

    if (payment === 'Tarjeta' && !selectedCard) {
      setError('Selecciona una tarjeta o cuenta válida.');
      return;
    }

    if (Math.round(amount * 100) > Math.round(maxDisponible * 100)) {
      setError(
        `El monto excede el saldo disponible (${formatCurrencyMXN(maxDisponible)}).`,
      );
      return;
    }

    let method: PaymentMethod = 'Efectivo';
    let cuentaName = 'Efectivo';

    if (payment === 'Tarjeta' && selectedCard) {
      method = selectedCard.kind;
      cuentaName = `${selectedCard.bank} · ${selectedCard.alias} ••${selectedCard.last4}`;
    }

    dispatch(
      addTransaction({
        date,
        concept: trimmedConcept || category,
        category,
        type: 'gasto',
        method,
        amount: Math.abs(amount),
        recurring: recurrence !== 'Puntual',
        cuenta: cuentaName,
      }),
    );

    navigate('/movimientos');
  };

  return {
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
  };
}
