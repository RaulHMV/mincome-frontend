import { REGISTER_VALIDATION_MESSAGES } from '../Constants/registerConstants';
import type { RegisterFormValues } from '../types/register.types';

/** Valida que las contraseñas coincidan y que se acepten los términos y condiciones. */
export function validateRegisterForm(values: RegisterFormValues): string | null {
  if (values.password !== values.confirmPassword) {
    return REGISTER_VALIDATION_MESSAGES.passwordMismatch;
  }
  if (!values.acceptTerms) {
    return REGISTER_VALIDATION_MESSAGES.termsRequired;
  }
  return null;
}

