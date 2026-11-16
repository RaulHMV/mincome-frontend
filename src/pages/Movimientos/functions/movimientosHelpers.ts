import type { BankCard } from '../../../types';

const mxnNumberFormatter = new Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formatea importes numéricos en pesos mexicanos ($0,000.00). */
export function formatCurrencyMXN(value: number): string {
  return `$${mxnNumberFormatter.format(value)}`;
}

/** Construye la etiqueta descriptiva de tarjeta o cuenta débito para selectores de gasto. */
export function cardExpenseOptionLabel(card: BankCard): string {
  const banco = card.banco || card.bank;
  const alias = card.alias;
  const terminacion = card.terminacion || card.last4;
  const isCredit = card.kind === 'Crédito' || card.tipo === 'Crédito';

  if (isCredit) {
    const limite = card.limiteCredito ?? card.limit ?? 0;
    const utilizado = card.used ?? 0;
    const disp = Math.max(0, limite - utilizado);
    return `${banco} · ${alias} •••• ${terminacion} (Crédito - Disp: $${disp.toLocaleString('es-MX')})`;
  }

  const saldo = Math.max(0, card.balance ?? 0);
  return `${banco} · ${alias} •••• ${terminacion} (Débito - Disp: $${saldo.toLocaleString('es-MX')})`;
}

/** Extrae el nombre de la meta eliminando prefijos de abono o retiro para redirigir a Apartados. */
export function extractMetaNameFromSavingsConcept(concept: string): string {
  return concept.replace(/^(Abono a|Retiro de)\s+/i, '').trim();
}

