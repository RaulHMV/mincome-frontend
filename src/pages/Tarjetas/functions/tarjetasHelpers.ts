import { daysUntilDay } from '../../../data/mockData';
import type { BankCard } from '../../../types';
import { HEALTHY_CREDIT_THRESHOLD_PCT } from '../Constants/tarjetasConstants';
import type { UpcomingCardDateRow } from '../types/tarjetas.types';

/** Obtiene el límite de crédito efectivo de una tarjeta. */
export function getCardLimit(card: BankCard): number {
  return card.limiteCredito ?? card.limit ?? 0;
}

/** Calcula la línea de crédito disponible de una tarjeta (>= 0). */
export function getAvailableCredit(card: BankCard): number {
  return Math.max(0, getCardLimit(card) - card.used);
}

/** Calcula el porcentaje de uso respecto al límite de crédito. */
export function getCreditUsagePercentage(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((used / limit) * 100);
}

/** Determina si el porcentaje de utilización se mantiene en rango saludable (<= 30%). */
export function isHealthyCreditUsage(pct: number): boolean {
  return pct <= HEALTHY_CREDIT_THRESHOLD_PCT;
}

/** Calcula los días naturales restantes hasta el próximo día de corte de la tarjeta. */
export function getDaysUntilCut(card: BankCard): number {
  return daysUntilDay(card.diaCorte ?? card.cutDay);
}

/** Calcula los días naturales restantes hasta la próxima fecha límite de pago. */
export function getDaysUntilDue(card: BankCard): number {
  return daysUntilDay(card.diaLimitePago ?? card.dueDay);
}

/** Construye y ordena las filas de fechas próximas priorizando pagos más cercanos. */
export function buildUpcomingCardDates(creditCards: BankCard[]): UpcomingCardDateRow[] {
  return creditCards
    .map((card) => {
      const cutDay = card.diaCorte ?? card.cutDay;
      const dueDay = card.diaLimitePago ?? card.dueDay;
      return {
        card,
        cutDay,
        dueDay,
        daysUntilCut: daysUntilDay(cutDay),
        daysUntilDue: daysUntilDay(dueDay),
        hasDebt: card.used > 0,
      };
    })
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

/** Formatea montos monetarios en pesos mexicanos con prefijo $ y 2 decimales. */
export function formatCardMoneyMXN(value: number): string {
  return `$${value.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
