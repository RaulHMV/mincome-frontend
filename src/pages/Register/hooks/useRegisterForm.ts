import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { INITIAL_REGISTER_VALUES } from '../Constants/registerConstants';
import { validateRegisterForm } from '../functions/registerHelpers';
import type { RegisterFormValues } from '../types/register.types';

/** Gestiona el estado, validación y envío del formulario de registro. */
export function useRegisterForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterFormValues>(INITIAL_REGISTER_VALUES);

  const updateField = <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errorMessage = validateRegisterForm(values);
    if (errorMessage) {
      alert(errorMessage);
      return;
    }
    navigate('/');
  };

  return {
    values,
    updateField,
    handleSubmit,
  };
}

