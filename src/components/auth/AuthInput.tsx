import type { ReactNode } from 'react';

interface AuthInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
  rightSlot?: ReactNode;
}

/** Campo de entrada estilizado compartido por los formularios de autenticación. */
export default function AuthInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
  autoComplete,
  rightSlot,
}: AuthInputProps) {
  const paddingClasses = rightSlot ? 'pl-3.5 pr-10' : 'px-3.5';

  const inputElement = (
    <input
      id={id}
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={`w-full h-11 ${paddingClasses} rounded-xl border border-slate-200 bg-white text-sm text-[#202B33] placeholder:text-slate-400 outline-none focus:border-[#202B33] focus:ring-1 focus:ring-[#202B33] transition-all`}
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
    </div>
  );
}

