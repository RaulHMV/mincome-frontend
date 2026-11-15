import type { ReactNode } from 'react';

const STRIP_WHITESPACE_REGEX = /[\s\u00A0\u200B-\u200D\uFEFF]/g;

interface AuthInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  noSpaces?: boolean;
  disabled?: boolean;
  error?: string;
  rightSlot?: ReactNode;
}

/** Campo de entrada estilizado compartido por los formularios de autenticación. */
export default function AuthInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = true,
  autoComplete,
  noSpaces = false,
  disabled = false,
  error,
  rightSlot,
}: AuthInputProps) {
  const paddingClasses = rightSlot ? 'pl-3.5 pr-10' : 'px-3.5';
  const borderClasses = error
    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
    : 'border-slate-200 focus:border-[#202B33] focus:ring-[#202B33]';

  const inputElement = (
    <input
      id={id}
      type={type}
      required={required}
      disabled={disabled}
      value={value}
      onKeyDown={(e) => {
        if (noSpaces && e.key === ' ') {
          e.preventDefault();
        }
      }}
      onChange={(e) => {
        const nextValue = noSpaces
          ? e.target.value.replace(STRIP_WHITESPACE_REGEX, '')
          : e.target.value;
        onChange(nextValue);
      }}
      onBlur={onBlur}
      placeholder={placeholder}
      autoComplete={autoComplete}
      aria-invalid={error ? true : undefined}
      className={`w-full h-11 ${paddingClasses} rounded-xl border ${borderClasses} bg-white text-sm text-[#202B33] placeholder:text-slate-400 outline-none focus:ring-1 transition-all disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed [&::-ms-reveal]:hidden [&::-ms-clear]:hidden`}
    />
  );

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-[#202B33] mb-1">
        {label}
      </label>
      {rightSlot ? (
        <div className="relative">
          {inputElement}
          {rightSlot}
        </div>
      ) : (
        inputElement
      )}
      {error && (
        <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

