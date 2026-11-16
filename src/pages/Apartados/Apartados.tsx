import ApartadosHeader from './Components/ApartadosHeader';
import ApartadosSummaryCards from './Components/ApartadosSummaryCards';
import CreateGoalModal from './Components/CreateGoalModal';
import EditGoalModal from './Components/EditGoalModal';
import GoalCard from './Components/GoalCard';
import GoalTransferModal from './Components/GoalTransferModal';
import { MAX_GOALS } from './Constants/apartadosConstants';
import { useApartados } from './hooks/useApartados';

export default function Apartados() {
  const {
    goals,
    freeBalance,
    totalSaved,
    totalNetWorth,
    isLimitReached,
    dialog,
    activeTransferGoal,
    transferAmount,
    transferValue,
    transferMax,
    isTransferInvalid,
    transferError,
    openTransferDialog,
    closeTransferDialog,
    handleTransferAmountChange,
    confirmTransfer,
    handleReleaseGoal,
    isCreateModalOpen,
    createName,
    createTarget,
    createInitial,
    createTargetNum,
    createInitialNum,
    selectedIcon,
    createError,
    openCreateModal,
    closeCreateModal,
    setCreateName,
    setCreateTarget,
    setCreateInitial,
    setSelectedIcon,
    handleCreateGoal,
    editingGoal,
    editName,
    editTarget,
    editTargetNum,
    editIcon,
    editError,
    openEditModal,
    closeEditModal,
    setEditName,
    setEditTarget,
    setEditIcon,
    handleSaveEdit,
  } = useApartados();

  return (
    <div className="space-y-4 font-sans">
      {/* 1. Cabecera y Botón Principal Homologados */}
      <ApartadosHeader
        goalsCount={goals.length}
        maxGoals={MAX_GOALS}
        onOpenCreate={openCreateModal}
      />

      {/* 2. Tarjetas Métricas Superiores */}
      <ApartadosSummaryCards
        freeBalance={freeBalance}
        totalSaved={totalSaved}
        totalNetWorth={totalNetWorth}
        goalsCount={goals.length}
      />

      {/* 3. Área de Apartados */}
      <div className="mt-6">
        {goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            <p className="text-sm font-medium text-slate-600">No tienes apartados activos.</p>
            <p className="text-xs text-slate-400 mt-1">
              Crea un nuevo apartado para empezar a reservar capital.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onOpenTransfer={openTransferDialog}
                onOpenEdit={openEditModal}
                onRelease={handleReleaseGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Abonar o Retirar de una meta */}
      <GoalTransferModal
        dialog={dialog}
        goal={activeTransferGoal}
        freeBalance={freeBalance}
        amount={transferAmount}
        amountValue={transferValue}
        maxAmount={transferMax}
        isInvalid={isTransferInvalid}
        error={transferError}
        onAmountChange={handleTransferAmountChange}
        onClose={closeTransferDialog}
        onConfirm={confirmTransfer}
      />

      {/* Modal 2: Crear Nueva Meta de Ahorro */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        goalsCount={goals.length}
        maxGoals={MAX_GOALS}
        isLimitReached={isLimitReached}
        freeBalance={freeBalance}
        name={createName}
        target={createTarget}
        initialAmount={createInitial}
        targetNum={createTargetNum}
        initialNum={createInitialNum}
        selectedIcon={selectedIcon}
        error={createError}
        onNameChange={setCreateName}
        onTargetChange={setCreateTarget}
        onInitialAmountChange={setCreateInitial}
        onIconSelect={setSelectedIcon}
        onClose={closeCreateModal}
        onSubmit={handleCreateGoal}
      />

      {/* Modal 3: Editar Meta de Ahorro */}
      <EditGoalModal
        editingGoal={editingGoal}
        name={editName}
        target={editTarget}
        targetNum={editTargetNum}
        selectedIcon={editIcon}
        error={editError}
        onNameChange={setEditName}
        onTargetChange={setEditTarget}
        onIconSelect={setEditIcon}
        onClose={closeEditModal}
        onSubmit={handleSaveEdit}
      />
    </div>
  );
}
