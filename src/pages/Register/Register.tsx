import AuthLayout from '../../components/auth/AuthLayout';
import RegisterForm from './Components/RegisterForm';
import { useRegisterForm } from './hooks/useRegisterForm';

export default function Register() {
  const { values, errors, isSubmitting, updateField, validateField, handleSubmit } = useRegisterForm();

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Comienza a tomar el control de tus finanzas"
      switchPrompt="¿Ya tienes una cuenta?"
      switchLinkLabel="Inicia sesión"
      switchTo="/login"
    >
      <RegisterForm
        values={values}
        errors={errors}
        isSubmitting={isSubmitting}
        onFieldChange={updateField}
        onFieldBlur={validateField}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}

