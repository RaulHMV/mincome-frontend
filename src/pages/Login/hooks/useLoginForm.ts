import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginFormValues } from '../types/login.types';

const INITIAL_LOGIN_VALUES: LoginFormValues = {
  email: '',
  password: '',
};

/** Gestiona el estado y envío del formulario de inicio de sesión. */
export function useLoginForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginFormValues>(INITIAL_LOGIN_VALUES);

  const updateField = <K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate('/');
  };

  return {
    values,
    updateField,
    handleSubmit,
  };
}

