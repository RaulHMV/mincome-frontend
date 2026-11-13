/** Icono SVG exacto del cerdito con la moneda de $. */
export default function MincomePiggyLogo() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-8 h-8 text-[#202B33] shrink-0"
    >
      {/* Moneda superior */}
      <circle cx="32" cy="13" r="8" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M32 8.5v9M34.2 10.5c-.4-.5-1.1-.8-2.2-.8-1.5 0-2.3.7-2.3 1.8 0 1.2.9 1.6 2.5 1.9 1.7.3 2.7.8 2.7 2.1 0 1.3-1 2-2.9 2-1.2 0-2.1-.4-2.6-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Oreja izquierda */}
      <path
        d="M21 27c-4-4.5-9-6.5-7.5 1.5 1 5 3 7 5.5 8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M19 28c-2-1.5-4.5-2.5-3.8 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Oreja derecha */}
      <path
        d="M43 27c4-4.5 9-6.5 7.5 1.5-1 5-3 7-5.5 8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M45 28c2-1.5 4.5-2.5 3.8 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Cuerpo / Cabeza */}
      <circle cx="32" cy="38" r="16" stroke="currentColor" strokeWidth="2.2" />
      {/* Ojos sonrientes */}
      <path d="M25 33.5c.8-1.5 2.7-1.5 3.5 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M35.5 33.5c.8-1.5 2.7-1.5 3.5 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Hocico */}
      <rect x="25.5" y="37" width="13" height="9" rx="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="29.5" cy="41.5" r="1" fill="currentColor" />
      <circle cx="34.5" cy="41.5" r="1" fill="currentColor" />
      {/* Patitas */}
      <path d="M24 53v2a1.5 1.5 0 0 0 3 0v-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 53v2a1.5 1.5 0 0 1-3 0v-2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

