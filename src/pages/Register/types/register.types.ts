import type { FormEvent } from 'react';

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface RegisterFormProps {
  values: RegisterFormValues;
  onFieldChange: <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K],
  ) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

