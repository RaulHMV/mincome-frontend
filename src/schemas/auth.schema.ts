import { z } from 'zod';

/* ───────── Helpers y constantes de validación estricta ───────── */

const WHITESPACE_REGEX = /[\s\u00A0\u200B-\u200D\uFEFF]/;
const ASCII_PRINTABLE_REGEX = /^[\x21-\x7E]+$/;
const REPEATED_CHARS_REGEX = /(.)\1{2,}/i;
const SEQUENTIAL_PATTERNS = [
  '0123456789',
  '9876543210',
  'abcdefghijklmnopqrstuvwxyz',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
] as const;

export const COMMON_WEAK_PASSWORDS = [
  'password',
  '123456',
  'qwerty',
  'admin',
  'mincome',
  'welcome',
  'usuario',
  'cliente',
  'temporal',
  'prueba',
] as const;

export function hasNoWhitespace(val: string): boolean {
  return !WHITESPACE_REGEX.test(val);
}

export function hasNoRepeatedChars(val: string): boolean {
  return !REPEATED_CHARS_REGEX.test(val);
}

/** Detecta secuencias de 4 caracteres consecutivos en teclado, alfabeto o números. */
export function hasSequentialPattern(val: string): boolean {
  const lower = val.toLowerCase();
  return SEQUENTIAL_PATTERNS.some((pattern) => {
    for (let i = 0; i <= pattern.length - 4; i += 1) {
      if (lower.includes(pattern.slice(i, i + 4))) {
        return true;
      }
    }
    return false;
  });
}

/** Verifica que la contraseña no contenga el prefijo del correo ni palabras del nombre. */
export function getPasswordIdentityError(
  password: string,
  email: string,
  name: string,
): string | undefined {
  const lowerPassword = password.toLowerCase();
  const emailPrefix = email.trim().split('@')[0]?.toLowerCase() ?? '';
  if (emailPrefix.length >= 3 && lowerPassword.includes(emailPrefix)) {
    return 'La contraseña no debe contener tu correo electrónico';
  }

  const nameTokens = name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length >= 3);
  if (nameTokens.some((token) => lowerPassword.includes(token))) {
    return 'La contraseña no debe contener tu nombre o apellido';
  }

  return undefined;
}

/* ───────── Esquemas de autenticación (PostgreSQL mincome-start / Amazon Cognito) ───────── */

export const nameSchema = z
  .string({ message: 'El nombre completo es obligatorio' })
  .trim()
  .transform((val) => val.replace(/\s+/g, ' '))
  .pipe(
    z
      .string()
      .min(5, 'Ingresa tu nombre y apellido (mínimo 5 caracteres)')
      .max(100, 'El nombre no puede exceder 100 caracteres')
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{2,}(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{2,})+$/,
        'Ingresa al menos un nombre y un apellido válidos (solo letras, mínimo 2 letras por palabra)',
      )
      .refine(hasNoRepeatedChars, 'El nombre contiene caracteres repetidos inválidos'),
  );

export const emailSchema = z
  .string({ message: 'El correo electrónico es obligatorio' })
  .trim()
  .min(1, 'El correo electrónico es obligatorio')
  .max(254, 'El correo no puede exceder 254 caracteres')
  .refine(hasNoWhitespace, 'El correo no puede contener espacios')
  .refine(
    (val) => !val.startsWith('.') && !val.includes('.@') && !val.includes('..'),
    'El correo tiene puntos en posiciones inválidas',
  )
  .regex(
    /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
    'Ingresa un correo electrónico válido (usuario@dominio.ext)',
  )
  .transform((val) => val.toLowerCase());

export const passwordRulesSchema = z
  .string({ message: 'La contraseña es obligatoria' })
  .min(8, 'Mínimo 8 caracteres')
  .max(128, 'Máximo 128 caracteres')
  .refine(hasNoWhitespace, 'No puede contener espacios')
  .refine(
    (val) => ASCII_PRINTABLE_REGEX.test(val),
    'Solo se permiten caracteres estándar sin emojis ni acentos',
  )
  .regex(/[A-Z]/, 'Incluye al menos una letra mayúscula (A-Z)')
  .regex(/[a-z]/, 'Incluye al menos una letra minúscula (a-z)')
  .regex(/[0-9]/, 'Incluye al menos un número (0-9)')
  .regex(/[^A-Za-z0-9]/, 'Incluye al menos un símbolo especial (@, #, $, %, !, &, *)')
  .refine(hasNoRepeatedChars, 'No repitas el mismo carácter 3 o más veces seguidas')
  .refine((val) => !hasSequentialPattern(val), 'Evita secuencias obvias (ej. 1234, abcd, qwer)')
  .refine(
    (val) => !COMMON_WEAK_PASSWORDS.some((weak) => val.toLowerCase().includes(weak)),
    'Contraseña demasiado común o predecible',
  );

export const loginSchema = z
  .object({
    email: emailSchema,
    password: passwordRulesSchema,
  })
  .strict();

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordRulesSchema,
    confirmPassword: z
      .string({ message: 'Confirma tu contraseña' })
      .min(1, 'Confirma tu contraseña')
      .refine(hasNoWhitespace, 'No puede contener espacios'),
    acceptTerms: z.literal(true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Las contraseñas no coinciden',
      });
    }
    const identityError = getPasswordIdentityError(data.password, data.email, data.name);
    if (identityError) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: identityError,
      });
    }
  });

export interface PasswordChecklistItem {
  id: string;
  label: string;
  met: boolean;
}

/** Evalúa en tiempo real cada requisito de fortaleza de contraseña para el checklist visual. */
export function evaluatePasswordChecklist(password: string): PasswordChecklistItem[] {
  return [
    {
      id: 'min-length',
      label: 'Mínimo 8 caracteres',
      met: password.length >= 8,
    },
    {
      id: 'allowed-chars',
      label: 'Sin espacios ni caracteres no permitidos',
      met: password.length > 0 && hasNoWhitespace(password) && ASCII_PRINTABLE_REGEX.test(password),
    },
    {
      id: 'upper-lower',
      label: 'Una mayúscula y una minúscula',
      met: /[A-Z]/.test(password) && /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'Al menos un número',
      met: /[0-9]/.test(password),
    },
    {
      id: 'special-char',
      label: 'Al menos un símbolo especial',
      met: /[^A-Za-z0-9\s]/.test(password),
    },
    {
      id: 'no-patterns',
      label: 'Sin repeticiones (aaa, 111) ni secuencias (1234, abcd)',
      met: password.length > 0 && hasNoRepeatedChars(password) && !hasSequentialPattern(password),
    },
  ];
}

/* ───────── Tipos inferidos (entrada y salida validada) ───────── */

export type LoginFormInput = z.input<typeof loginSchema>;
export type RegisterFormInput = z.input<typeof registerSchema>;
export type LoginSchemaValues = z.infer<typeof loginSchema>;
export type RegisterSchemaValues = z.infer<typeof registerSchema>;
