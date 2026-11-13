import AuthInput from '../../../components/auth/AuthInput';
import AuthPasswordInput from '../../../components/auth/AuthPasswordInput';
import AuthSubmitButton from '../../../components/auth/AuthSubmitButton';
import type { RegisterFormProps } from '../types/register.types';

/** Formulario de creación de cuenta con validación de contraseña y términos. */
export default function RegisterForm({ values, onFieldChange, onSubmit }: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-3.5">
      <AuthInput
        id="register-name"
        label="Nombre completo"
        type="text"
        value={values.name}
        onChange={(value) => onFieldChange('name', value)}
        placeholder="Tu nombre y apellido"
        autoComplete="name"
      />

      <AuthInput
        id="register-email"
        label="Correo electrónico"
        type="email"
        value={values.email}
        onChange={(value) => onFieldChange('email', value)}
        placeholder="nombre@ejemplo.com"
        autoComplete="email"
      />

      <AuthPasswordInput
        id="register-password"
        label="Contraseña"
        value={values.password}
        onChange={(value) => onFieldChange('password', value)}
        placeholder="Crea una contraseña segura"
        toggleAriaLabel="Alternar contraseña"
        autoComplete="new-password"
      />

      <AuthPasswordInput
        id="register-confirm-password"
        label="Confirmar contraseña"
        value={values.confirmPassword}
        onChange={(value) => onFieldChange('confirmPassword', value)}
        placeholder="Repite tu contraseña"
        toggleAriaLabel="Alternar confirmación de contraseña"
        autoComplete="new-password"
      />

      {/* Checkbox Términos */}
      <div className="flex items-center gap-2 pt-0.5 text-left">
        <input
          id="terms"
          type="checkbox"
          required
          checked={values.acceptTerms}
          onChange={(e) => onFieldChange('acceptTerms', e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-[#202B33] focus:ring-[#202B33] cursor-pointer"
        />
        <label htmlFor="terms" className="text-xs text-[#778089] cursor-pointer select-none leading-none">
          Acepto los Términos y la Política de privacidad
        </label>
      </div>

      <AuthSubmitButton label="Crear cuenta" />
    </form>
  );
}

