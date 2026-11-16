import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatMXN } from '../../../lib/utils';
import {
  cardSchema,
  payCardSchema,
  type CardSchemaValues,
  type PayCardSchemaValues,
} from '../../../schemas/finance.schema';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  addCard,
  payCreditCard,
  removeCard,
  selectCards,
  selectCardsOverview,
  selectLiquidAccounts,
  updateCard,
} from '../../../store/slices/financeSlice';
import type { BankCard } from '../../../types';
import { buildUpcomingCardDates } from '../functions/tarjetasHelpers';

/** Hook controlador del módulo Mis Tarjetas (RF6 / RNF3) conectado a Redux y Zod. */
export function useTarjetas() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const cards = useAppSelector(selectCards);
  const liquidAccounts = useAppSelector(selectLiquidAccounts);
  const overview = useAppSelector(selectCardsOverview);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [payingCardId, setPayingCardId] = useState<string | null>(null);
  const [detailCardId, setDetailCardId] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const creditCards = useMemo(
    () => cards.filter((c) => c.kind === 'Crédito'),
    [cards],
  );
  const debitCards = useMemo(
    () => cards.filter((c) => c.kind === 'Débito'),
    [cards],
  );

  const cashBalance = liquidAccounts.find((a) => a.id === 'cash')?.amount ?? 0;
  const debitBalance = liquidAccounts.find((a) => a.id === 'debit')?.amount ?? 0;

  const upcomingDates = useMemo(
    () => buildUpcomingCardDates(creditCards),
    [creditCards],
  );

  const payingCard = useMemo(
    () => cards.find((c) => c.id === payingCardId) ?? null,
    [cards, payingCardId],
  );
  const detailCard = useMemo(
    () => cards.find((c) => c.id === detailCardId) ?? null,
    [cards, detailCardId],
  );
  const editingCard = useMemo(
    () => cards.find((c) => c.id === editingCardId) ?? null,
    [cards, editingCardId],
  );
  const deletingCard = useMemo(
    () => cards.find((c) => c.id === deletingCardId) ?? null,
    [cards, deletingCardId],
  );

  // Bloqueo global de scroll cuando cualquier modal esté activo
  useEffect(() => {
    const isAnyModalOpen =
      isAddModalOpen ||
      Boolean(payingCard) ||
      Boolean(detailCard) ||
      Boolean(editingCard) ||
      Boolean(deletingCard);

    document.body.style.overflow = isAnyModalOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddModalOpen, payingCard, detailCard, editingCard, deletingCard]);

  // Cerrar menú contextual flotante al hacer clic fuera
  useEffect(() => {
    if (!menuOpenId) return;
    const handleClose = () => setMenuOpenId(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [menuOpenId]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const validateUniqueCard = (
    data: CardSchemaValues,
    excludeId?: string,
  ): string | null => {
    const aliasLower = data.alias.trim().toLowerCase();
    const bankLower = data.bank.trim().toLowerCase();

    if (
      cards.some(
        (c) => c.id !== excludeId && c.alias.trim().toLowerCase() === aliasLower,
      )
    ) {
      return 'Ya existe una tarjeta registrada con ese alias.';
    }

    if (
      cards.some(
        (c) =>
          c.id !== excludeId &&
          c.bank.trim().toLowerCase() === bankLower &&
          c.last4 === data.last4,
      )
    ) {
      return 'Ya existe una tarjeta registrada con ese banco y terminación.';
    }

    return null;
  };

  const handleSaveNewCard = (candidate: CardSchemaValues): string | null => {
    const parsed = cardSchema.safeParse(candidate);
    if (!parsed.success) {
      return parsed.error.issues[0]?.message ?? 'Revisa los datos de la tarjeta.';
    }

    const duplicateError = validateUniqueCard(parsed.data);
    if (duplicateError) return duplicateError;

    dispatch(addCard(parsed.data));
    setIsAddModalOpen(false);
    setToast(`Tarjeta ${parsed.data.alias} agregada con éxito.`);
    return null;
  };

  const handleOpenEdit = (card: BankCard) => {
    setMenuOpenId(null);
    setEditingCardId(card.id);
  };

  const handleRequestDelete = (card: BankCard) => {
    setMenuOpenId(null);
    setDeletingCardId(card.id);
  };

  const handleSaveEditCard = (
    cardId: string,
    candidate: CardSchemaValues,
  ): string | null => {
    const parsed = cardSchema.safeParse(candidate);
    if (!parsed.success) {
      return parsed.error.issues[0]?.message ?? 'Revisa los datos de la tarjeta.';
    }

    const duplicateError = validateUniqueCard(parsed.data, cardId);
    if (duplicateError) return duplicateError;

    dispatch(updateCard({ id: cardId, changes: parsed.data }));
    setEditingCardId(null);
    setToast(`Tarjeta ${parsed.data.alias} actualizada.`);
    return null;
  };

  const handleConfirmDelete = () => {
    if (!deletingCard) return;
    const alias = deletingCard.alias;
    dispatch(removeCard(deletingCard.id));
    setDeletingCardId(null);
    setToast(`Tarjeta ${alias} eliminada.`);
  };

  const handleConfirmPay = (payload: PayCardSchemaValues): string | null => {
    const parsed = payCardSchema.safeParse(payload);
    if (!parsed.success) {
      return parsed.error.issues[0]?.message ?? 'Datos de pago inválidos.';
    }

    const targetCard = cards.find((c) => c.id === parsed.data.cardId);
    if (!targetCard || targetCard.kind !== 'Crédito') {
      return 'Tarjeta de crédito no encontrada.';
    }

    if (parsed.data.amount > targetCard.used) {
      return `El monto excede la deuda actual (${formatMXN(targetCard.used)}).`;
    }

    const available =
      parsed.data.sourceMethod === 'Efectivo' ? cashBalance : debitBalance;
    if (parsed.data.amount > available) {
      return 'Saldo insuficiente en la cuenta seleccionada';
    }

    dispatch(payCreditCard(parsed.data));
    setPayingCardId(null);
    const originName =
      parsed.data.sourceMethod === 'Efectivo' ? 'Efectivo' : 'Débito Nómina';
    setToast(
      `Pago exitoso de ${formatMXN(parsed.data.amount)} a ${targetCard.alias} aplicado desde ${originName}.`,
    );
    return null;
  };

  const handleAddFunds = (card: BankCard) => {
    navigate(
      '/movimientos/nueva-operacion?tipo=ingreso&cuenta=' +
        encodeURIComponent(card.alias),
    );
  };

  const handleViewMovements = () => {
    navigate('/movimientos');
  };

  return {
    cards,
    creditCards,
    debitCards,
    overview,
    cashBalance,
    debitBalance,
    upcomingDates,
    isAddModalOpen,
    payingCard,
    detailCard,
    editingCard,
    deletingCard,
    menuOpenId,
    toast,
    setIsAddModalOpen,
    setPayingCardId,
    setDetailCardId,
    setEditingCardId,
    setDeletingCardId,
    setMenuOpenId,
    setToast,
    handleSaveNewCard,
    handleOpenEdit,
    handleRequestDelete,
    handleSaveEditCard,
    handleConfirmDelete,
    handleConfirmPay,
    handleAddFunds,
    handleViewMovements,
  };
}
