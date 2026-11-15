import type { FormEvent } from 'react';
import type { LoginFormInput } from '../../../schemas/auth.schema';

export type LoginFormValues = LoginFormInput;

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

export interface LoginRecoveryState {
  isOpen: boolean;
  email: string;
  error?: string;
  sent: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onEmailBlur: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export interface LoginFormProps {
  values: LoginFormValues;
  errors?: LoginFormErrors;
  lockRemainingSeconds?: number;
  recovery: LoginRecoveryState;
  onFieldChange: <K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K],
  ) => void;
  onFieldBlur: (field: keyof LoginFormValues) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

