import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerSchema } from '../../../schemas/auth.schema';
import { useAppDispatch } from '../../../store/hooks';
import { registerSuccess } from '../../../store/slices/authSlice';
import { INITIAL_REGISTER_VALUES } from '../Constants/registerConstants';
import { validateRegisterField, validateRegisterForm } from '../functions/registerHelpers';
import type { RegisterFormErrors, RegisterFormValues } from '../types/register.types';

/** Gestiona el estado, validación Zod (onBlur y submit) y envío del formulario de registro. */
export function useRegisterForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<RegisterFormValues>(INITIAL_REGISTER_VALUES);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFocusTick, setSubmitFocusTick] = useState(0);

  useEffect(() => {
    if (submitFocusTick === 0) return;
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [submitFocusTick]);

  const updateField = <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateField = (field: keyof RegisterFormValues) => {
    const fieldError = validateRegisterField(field, values);
    setErrors((prev) => {
      const next = { ...prev };
      if (fieldError) {
        next[field] = fieldError;
      } else {
        delete next[field];
      }

      if ((field === 'name' || field === 'email') && values.password.length > 0) {
        const passwordError = validateRegisterField('password', values);
        if (passwordError) {
          next.password = passwordError;
        } else {
          delete next.password;
        }
      }

      if (field === 'password' && values.confirmPassword.length > 0) {
        const confirmError = validateRegisterField('confirmPassword', values);
        if (confirmError) {
          next.confirmPassword = confirmError;
        } else {
          delete next.confirmPassword;
        }
      }

      return next;
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const validationErrors = validateRegisterForm(values);
    if (validationErrors) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      setSubmitFocusTick((prev) => prev + 1);
      return;
    }

    const parsed = registerSchema.parse(values);
    setErrors({});
    dispatch(registerSuccess({ name: parsed.name, email: parsed.email }));
    navigate('/');
  };

  return {
    values,
    errors,
    isSubmitting,
    updateField,
    validateField,
    handleSubmit,
  };
}

