import { MailCheck } from 'lucide-react';
import AuthInput from '../../../components/auth/AuthInput';
import AuthPasswordInput from '../../../components/auth/AuthPasswordInput';
import AuthSubmitButton from '../../../components/auth/AuthSubmitButton';
import type { LoginFormProps } from '../types/login.types';

/** Formulario de acceso con validación Zod, bloqueo temporal y panel de recuperación CU-06. */
export default function LoginForm({
  values,
  errors,
  lockRemainingSeconds = 0,
  recovery,
  onFieldChange,
  onFieldBlur,
  onSubmit,
}: LoginFormProps) {
  const isLocked = lockRemainingSeconds > 0;

  if (recovery.isOpen) {
    return (
      <div className="space-y-3 sm:space-y-3.5">
        <div className="rounded-2xl border border-slate-200/80 bg-[#FAF9F6] p-3.5 sm:p-4">
          <h2 className="text-sm font-bold text-[#202B33]">Recuperar contraseña</h2>
          <p className="mt-1 text-xs text-[#778089] leading-relaxed">
            {recovery.sent
              ? 'Revisa tu bandeja de entrada para continuar con el restablecimiento.'
              : 'Ingresa tu correo electrónico registrado para enviarte las instrucciones de recuperación.'}
          </p>
        </div>

        {recovery.sent ? (
          <div className="space-y-3">
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800"
            >
              <MailCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[1.75]" />
              <span>
                Si existe una cuenta asociada a{' '}
                <strong className="font-semibold">{recovery.email}</strong>, recibirás un
                enlace con los pasos para restablecer tu contraseña.
              </span>
            </div>

            <button
              type="button"
              onClick={recovery.onClose}
              className="w-full h-11 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white text-sm font-semibold shadow-2xs transition-all active:scale-[0.99] cursor-pointer"
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={recovery.onSubmit} className="space-y-3 sm:space-y-3.5">
            <AuthInput
              id="recovery-email"
              label="Correo electrónico"
              type="email"
              value={recovery.email}
              onChange={recovery.onEmailChange}
              onBlur={recovery.onEmailBlur}
              placeholder="nombre@ejemplo.com"
              autoComplete="email"
              noSpaces={true}
              error={recovery.error}
            />

            <AuthSubmitButton label="Enviar instrucciones" />

            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={recovery.onClose}
                className="text-xs font-medium text-[#202B33] underline hover:text-slate-600 transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-3 sm:space-y-3.5">
      {isLocked && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
        >
          Demasiados intentos fallidos. Por seguridad, intenta de nuevo en{' '}
          {lockRemainingSeconds}s.
        </div>
      )}

      <AuthInput
        id="login-email"
        label="Correo electrónico"
        type="email"
        value={values.email}
        onChange={(value) => onFieldChange('email', value)}
        onBlur={() => onFieldBlur('email')}
        placeholder="nombre@ejemplo.com"
        autoComplete="email"
        noSpaces={true}
        disabled={isLocked}
        error={errors?.email}
      />

      <AuthPasswordInput
        id="login-password"
        label="Contraseña"
        value={values.password}
        onChange={(value) => onFieldChange('password', value)}
        onBlur={() => onFieldBlur('password')}
        placeholder="Introduce tu contraseña"
        toggleAriaLabel="Alternar contraseña"
        autoComplete="current-password"
        disabled={isLocked}
        error={errors?.password}
      />

      {/* Olvidaste contraseña (CU-06) */}
      <div className="text-left pt-0.5">
        <button
          type="button"
          onClick={recovery.onOpen}
          className="text-xs font-medium text-[#202B33] underline hover:text-slate-600 transition-colors inline-block cursor-pointer bg-transparent border-0 p-0"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <AuthSubmitButton label="Iniciar sesión" disabled={isLocked} />
    </form>
  );
}
