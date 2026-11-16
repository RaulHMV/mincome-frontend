import type { MouseEvent } from 'react';
import { CreditCard, Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { BankCard } from '../../../types';
import {
  formatCardMoneyMXN,
  getCardLimit,
  getDaysUntilDue,
} from '../functions/tarjetasHelpers';

interface CardListItemProps {
  card: BankCard;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onOpenDetail: (card: BankCard) => void;
  onOpenPay: (card: BankCard) => void;
  onAddFunds: (card: BankCard) => void;
  onViewMovements: () => void;
  onEdit: (card: BankCard) => void;
  onDelete: (card: BankCard) => void;
}

/** Elemento compacto de tarjeta (Crédito o Débito) con vista responsiva móvil/escritorio. */
export default function CardListItem({
  card,
  menuOpen,
  onToggleMenu,
  onOpenDetail,
  onOpenPay,
  onAddFunds,
  onViewMovements,
  onEdit,
  onDelete,
}: CardListItemProps) {
  const isCredit = card.kind === 'Crédito';
  const alias = card.alias;
  const banco = card.banco || card.bank;
  const last4 = card.terminacion || card.last4;
  const deuda = card.used;
  const limite = getCardLimit(card);
  const saldo = card.balance ?? 0;
  const diasRestantes = getDaysUntilDue(card);

  const handleToggleMenu = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleMenu();
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 sm:p-4 shadow-2xs transition-colors select-none">
      {/* ─── VISTA MÓVIL (< sm) ─── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {/* Fila 1: Identidad y Acciones de Cabecera */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 text-[#202B33]">
              <CreditCard className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-[#202B33] truncate">{alias}</span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0 ${
                    isCredit
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                  }`}
                >
                  {isCredit ? 'Crédito' : 'Débito'}
                </span>
              </div>
              <p className="text-[11px] text-[#778089]">
                {banco} · <span className="font-mono">•••• {last4}</span>
              </p>
            </div>
          </div>

          {/* Botones de Inspección / Menú */}
          <div className="relative flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onOpenDetail(card)}
              title="Ver detalles"
              aria-label={`Ver detalles de ${alias}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#202B33] hover:bg-[#E8EBED] transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 stroke-[1.75]" />
            </button>
            <button
              type="button"
              onClick={handleToggleMenu}
              title="Opciones"
              aria-label={`Opciones de ${alias}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#202B33] hover:bg-[#E8EBED] transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* Menú Contextual Móvil */}
            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-9 z-30 w-44 rounded-xl border border-[#E2E8F0] bg-white py-1 text-xs text-[#202B33] shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => onEdit(card)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5 text-slate-500" />
                  <span>Editar información</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(card)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  <span>Eliminar tarjeta</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fila 2: Montos y Botones Operativos */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="min-w-0">
            {isCredit ? (
              <div>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-base font-bold text-[#202B33] tabular-nums tracking-tight">
                    {formatCardMoneyMXN(deuda)}
                  </span>
                  <span className="text-xs text-slate-400 font-normal tabular-nums">
                    / {formatCardMoneyMXN(limite)}
                  </span>
                </div>
                <div className="mt-0.5">
                  <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded">
                    {diasRestantes} días para pago
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-base font-bold text-emerald-600 tabular-nums tracking-tight">
                  {formatCardMoneyMXN(saldo)}
                </span>
                <p className="text-[10px] text-[#778089]">Fondos disponibles</p>
              </div>
            )}
          </div>

          <div className="shrink-0">
            {isCredit ? (
              <button
                type="button"
                onClick={() => onOpenPay(card)}
                className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-[#E8EBED] text-[#202B33] font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                Pagar tarjeta
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onViewMovements}
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-[#E8EBED] text-[#202B33] font-medium text-xs transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                >
                  Ver movimientos
                </button>
                <button
                  type="button"
                  onClick={() => onAddFunds(card)}
                  className="h-8 px-3 rounded-lg border border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 font-semibold text-xs transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                >
                  + Ingresar dinero
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── VISTA ESCRITORIO (sm: en adelante) ─── */}
      <div className="hidden sm:flex sm:items-center sm:justify-between gap-4">
        {/* Identidad */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 text-[#202B33]">
            <CreditCard className="w-4 h-4 stroke-[1.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#202B33] truncate">{alias}</span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0 ${
                  isCredit
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                }`}
              >
                {isCredit ? 'Crédito' : 'Débito'}
              </span>
            </div>
            <p className="text-xs text-[#778089] mt-0.5">
              {banco} · <span className="font-mono">•••• {last4}</span>
            </p>
          </div>
        </div>

        {/* Cifras y Acciones */}
        <div className="flex items-center gap-4 shrink-0">
          {isCredit ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-sm font-bold text-[#202B33] tabular-nums tracking-tight">
                  {formatCardMoneyMXN(deuda)}
                </span>
                <span className="text-xs text-slate-400 font-normal tabular-nums ml-1">
                  / {formatCardMoneyMXN(limite)}
                </span>
              </div>
              <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                {diasRestantes} días para pago
              </span>
              <button
                type="button"
                onClick={() => onOpenPay(card)}
                className="h-8 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-[#E8EBED] text-[#202B33] font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                Pagar tarjeta
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-600 tabular-nums tracking-tight">
                  {formatCardMoneyMXN(saldo)}
                </span>
                <span className="text-xs text-[#778089] ml-1.5">Fondos disponibles</span>
              </div>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                Cuenta Activa
              </span>
              <button
                type="button"
                onClick={onViewMovements}
                className="h-8 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-[#E8EBED] text-[#202B33] font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                Ver movimientos
              </button>
              <button
                type="button"
                onClick={() => onAddFunds(card)}
                className="h-8 px-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                + Ingresar dinero
              </button>
            </div>
          )}

          {/* Ojo y Opciones */}
          <div className="relative flex items-center gap-1 border-l border-slate-100 pl-2">
            <button
              type="button"
              onClick={() => onOpenDetail(card)}
              title="Ver detalles"
              aria-label={`Ver detalles de ${alias}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#202B33] hover:bg-[#E8EBED] transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 stroke-[1.75]" />
            </button>
            <button
              type="button"
              onClick={handleToggleMenu}
              title="Opciones"
              aria-label={`Opciones de ${alias}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#202B33] hover:bg-[#E8EBED] transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* Menú Contextual Escritorio */}
            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-9 z-30 w-44 rounded-xl border border-[#E2E8F0] bg-white py-1 text-xs text-[#202B33] shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => onEdit(card)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5 text-slate-500" />
                  <span>Editar información</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(card)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  <span>Eliminar tarjeta</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
