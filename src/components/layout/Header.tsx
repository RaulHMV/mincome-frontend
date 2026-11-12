import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, LogOut, User } from 'lucide-react';
import { navItems } from './SidebarNav';
import { USER } from '../../data/mockData';

interface HeaderProps {
  onOpenChat: () => void;
}

const notifications = [
  { id: 'n1', tone: 'rose', text: 'Transporte superó su tope mensual (102%).' },
  { id: 'n2', tone: 'amber', text: 'Comida alcanzó el 84% de su presupuesto.' },
  { id: 'n3', tone: 'amber', text: 'Pago de tarjeta BBVA Oro vence en 9 días.' },
];

export default function Header({ onOpenChat }: HeaderProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const current = navItems.find((n) => (n.to === '/' ? pathname === '/' : pathname.startsWith(n.to)));
  const isDashboard = pathname === '/' || pathname === '/dashboard';
  const isNewMovement = pathname === '/movimientos/nuevo' || pathname === '/movimientos/nueva-operacion';

  return (
    <header className="sticky top-0 z-20 h-20 sm:h-[84px] px-4 sm:px-8 bg-[#FAF9F6] border-b border-[#EBE7E0] flex items-center justify-between transition-all">
      {/* Lado izquierdo (Breadcrumb flexible) */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-2xs shrink-0 overflow-hidden lg:hidden">
          <img
            src="/logo.png"
            alt="Mincome"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center gap-2 min-w-0 truncate">
          <span className="hidden md:inline text-xs font-medium text-[#778089]">Mi espacio</span>
          <span className="hidden md:inline text-xs text-[#A0AAB2]">/</span>
          <span className="text-xs sm:text-sm font-semibold text-[#202B33] truncate">
            {isDashboard ? 'Resumen general' : isNewMovement ? 'Nuevo movimiento' : current?.label ?? 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Lado derecho (Notificaciones, Asistente Piggy y Perfil Móvil) */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* 1. Botón Notificaciones (Campana) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(false);
              setOpen((v) => !v);
            }}
            aria-label="Notificaciones"
            className="h-10 w-10 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#E8EBED] text-[#778089] flex items-center justify-center transition-colors relative shrink-0 shadow-2xs cursor-pointer"
          >
            <Bell className="w-4 h-4 stroke-[1.75]" />
            <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 right-2 border-2 border-white" />
          </button>
          {open && (
            <>
              <button
                type="button"
                aria-label="Cerrar notificaciones"
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-20 cursor-default"
              />
              <div className="absolute right-0 mt-2 w-80 max-w-[85vw] rounded-2xl border border-[#EBE7E0] bg-[#FAF9F6] p-2 shadow-lg z-30">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Alertas preventivas
                </p>
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-[#F2EFE9] transition">
                    <AlertTriangle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${n.tone === 'rose' ? 'text-rose-500' : 'text-amber-500'}`}
                    />
                    <p className="text-sm text-zinc-700">{n.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 2. Botón Asistente Piggy */}
        <button
          type="button"
          onClick={onOpenChat}
          aria-label="Abrir Asistente Piggy"
          className="h-10 px-2.5 sm:px-3.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#E8EBED] text-[#202B33] flex items-center gap-2 shadow-2xs transition-colors cursor-pointer select-none group shrink-0"
        >
          <img
            src="/piggy.png"
            alt="Piggy"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 transition-transform group-hover:scale-110"
          />
          <span className="hidden sm:inline text-xs sm:text-sm font-semibold">Asistente Piggy</span>
        </button>

        {/* 3. Perfil de Usuario en Cabecera Móvil (lg:hidden) */}
        <div className="relative lg:hidden">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setUserMenuOpen((v) => !v);
            }}
            aria-label="Perfil de usuario"
            className="h-10 w-10 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#E8EBED] text-[#535F68] hover:text-[#202B33] flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <User className="w-4 h-4 stroke-[1.5]" />
          </button>
          {userMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Cerrar menú de perfil"
                onClick={() => setUserMenuOpen(false)}
                className="fixed inset-0 z-20 cursor-default"
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#EBE7E0] bg-[#FAF9F6] p-2 shadow-lg z-30">
                <div className="px-3 py-2 border-b border-[#EBE7E0]/70 mb-1">
                  <p className="text-xs font-semibold text-[#202B33] truncate">{USER.name}</p>
                  <p className="text-[11px] text-[#778089] truncate">Usuario activo</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 stroke-[1.5]" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
