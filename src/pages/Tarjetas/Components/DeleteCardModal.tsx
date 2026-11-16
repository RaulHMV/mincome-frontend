import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { BankCard } from '../../../types';
import { CARD_MODAL_BACKDROP_CLASS } from '../Constants/tarjetasConstants';

interface DeleteCardModalProps {
  card: BankCard | null;
  onClose: () => void;
  onConfirm: () => void;
}

/** Modal de confirmación destructiva para eliminar una tarjeta registrada. */
export default function DeleteCardModal({
  card,
  onClose,
  onConfirm,
}: DeleteCardModalProps) {
  if (!card) return null;

  return createPortal(
    <div className={CARD_MODAL_BACKDROP_CLASS}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4"
        role="dialog"
        aria-modal="true"
        aria-label={`Eliminar ${card.alias}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900">
            ¿Eliminar {card.alias}?
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed">
          ¿Eliminar {card.alias}? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 transition cursor-pointer"
          >
            Confirmar eliminación
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
