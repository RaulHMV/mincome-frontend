import type { RegisterFormValues } from '../types/register.types';

export const INITIAL_REGISTER_VALUES: RegisterFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

export const REGISTER_VALIDATION_MESSAGES = {
  passwordMismatch: 'Las contraseñas no coinciden.',
  termsRequired: 'Debes aceptar los términos y condiciones.',
} as const;

