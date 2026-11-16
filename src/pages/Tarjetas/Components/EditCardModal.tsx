import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';
import type { CardSchemaValues } from '../../../schemas/finance.schema';
import type { BankCard } from '../../../types';
import {
  CARD_MODAL_BACKDROP_CLASS,
  DEFAULT_CUT_DAY,
  DEFAULT_DUE_DAY,
  inputCls,
} from '../Constants/tarjetasConstants';
import type { EditCardFormState } from '../types/tarjetas.types';

interface EditCardModalProps {
  isOpen: boolean;
  card: BankCard | null;
  onClose: () => void;
  onSaveEdit: (cardId: string, candidate: CardSchemaValues) => string | null;
}

interface EditFormProps extends Omit<EditCardModalProps, 'isOpen' | 'card'> {
  card: BankCard;
}

function blockInvalidNumberKeys(e: KeyboardEvent<HTMLInputElement>) {
  if (['-', '+', 'e', 'E'].includes(e.key)) {
    e.preventDefault();
  }
}

/** Formulario interno: se monta al abrir, inicializando desde la tarjeta seleccionada. */
function EditCardForm({ card, onClose, onSaveEdit }: EditFormProps) {
  const isCredit = card.kind === 'Crédito';

  const [editForm, setEditForm] = useState<EditCardFormState>(() => ({
    alias: card.alias,
    bank: card.banco || card.bank || '',
    last4: (card.terminacion || card.last4 || '').replace(/\D/g, '').slice(-4),
    limit:
      card.limit || card.limiteCredito
        ? (card.limiteCredito ?? card.limit).toString()
        : '',
    cutDay: (card.diaCorte ?? card.cutDay ?? Number(DEFAULT_CUT_DAY)).toString(),
    dueDay: (card.diaLimitePago ?? card.dueDay ?? Number(DEFAULT_DUE_DAY)).toString(),
  }));

  const [error, setError] = useState<string | null>(null);

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedLimit = editForm.limit.trim() === '' ? NaN : Number(editForm.limit);
    const parsedCutDay = Number(editForm.cutDay);
    const parsedDueDay = Number(editForm.dueDay);

    const candidate: CardSchemaValues = isCredit
      ? {
          alias: editForm.alias,
          bank: editForm.bank,
          last4: editForm.last4,
          kind: 'Crédito',
          limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : -1,
          used: card.used,
          cutDay: Number.isFinite(parsedCutDay) ? parsedCutDay : 0,
          dueDay: Number.isFinite(parsedDueDay) ? parsedDueDay : 0,
        }
      : {
          alias: editForm.alias,
          bank: editForm.bank,
          last4: editForm.last4,
          kind: 'Débito',
          limit: 0,
          used: 0,
          balance: card.balance ?? 0,
          cutDay: card.cutDay || 1,
          dueDay: card.dueDay || 1,
        };

    const validationError = onSaveEdit(card.id, candidate);
    if (validationError) {
      setError(validationError);
    }
  };

  return createPortal(
    <div className={CARD_MODAL_BACKDROP_CLASS}>
      <form
        onSubmit={handleSaveEdit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label={`Editar ${card.alias}`}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              Editar información
            </h2>
            <p className="text-xs text-zinc-500">
              {card.kind} · Actualiza los datos de tu método de pago
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Campos comunes (Débito y Crédito) */}
        <div>
          <label
            htmlFor="edit-alias"
            className="mb-1.5 block text-xs font-medium text-zinc-500"
          >
            Alias de la tarjeta
          </label>
          <input
            id="edit-alias"
            type="text"
            maxLength={50}
            value={editForm.alias}
            onChange={(e) => {
              setEditForm({ ...editForm, alias: e.target.value });
              setError(null);
            }}
            placeholder="Ej. Nómina Santander, BBVA Oro"
            className={inputCls}
          />
        </div>

        <div>
          <label
            htmlFor="edit-banco"
            className="mb-1.5 block text-xs font-medium text-zinc-500"
          >
            Banco emisor
          </label>
          <input
            id="edit-banco"
            type="text"
            maxLength={50}
            value={editForm.bank}
            onChange={(e) => {
              setEditForm({ ...editForm, bank: e.target.value });
              setError(null);
            }}
            placeholder="Ej. BBVA, Santander, Nu"
            className={inputCls}
          />
        </div>

        <div>
          <label
            htmlFor="edit-ultimosDigitos"
            className="mb-1.5 block text-xs font-medium text-zinc-500"
          >
            Últimos 4 dígitos
          </label>
          <input
            id="edit-ultimosDigitos"
            type="text"
            maxLength={4}
            inputMode="numeric"
            pattern="[0-9]{4}"
            placeholder="Ej. 7712"
            value={editForm.last4}
            onChange={(e) => {
              setEditForm({
                ...editForm,
                last4: e.target.value.replace(/\D/g, '').slice(0, 4),
              });
              setError(null);
            }}
            className={inputCls}
          />
          <p className="mt-1 text-[11px] text-zinc-400">
            Sólo se guardan los últimos 4 dígitos para referencia visual (RNF3).
          </p>
        </div>

        {/* Campos adicionales SÓLO si es Crédito */}
        {isCredit && (
          <>
            <div>
              <label
                htmlFor="edit-limiteCredito"
                className="mb-1.5 block text-xs font-medium text-zinc-500"
              >
                Límite de crédito (MXN)
              </label>
              <input
                id="edit-limiteCredito"
                type="number"
                min="1"
                step="100"
                value={editForm.limit}
                onKeyDown={blockInvalidNumberKeys}
                onChange={(e) => {
                  setEditForm({ ...editForm, limit: e.target.value });
                  setError(null);
                }}
                placeholder="30000"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="edit-diaCorte"
                  className="mb-1.5 block text-xs font-medium text-zinc-500"
                >
                  Día de corte
                </label>
                <input
                  id="edit-diaCorte"
                  type="number"
                  min="1"
                  max="31"
                  value={editForm.cutDay}
                  onKeyDown={blockInvalidNumberKeys}
                  onChange={(e) => {
                    setEditForm({ ...editForm, cutDay: e.target.value });
                    setError(null);
                  }}
                  className={inputCls}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-diaLimitePago"
                  className="mb-1.5 block text-xs font-medium text-zinc-500"
                >
                  Día límite de pago
                </label>
                <input
                  id="edit-diaLimitePago"
                  type="number"
                  min="1"
                  max="31"
                  value={editForm.dueDay}
                  onKeyDown={blockInvalidNumberKeys}
                  onChange={(e) => {
                    setEditForm({ ...editForm, dueDay: e.target.value });
                    setError(null);
                  }}
                  className={inputCls}
                />
              </div>
            </div>
          </>
        )}

        {error && (
          <p
            role="alert"
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-[#202B33] py-2.5 text-xs font-semibold text-white transition hover:bg-[#141A29] cursor-pointer"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

/** Modal estandarizado para editar los metadatos permitidos por RNF3. */
export default function EditCardModal({
  isOpen,
  card,
  ...rest
}: EditCardModalProps) {
  if (!isOpen || !card) return null;
  return <EditCardForm key={card.id} card={card} {...rest} />;
}
