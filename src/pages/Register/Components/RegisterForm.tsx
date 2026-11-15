import { Check, Circle } from 'lucide-react';
import AuthInput from '../../../components/auth/AuthInput';
import AuthPasswordInput from '../../../components/auth/AuthPasswordInput';
import AuthSubmitButton from '../../../components/auth/AuthSubmitButton';
import { evaluatePasswordChecklist } from '../../../schemas/auth.schema';
import type { RegisterFormProps } from '../types/register.types';

/** Formulario de creación de cuenta con validación de contraseña, checklist en vivo y términos. */
export default function RegisterForm({
  values,
  errors,
  isSubmitting = false,
  onFieldChange,
  onFieldBlur,
  onSubmit,
}: RegisterFormProps) {
  const passwordChecklist = evaluatePasswordChecklist(values.password);
  const showPasswordChecklist = values.password.length > 0 || Boolean(errors?.password);
  const passwordsMatch =
    values.confirmPassword.length > 0 &&
    !errors?.confirmPassword &&
    values.password === values.confirmPassword;

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-3 sm:space-y-3.5">
      <AuthInput
        id="register-name"
        label="Nombre completo"
        type="text"
        value={values.name}
        onChange={(value) => onFieldChange('name', value)}
        onBlur={() => onFieldBlur('name')}
        placeholder="Tu nombre y apellido"
        autoComplete="name"
        disabled={isSubmitting}
        error={errors?.name}
      />

      <AuthInput
        id="register-email"
        label="Correo electrónico"
        type="email"
        value={values.email}
        onChange={(value) => onFieldChange('email', value)}
        onBlur={() => onFieldBlur('email')}
        placeholder="nombre@ejemplo.com"
        autoComplete="email"
        noSpaces={true}
        disabled={isSubmitting}
        error={errors?.email}
      />

      <div>
        <AuthPasswordInput
          id="register-password"
          label="Contraseña"
          value={values.password}
          onChange={(value) => onFieldChange('password', value)}
          onBlur={() => onFieldBlur('password')}
          placeholder="Crea una contraseña segura"
          toggleAriaLabel="Alternar contraseña"
          autoComplete="new-password"
          disabled={isSubmitting}
          error={errors?.password}
        />
        {showPasswordChecklist && (
          <ul
            aria-label="Requisitos de contraseña"
            className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 rounded-xl border border-slate-200/80 bg-[#FAF9F6] px-3 py-2"
          >
            {passwordChecklist.map((item) => (
              <li
                key={item.id}
                className={`flex items-center gap-1.5 text-[11px] leading-tight transition-colors ${
                  item.met
                    ? 'text-emerald-600 font-medium'
                    : errors?.password
                      ? 'text-rose-600'
                      : 'text-[#778089]'
                }`}
              >
                {item.met ? (
                  <Check className="w-3 h-3 shrink-0 stroke-[2.2]" />
                ) : (
                  <Circle className="w-2.5 h-2.5 shrink-0 stroke-[2]" />
                )}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <AuthPasswordInput
          id="register-confirm-password"
          label="Confirmar contraseña"
          value={values.confirmPassword}
          onChange={(value) => onFieldChange('confirmPassword', value)}
          onBlur={() => onFieldBlur('confirmPassword')}
          placeholder="Repite tu contraseña"
          toggleAriaLabel="Alternar confirmación de contraseña"
          autoComplete="new-password"
          disabled={isSubmitting}
          error={errors?.confirmPassword}
        />
        {passwordsMatch && (
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.2]" aria-hidden="true" />
            <span>Las contraseñas coinciden</span>
          </p>
        )}
      </div>

      {/* Checkbox Términos */}
      <div>
        <div className="flex items-center gap-2 pt-0.5 text-left">
          <input
            id="terms"
            type="checkbox"
            required
            disabled={isSubmitting}
            checked={values.acceptTerms}
            onChange={(e) => onFieldChange('acceptTerms', e.target.checked)}
            onBlur={() => onFieldBlur('acceptTerms')}
            aria-invalid={errors?.acceptTerms ? true : undefined}
            className="w-4 h-4 rounded border-slate-300 text-[#202B33] focus:ring-[#202B33] cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-[#778089] cursor-pointer select-none leading-none">
            Acepto los Términos y la Política de privacidad
          </label>
        </div>
        {errors?.acceptTerms && (
          <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
            {errors.acceptTerms}
          </p>
        )}
      </div>

      <AuthSubmitButton label="Crear cuenta" disabled={isSubmitting} />
    </form>
  );
}

