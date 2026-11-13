import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AuthInput from './AuthInput';

interface AuthPasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  toggleAriaLabel: string;
  autoComplete?: string;
}

/** Campo de contraseña con botón para mostrar u ocultar el texto. */
export default function AuthPasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  toggleAriaLabel,
  autoComplete,
}: AuthPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthInput
      id={id}
      label={label}
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      rightSlot={
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#202B33] transition-colors p-1 cursor-pointer"
          aria-label={toggleAriaLabel}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 stroke-[1.75]" />
          ) : (
            <Eye className="w-4 h-4 stroke-[1.75]" />
          )}
        </button>
      }
    />
  );
}

