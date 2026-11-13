import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import MincomePiggyLogo from './MincomePiggyLogo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  switchPrompt: string;
  switchLinkLabel: string;
  switchTo: string;
  children: ReactNode;
}

const FOOTER_LINKS = [
  { href: '#privacidad', label: 'Privacidad' },
  { href: '#terminos', label: 'Términos' },
  { href: '#seguridad', label: 'Seguridad' },
] as const;

/** Contenedor visual compartido para las pantallas de autenticación (Login y Registro). */
export default function AuthLayout({
  title,
  subtitle,
  switchPrompt,
  switchLinkLabel,
  switchTo,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen sm:h-screen w-full bg-[#F7F6F2] flex flex-col justify-between items-center px-4 py-3 sm:py-5 select-none overflow-y-auto sm:overflow-hidden">
      {/* ─── CONTENEDOR CENTRAL (ALINEADO Y CENTRADO SIN SCROLL) ─── */}
      <div className="flex-1 flex items-center justify-center w-full my-auto py-2">
        <div className="w-full max-w-[430px] bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-lg shadow-slate-200/60 transition-all">
          {/* Logotipo Mincome con Piggy */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <MincomePiggyLogo />
            <span className="text-2xl font-bold tracking-tight text-[#202B33]">Mincome</span>
          </div>

          {/* Título y Subtítulo */}
          <div className="text-center mb-4 sm:mb-5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202B33]">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-[#778089] mt-0.5">
              {subtitle}
            </p>
          </div>

          {children}

          {/* Navegación entre Login y Registro */}
          <div className="mt-4 text-center text-xs text-[#778089]">
            <span>
              {switchPrompt}{' '}
              <Link
                to={switchTo}
                className="font-semibold text-[#202B33] underline hover:text-slate-600 transition-colors cursor-pointer"
              >
                {switchLinkLabel}
              </Link>
            </span>
          </div>

          {/* Sello de Seguridad */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-[#778089]">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
            <span>Tus datos financieros están protegidos</span>
          </div>
        </div>
      </div>

      {/* ─── FOOTER EXTERIOR INFERIOR ─── */}
      <footer className="w-full text-center py-2 text-xs text-[#778089] shrink-0">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          <span>© 2026 mincome</span>
          {FOOTER_LINKS.map((link) => (
            <Fragment key={link.href}>
              <span>·</span>
              <a
                href={link.href}
                onClick={(e) => e.preventDefault()}
                className="hover:text-[#202B33] transition-colors"
              >
                {link.label}
              </a>
            </Fragment>
          ))}
        </div>
      </footer>
    </div>
  );
}
