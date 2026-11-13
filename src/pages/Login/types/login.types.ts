import type { FormEvent } from 'react';

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormProps {
  values: LoginFormValues;
  onFieldChange: <K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K],
  ) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

