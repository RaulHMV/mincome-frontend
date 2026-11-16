import { CheckCircle2, Plus, ShieldCheck, X } from 'lucide-react';
import AddCardModal from './Components/AddCardModal';
import CardDetailModal from './Components/CardDetailModal';
import CardListItem from './Components/CardListItem';
import CardsKpis from './Components/CardsKpis';
import DeleteCardModal from './Components/DeleteCardModal';
import EditCardModal from './Components/EditCardModal';
import PayCardModal from './Components/PayCardModal';
import UpcomingDatesTable from './Components/UpcomingDatesTable';
import { useTarjetas } from './hooks/useTarjetas';

/** Vista principal de gestión de tarjetas de crédito y cuentas débito (RF6 / RNF3). */
export default function Tarjetas() {
  const {
    cards,
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
  } = useTarjetas();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202B33] tracking-tight">
            Mis Tarjetas
          </h1>
          <p className="text-xs sm:text-sm text-[#778089] mt-0.5">
            Control de financiamiento, fechas de corte y saldo disponible.
          </p>
        </div>

        {/* Botón alineado a la derecha en móvil y desktop */}
        <div className="flex justify-end w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-[168px] h-10 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98] select-none cursor-pointer leading-none shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[1.5] shrink-0" />
            <span>Agregar tarjeta</span>
          </button>
        </div>
      </div>

      {/* 1. Barra Superior de Métricas */}
      <CardsKpis
        overview={overview}
        debitBalance={debitBalance}
        cashBalance={cashBalance}
      />

      {/* 2. Banner de Seguridad (RNF3) */}
      <div className="py-1.5 px-3 text-[11px] text-zinc-500 bg-zinc-50/60 border border-zinc-200/70 rounded-lg mb-4 flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        <span>
          Sólo guardamos el alias y los últimos 4 dígitos. Por seguridad, nunca
          solicitamos CVV, NIP ni el número completo del plástico.
        </span>
      </div>

      {/* 3. Lista Horizontal Compacta de Tarjetas */}
      <div className="flex flex-col gap-2.5 mb-4">
        {cards.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center text-xs sm:text-sm text-[#778089] shadow-2xs">
            No tienes tarjetas registradas. Agrega una tarjeta para comenzar.
          </div>
        ) : (
          cards.map((tarjeta) => (
            <CardListItem
              key={tarjeta.id}
              card={tarjeta}
              menuOpen={menuOpenId === tarjeta.id}
              onToggleMenu={() =>
                setMenuOpenId(menuOpenId === tarjeta.id ? null : tarjeta.id)
              }
              onOpenDetail={(card) => setDetailCardId(card.id)}
              onOpenPay={(card) => setPayingCardId(card.id)}
              onAddFunds={handleAddFunds}
              onViewMovements={handleViewMovements}
              onEdit={handleOpenEdit}
              onDelete={handleRequestDelete}
            />
          ))
        )}
      </div>

      {/* 4. Tabla Inferior "Fechas que importan" */}
      <UpcomingDatesTable rows={upcomingDates} />

      {/* 5. Modales estandarizados */}
      <AddCardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewCard}
      />
      <PayCardModal
        card={payingCard}
        isOpen={Boolean(payingCard)}
        debitCards={debitCards}
        debitBalance={debitBalance}
        cashBalance={cashBalance}
        onClose={() => setPayingCardId(null)}
        onConfirmPay={handleConfirmPay}
      />
      <CardDetailModal
        card={detailCard}
        isOpen={Boolean(detailCard)}
        onClose={() => setDetailCardId(null)}
        onOpenEdit={(card) => {
          setDetailCardId(null);
          handleOpenEdit(card);
        }}
        onOpenPay={(card) => {
          setDetailCardId(null);
          setPayingCardId(card.id);
        }}
        onAddFunds={(card) => {
          setDetailCardId(null);
          handleAddFunds(card);
        }}
        onViewMovements={() => {
          setDetailCardId(null);
          handleViewMovements();
        }}
      />
      <EditCardModal
        card={editingCard}
        isOpen={Boolean(editingCard)}
        onClose={() => setEditingCardId(null)}
        onSaveEdit={handleSaveEditCard}
      />
      <DeleteCardModal
        card={deletingCard}
        onClose={() => setDeletingCardId(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast de Confirmación */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-zinc-900 px-5 py-3.5 text-sm font-medium text-white shadow-xl lg:bottom-8"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Cerrar notificación"
            className="text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
