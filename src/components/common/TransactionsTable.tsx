import { ArrowDownRight, ArrowUpRight, Pencil, PiggyBank, Trash2 } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import type { Transaction, TxType } from '../../types';

interface TypeStyleMeta {
  label: string;
  badge: string;
  Icon: typeof ArrowDownRight;
}

const typeStyle: Record<TxType, TypeStyleMeta> = {
  gasto: { label: 'Gasto', badge: 'bg-zinc-100 text-zinc-700', Icon: ArrowDownRight },
  ingreso: {
    label: 'Ingreso',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    Icon: ArrowUpRight,
  },
  ahorro: {
    label: 'Ahorro',
    badge: 'bg-teal-50 text-teal-700 border border-teal-200/60',
    Icon: PiggyBank,
  },
};

const retiroAhorroStyle: TypeStyleMeta = {
  label: 'Retiro Ahorro',
  badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  Icon: ArrowUpRight,
};

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(val));
}

function getTypeStyle(tx: Transaction): TypeStyleMeta {
  if (tx.tipo === 'Retiro Ahorro') return retiroAhorroStyle;
  return typeStyle[tx.type] ?? typeStyle.gasto;
}

function isIncomeTx(tx: Transaction): boolean {
  return tx.type === 'ingreso' || tx.tipo === 'Retiro Ahorro';
}

function isSavingsTx(tx: Transaction): boolean {
  return tx.type === 'ahorro' && tx.tipo !== 'Retiro Ahorro';
}

function amountText(tx: Transaction): string {
  const raw = tx.amount ?? tx.monto ?? 0;
  if (isIncomeTx(tx) || isSavingsTx(tx)) {
    return `+$${formatCurrency(raw)}`;
  }
  return `-$${formatCurrency(raw)}`;
}

function amountClass(tx: Transaction): string {
  if (isIncomeTx(tx)) return 'text-emerald-600';
  if (isSavingsTx(tx)) return 'text-[#315B50]';
  return 'text-[#202B33]';
}

function renderDate(rawDate?: string): string {
  if (!rawDate) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return formatDate(rawDate);
  }
  return rawDate;
}

interface TransactionsTableProps {
  items: Transaction[];
  /** Muestra la columna ACCIONES (editar / eliminar). */
  showActions?: boolean;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}

interface RowActionsProps {
  tx: Transaction;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}

function RowActions({ tx, onEdit, onDelete }: RowActionsProps) {
  const conceptLabel = tx.concept || tx.concepto || '';

  return (
    <div className="flex items-center justify-end gap-1 text-slate-400">
      <button
        type="button"
        aria-label={`Editar ${conceptLabel}`}
        title="Editar"
        onClick={() => onEdit?.(tx)}
        className="p-1.5 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Eliminar ${conceptLabel}`}
        title="Eliminar"
        onClick={() => onDelete?.(tx.id)}
        className="p-1.5 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/** Tabla responsiva de movimientos compartida entre Movimientos e Historial. */
export default function TransactionsTable({
  items,
  showActions = false,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  if (items.length === 0) {
    return (
      <div className="px-6 py-14 text-center text-sm text-slate-500 bg-white">
        No hay movimientos que coincidan con la búsqueda.
      </div>
    );
  }

  return (
    <>
      {/* Tabla ≥ md */}
      <div className="hidden overflow-x-auto md:block w-full">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-white border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white">Fecha</th>
              <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white">Concepto</th>
              <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white">Categoría</th>
              <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white">Medio</th>
              <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white">Tipo</th>
              <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white text-right">Monto</th>
              {showActions && (
                <th className="py-3.5 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white text-right">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {items.map((tx) => {
              const s = getTypeStyle(tx);
              const concept = tx.concept || tx.concepto || '';
              const category = tx.category || tx.categoria || '';
              const method = tx.method || tx.medio || 'Débito';
              const account = tx.cuenta || '';

              return (
                <tr key={tx.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                  <td className="whitespace-nowrap py-3 px-4 text-[13px] text-slate-500 font-medium">
                    {renderDate(tx.date || tx.fecha)}
                  </td>
                  <td className="py-3 px-4 text-[13px] font-medium text-[#202B33]">
                    <div className="flex items-center gap-2">
                      <span>{concept}</span>
                      {tx.recurring && (
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                          Recurrente
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-slate-600">{category}</td>
                  <td className="py-3 px-4 text-[13px]">
                    <div className="text-[#202B33] font-medium">{method}</div>
                    {account && (
                      <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                        {account}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium', s.badge)}>
                      <s.Icon className="h-3.5 w-3.5 stroke-[2]" />
                      <span>{s.label}</span>
                    </span>
                  </td>
                  <td className={cn('py-3 px-4 text-right font-mono tabular-nums font-semibold text-[13px]', amountClass(tx))}>
                    {amountText(tx)}
                  </td>
                  {showActions && (
                    <td className="py-3 px-4 text-right">
                      <RowActions tx={tx} onEdit={onEdit} onDelete={onDelete} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Lista < md */}
      <ul className="divide-y divide-slate-100 bg-white md:hidden">
        {items.map((tx) => {
          const s = getTypeStyle(tx);
          const concept = tx.concept || tx.concepto || '';
          const category = tx.category || tx.categoria || '';
          const method = tx.method || tx.medio || 'Débito';
          const account = tx.cuenta || '';

          return (
            <li key={tx.id} className="flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50/50 transition-colors">
              <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', s.badge)}>
                <s.Icon className="h-4 w-4 stroke-[2]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#202B33]">{concept}</p>
                <p className="truncate text-xs text-slate-500">
                  {category} · {account || method} · {renderDate(tx.date || tx.fecha)}
                </p>
              </div>
              <span className={cn('whitespace-nowrap font-mono tabular-nums font-semibold text-[13px]', amountClass(tx))}>
                {amountText(tx)}
              </span>
              {showActions && <RowActions tx={tx} onEdit={onEdit} onDelete={onDelete} />}
            </li>
          );
        })}
      </ul>
    </>
  );
}

