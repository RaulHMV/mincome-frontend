import {
  emailSchema,
  getPasswordIdentityError,
  nameSchema,
  passwordRulesSchema,
  registerSchema,
} from '../../../schemas/auth.schema';
import type { RegisterFormErrors, RegisterFormValues } from '../types/register.types';

/** Valida un campo individual del formulario de registro (ideal para onBlur). */
export function validateRegisterField(
  field: keyof RegisterFormValues,
  values: RegisterFormValues,
): string | undefined {
  switch (field) {
    case 'name': {
      const result = nameSchema.safeParse(values.name);
      return result.success ? undefined : result.error.issues[0]?.message;
    }
    case 'email': {
      const result = emailSchema.safeParse(values.email);
      return result.success ? undefined : result.error.issues[0]?.message;
    }
    case 'password': {
      const result = passwordRulesSchema.safeParse(values.password);
      if (!result.success) return result.error.issues[0]?.message;
      return getPasswordIdentityError(values.password, values.email, values.name);
    }
    case 'confirmPassword': {
      const result = registerSchema.shape.confirmPassword.safeParse(values.confirmPassword);
      if (!result.success) return result.error.issues[0]?.message;
      if (values.password !== values.confirmPassword) {
        return 'Las contraseñas no coinciden';
      }
      return undefined;
    }
    case 'acceptTerms': {
      const result = registerSchema.shape.acceptTerms.safeParse(values.acceptTerms);
      return result.success ? undefined : result.error.issues[0]?.message;
    }
  }
}

/** Valida el formulario completo de registro contra el esquema Zod y devuelve los errores por campo. */
export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors | null {
  const result = registerSchema.safeParse(values);
  if (result.success) return null;

  const errors: RegisterFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (
      typeof field === 'string' &&
      field in values &&
      !errors[field as keyof RegisterFormValues]
    ) {
      errors[field as keyof RegisterFormValues] = issue.message;
    }
  }
  return errors;
}

