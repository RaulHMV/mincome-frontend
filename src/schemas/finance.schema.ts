import { z } from 'zod';
import type { PaymentMethod, TxType } from '../types';

const TX_TYPES = ['gasto', 'ingreso', 'ahorro'] as const satisfies readonly TxType[];
const PAYMENT_METHODS = ['Efectivo', 'Débito', 'Crédito'] as const satisfies readonly PaymentMethod[];
const CARD_KINDS = ['Crédito', 'Débito'] as const;
const GOAL_MOVEMENT_TYPES = ['abono', 'retiro'] as const;

/** Verifica máximo 2 decimales tolerando ruido de punto flotante IEEE-754 (p. ej. 19.99 * 100). */
function hasMaxTwoDecimals(val: number): boolean {
  if (!Number.isFinite(val)) return false;
  return Math.abs(val * 100 - Math.round(val * 100)) < 1e-4;
}

/* ───────── Auth (re-exportado desde auth.schema para compatibilidad) ───────── */

export {
  loginSchema as authSchema,
  registerSchema,
  type LoginSchemaValues as AuthFormValues,
  type RegisterSchemaValues,
} from './auth.schema';

/* ───────── Validadores base reutilizables (PostgreSQL mincome-start) ───────── */

export const positiveMoneySchema = z
  .number({ message: 'Ingresa un monto numérico válido' })
  .finite('El monto debe ser un número finito')
  .positive('El monto debe ser mayor a cero')
  .max(9999999999.99, 'El monto excede el límite permitido')
  .refine(hasMaxTwoDecimals, 'Máximo 2 decimales permitidos');

export const isoDateSchema = z
  .string({ message: 'La fecha es obligatoria' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
  .refine((val) => {
    const [y, m, d] = val.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }, 'La fecha no existe en el calendario');

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido (#RRGGBB)');

/* ───────── Esquemas por entidad ───────── */

export const transactionSchema = z
  .object({
    date: isoDateSchema,
    concept: z
      .string({ message: 'El concepto es obligatorio' })
      .trim()
      .min(1, 'El concepto es obligatorio')
      .max(120, 'El concepto no puede exceder 120 caracteres'),
    category: z
      .string({ message: 'La categoría es obligatoria' })
      .trim()
      .min(1, 'La categoría es obligatoria')
      .max(50, 'Máximo 50 caracteres'),
    type: z.enum(TX_TYPES),
    method: z.enum(PAYMENT_METHODS),
    amount: positiveMoneySchema,
    recurring: z.boolean(),
    cuenta: z.string().trim().max(80, 'Máximo 80 caracteres').optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if ((data.method === 'Débito' || data.method === 'Crédito') && (!data.cuenta || data.cuenta.length === 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['cuenta'],
        message: 'La cuenta o tarjeta es obligatoria para pagos con Débito o Crédito',
      });
    }
  });

export const budgetLimitUpdateSchema = z
  .object({
    category: z
      .string({ message: 'La categoría es obligatoria' })
      .trim()
      .min(1, 'La categoría es obligatoria')
      .max(50, 'Máximo 50 caracteres'),
    limit: positiveMoneySchema,
    umbralAlerta: z
      .number({ message: 'El umbral debe ser un número entero' })
      .int('El umbral debe ser un número entero')
      .min(1, 'El umbral mínimo es 1%')
      .max(99, 'El umbral máximo es 99%')
      .default(80)
      .optional(),
  })
  .strict();

export const budgetsBatchSchema = z
  .array(budgetLimitUpdateSchema)
  .min(1, 'Debe haber al menos una categoría');

export const goalSchema = z
  .object({
    name: z
      .string({ message: 'El nombre es obligatorio' })
      .trim()
      .min(1, 'El nombre es obligatorio')
      .max(60, 'Máximo 60 caracteres'),
    saved: z
      .number({ message: 'Ingresa un monto numérico válido' })
      .finite('El saldo debe ser un número finito')
      .min(0, 'El saldo no puede ser negativo')
      .max(999999999999.99, 'El saldo excede el límite permitido')
      .refine(hasMaxTwoDecimals, 'Máximo 2 decimales permitidos'),
    target: positiveMoneySchema,
  })
  .strict();

export const goalMovementSchema = z
  .object({
    tipo: z.enum(GOAL_MOVEMENT_TYPES),
    monto: positiveMoneySchema,
    nota: z.string().trim().max(200, 'Máximo 200 caracteres').optional(),
  })
  .strict();

/** RNF3: .strict() rechaza cualquier campo sensible como CVV, NIP, número completo o titular. */
export const cardSchema = z
  .object({
    alias: z
      .string({ message: 'El alias es obligatorio' })
      .trim()
      .min(1, 'El alias es obligatorio')
      .max(50, 'Máximo 50 caracteres')
      .refine(
        (val) => !/(?:\d[\s-]*){13,}/.test(val),
        'Seguridad RNF3: No ingreses el número completo de tarjeta en el alias',
      ),
    bank: z
      .string({ message: 'El banco es obligatorio' })
      .trim()
      .min(1, 'El banco es obligatorio')
      .max(50, 'Máximo 50 caracteres'),
    last4: z.string().regex(/^\d{4}$/, 'Solo los últimos 4 dígitos'),
    kind: z.enum(CARD_KINDS),
    limit: z.number({ message: 'Ingresa un límite numérico válido' }).finite().min(0, 'El límite no puede ser negativo'),
    used: z.number({ message: 'Ingresa un monto numérico válido' }).finite().min(0, 'El saldo utilizado no puede ser negativo'),
    balance: z.number({ message: 'Ingresa un saldo numérico válido' }).finite().min(0, 'El saldo no puede ser negativo').optional(),
    cutDay: z.number({ message: 'El día de corte es obligatorio' }).int('Debe ser entero').min(1).max(31),
    dueDay: z.number({ message: 'El día límite es obligatorio' }).int('Debe ser entero').min(1).max(31),
  })
  .strict();

export const payCardSchema = z
  .object({
    cardId: z
      .string({ message: 'Selecciona una tarjeta' })
      .trim()
      .min(1, 'Selecciona una tarjeta'),
    amount: positiveMoneySchema,
    sourceMethod: z.enum(['Efectivo', 'Débito']),
  })
  .strict();

/* ───────── Tipos inferidos ───────── */

export type TransactionSchemaValues = z.infer<typeof transactionSchema>;
export type BudgetLimitUpdateValues = z.infer<typeof budgetLimitUpdateSchema>;
export type BudgetsBatchValues = z.infer<typeof budgetsBatchSchema>;
export type GoalSchemaValues = z.infer<typeof goalSchema>;
export type GoalMovementSchemaValues = z.infer<typeof goalMovementSchema>;
export type CardSchemaValues = z.infer<typeof cardSchema>;
export type PayCardSchemaValues = z.infer<typeof payCardSchema>;
