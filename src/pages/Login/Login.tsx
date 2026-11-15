import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from './Components/LoginForm';
import { useLoginForm } from './hooks/useLoginForm';

export default function Login() {
  const {
    values,
    errors,
    lockRemainingSeconds,
    recovery,
    updateField,
    validateField,
    handleSubmit,
  } = useLoginForm();

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para gestionar tus finanzas"
      switchPrompt="¿No tienes una cuenta?"
      switchLinkLabel="Regístrate"
      switchTo="/register"
    >
      <LoginForm
        values={values}
        errors={errors}
        lockRemainingSeconds={lockRemainingSeconds}
        recovery={recovery}
        onFieldChange={updateField}
        onFieldBlur={validateField}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}

