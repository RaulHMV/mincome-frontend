interface AuthSubmitButtonProps {
  label: string;
  disabled?: boolean;
}

/** Botón principal de envío para los formularios de autenticación. */
export default function AuthSubmitButton({ label, disabled = false }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full h-11 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white text-sm font-semibold shadow-2xs transition-all active:scale-[0.99] cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}

