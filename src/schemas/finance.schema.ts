import { z } from 'zod';
import type { PaymentMethod, TxType } from '../types';

const TX_TYPES = ['gasto', 'ingreso', 'ahorro'] as const satisfies readonly TxType[];
const PAYMENT_METHODS = ['Efectivo', 'Débito', 'Crédito'] as const satisfies readonly PaymentMethod[];

export const authSchema = z.object({
  email: z.string().trim().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = authSchema
  .extend({
    name: z.string().trim().min(2, 'Ingresa tu nombre completo'),
    confirmPassword: z.string().min(6, 'Confirma tu contraseña'),
    acceptTerms: z.literal(true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const transactionSchema = z.object({
  date: z.string().min(1, 'La fecha es obligatoria'),
  concept: z.string().trim().min(1, 'El concepto es obligatorio').max(120, 'El concepto es demasiado largo'),
  category: z.string().trim().min(1, 'La categoría es obligatoria'),
  type: z.enum(TX_TYPES),
  method: z.enum(PAYMENT_METHODS),
  amount: z.number().positive('El monto debe ser mayor a cero'),
  recurring: z.boolean(),
  cuenta: z.string().optional(),
});

export type AuthFormValues = z.infer<typeof authSchema>;
export type RegisterSchemaValues = z.infer<typeof registerSchema>;
export type TransactionSchemaValues = z.infer<typeof transactionSchema>;

