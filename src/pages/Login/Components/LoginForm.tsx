import AuthInput from '../../../components/auth/AuthInput';
import AuthPasswordInput from '../../../components/auth/AuthPasswordInput';
import AuthSubmitButton from '../../../components/auth/AuthSubmitButton';
import type { LoginFormProps } from '../types/login.types';

/** Formulario de acceso con correo, contraseña y enlace de recuperación. */
export default function LoginForm({ values, onFieldChange, onSubmit }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-3.5">
      <AuthInput
        id="login-email"
        label="Correo electrónico"
        type="email"
        value={values.email}
        onChange={(value) => onFieldChange('email', value)}
        placeholder="nombre@ejemplo.com"
        autoComplete="email"
      />

      <AuthPasswordInput
        id="login-password"
        label="Contraseña"
        value={values.password}
        onChange={(value) => onFieldChange('password', value)}
        placeholder="Introduce tu contraseña"
        toggleAriaLabel="Alternar contraseña"
        autoComplete="current-password"
      />

      {/* Olvidaste contraseña */}
      <div className="text-left pt-0.5">
        <a
          href="#recuperar"
          onClick={(e) => e.preventDefault()}
          className="text-xs font-medium text-[#202B33] underline hover:text-slate-600 transition-colors inline-block cursor-pointer"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <AuthSubmitButton label="Iniciar sesión" />
    </form>
  );
}

