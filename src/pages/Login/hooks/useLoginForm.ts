import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailSchema, loginSchema, passwordRulesSchema } from '../../../schemas/auth.schema';
import { useAppDispatch } from '../../../store/hooks';
import { loginSuccess } from '../../../store/slices/authSlice';
import type { LoginFormErrors, LoginFormValues, LoginRecoveryState } from '../types/login.types';

const INITIAL_LOGIN_VALUES: LoginFormValues = {
  email: '',
  password: '',
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30_000;
const STRIP_WHITESPACE_REGEX = /[\s\u00A0\u200B-\u200D\uFEFF]/g;

function stripSpaces(value: string): string {
  return value.replace(STRIP_WHITESPACE_REGEX, '');
}

/** Gestiona el estado, validación Zod (onBlur y submit), bloqueo temporal y recuperación CU-06. */
export function useLoginForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [values, setValues] = useState<LoginFormValues>(INITIAL_LOGIN_VALUES);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState(0);

  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | undefined>(undefined);
  const [recoverySent, setRecoverySent] = useState(false);
  const [submitFocusTick, setSubmitFocusTick] = useState(0);

  useEffect(() => {
    if (submitFocusTick === 0) return;
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [submitFocusTick]);

  useEffect(() => {
    if (lockUntil === null) return;

    const timer = window.setInterval(() => {
      const remainingMs = lockUntil - Date.now();
      if (remainingMs <= 0) {
        setLockUntil(null);
        setFailedAttempts(0);
        setLockRemainingSeconds(0);
        return;
      }
      setLockRemainingSeconds(Math.ceil(remainingMs / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [lockUntil]);

  const updateField = <K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateField = (field: keyof LoginFormValues) => {
    const cleaned = stripSpaces(values[field]);
    const result =
      field === 'email'
        ? emailSchema.safeParse(cleaned)
        : passwordRulesSchema.safeParse(cleaned);

    setErrors((prev) => {
      const next = { ...prev };
      if (!result.success) {
        next[field] = result.error.issues[0]?.message;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (lockUntil !== null && Date.now() < lockUntil) {
      return;
    }

    const cleanedValues: LoginFormValues = {
      email: stripSpaces(values.email),
      password: stripSpaces(values.password),
    };
    setValues(cleanedValues);

    const result = loginSchema.safeParse(cleanedValues);
    if (!result.success) {
      const nextErrors: LoginFormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if ((field === 'email' || field === 'password') && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);

      const currentAttempts = lockUntil !== null && Date.now() >= lockUntil ? 0 : failedAttempts;
      const nextAttempts = currentAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
        setLockUntil(Date.now() + LOCK_DURATION_MS);
        setLockRemainingSeconds(Math.ceil(LOCK_DURATION_MS / 1000));
      } else {
        if (lockUntil !== null) {
          setLockUntil(null);
          setLockRemainingSeconds(0);
        }
        setSubmitFocusTick((prev) => prev + 1);
      }
      return;
    }

    setErrors({});
    setFailedAttempts(0);
    setLockUntil(null);
    setLockRemainingSeconds(0);
    dispatch(loginSuccess({ email: result.data.email }));
    navigate('/');
  };

  const validateRecoveryEmail = () => {
    const cleaned = stripSpaces(recoveryEmail);
    const result = emailSchema.safeParse(cleaned);
    setRecoveryError(result.success ? undefined : result.error.issues[0]?.message);
  };

  const handleRecoverySubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleaned = stripSpaces(recoveryEmail);
    const result = emailSchema.safeParse(cleaned);
    if (!result.success) {
      setRecoveryError(result.error.issues[0]?.message);
      setSubmitFocusTick((prev) => prev + 1);
      return;
    }

    setRecoveryEmail(result.data);
    setRecoveryError(undefined);
    setRecoverySent(true);
  };

  const recovery: LoginRecoveryState = {
    isOpen: isRecoveryOpen,
    email: recoveryEmail,
    error: recoveryError,
    sent: recoverySent,
    onOpen: () => {
      setRecoveryEmail(stripSpaces(values.email));
      setRecoveryError(undefined);
      setRecoverySent(false);
      setIsRecoveryOpen(true);
    },
    onClose: () => {
      setRecoveryError(undefined);
      setRecoverySent(false);
      setIsRecoveryOpen(false);
    },
    onEmailChange: (value: string) => {
      setRecoveryEmail(value);
      if (recoveryError) setRecoveryError(undefined);
    },
    onEmailBlur: validateRecoveryEmail,
    onSubmit: handleRecoverySubmit,
  };

  return {
    values,
    errors,
    lockRemainingSeconds,
    recovery,
    updateField,
    validateField,
    handleSubmit,
  };
}
