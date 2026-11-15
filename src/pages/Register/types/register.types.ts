import type { FormEvent } from 'react';
import type { RegisterFormInput } from '../../../schemas/auth.schema';

export type RegisterFormValues = Omit<RegisterFormInput, 'acceptTerms'> & {
  acceptTerms: boolean;
};

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>;

export interface RegisterFormProps {
  values: RegisterFormValues;
  errors?: RegisterFormErrors;
  isSubmitting?: boolean;
  onFieldChange: <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K],
  ) => void;
  onFieldBlur: (field: keyof RegisterFormValues) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

