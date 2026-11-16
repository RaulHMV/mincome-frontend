import { z } from 'zod';
import { positiveMoneySchema } from './finance.schema';

const MAX_SIMULATION_AMOUNT = 9999999999.99;

/** Verifica máximo 2 decimales tolerando ruido de punto flotante IEEE-754. */
function hasMaxTwoDecimals(val: number): boolean {
  if (!Number.isFinite(val)) return false;
  return Math.abs(val * 100 - Math.round(val * 100)) < 1e-4;
}

export const simulationAmountInputSchema = z
  .string({ message: 'Ingresa un monto numérico válido' })
  .superRefine((raw, ctx) => {
    const trimmed = raw.trim();
    if (trimmed === '') return;

    if (trimmed.startsWith('-')) {
      ctx.addIssue({
        code: 'custom',
        message: 'El monto debe ser mayor o igual a cero',
      });
      return;
    }

    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ingresa un monto numérico válido',
      });
      return;
    }

    const num = Number(trimmed);
    if (!Number.isFinite(num) || num < 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'El monto debe ser mayor o igual a cero',
      });
      return;
    }

    if (num > MAX_SIMULATION_AMOUNT) {
      ctx.addIssue({
        code: 'custom',
        message: 'El monto excede el límite permitido',
      });
      return;
    }

    if (!hasMaxTwoDecimals(num)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Máximo 2 decimales permitidos',
      });
    }
  });

export const simulationInputsSchema = z
  .object({
    dineroExtra: simulationAmountInputSchema,
    gastoImprevisto: simulationAmountInputSchema,
    ahorroDiario: simulationAmountInputSchema,
  })
  .strict();

/** Alineado a la tabla simulacion_movimientos de PostgreSQL. */
export const simulatedMovementSchema = z
  .object({
    title: z
      .string({ message: 'El concepto es obligatorio' })
      .trim()
      .min(1, 'El concepto es obligatorio')
      .max(120, 'El concepto no puede exceder 120 caracteres'),
    amount: positiveMoneySchema,
    kind: z.enum(['ingreso', 'pago']),
    day: z
      .number({ message: 'El día es obligatorio' })
      .int('El día debe ser un número entero')
      .min(1, 'El día debe estar entre 1 y 31')
      .max(31, 'El día debe estar entre 1 y 31'),
  })
  .strict();

export type SimulationAmountInput = z.infer<typeof simulationAmountInputSchema>;
export type SimulationInputsValues = z.infer<typeof simulationInputsSchema>;
export type SimulatedMovementValues = z.infer<typeof simulatedMovementSchema>;
