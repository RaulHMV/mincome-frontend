import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  ArrowLeftRight,
  PiggyBank,
  CreditCard,
  Calendar,
  History,
  User,
  ChevronsUpDown,
  LogOut,
} from 'lucide-react';
import { USER } from '../../data/mockData';

export const navItems = [
  { to: '/', label: 'Dashboard', short: 'Inicio', icon: LayoutGrid },
  { to: '/movimientos', label: 'Movimientos', short: 'Movs.', icon: ArrowLeftRight },
  { to: '/apartados', label: 'Apartados', short: 'Apartados', icon: PiggyBank },
  { to: '/tarjetas', label: 'Mis Tarjetas', short: 'Tarjetas', icon: CreditCard },
  { to: '/calendario', label: 'Calendario', short: 'Calendario', icon: Calendar },
  { to: '/historial', label: 'Historial', short: 'Historial', icon: History },
];

export default function SidebarNav() {
  const navigate = useNavigate();
  useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <>
      {/* Escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#EBE7E0] bg-[#FAF9F6] lg:flex px-4 pt-6 pb-4">
        {/* 1. LOGOTIPO OFICIAL MINCOME */}
        <div className="flex items-center gap-3 mb-8 px-1">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-2xs shrink-0 overflow-hidden">
            <img
              src="/logo.png"
              alt="Mincome Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-bold text-[#202B33] tracking-tight">Mincome</span>
        </div>

        {/* 2. ETIQUETA DE SECCIÓN */}
        <div className="text-[11px] font-bold text-[#778089] tracking-wider uppercase px-2 mb-2">
          MI ESPACIO
        </div>

        {/* 3. LISTA DE NAVEGACIÓN (Medidas exactas de Figma: Alto 48px, Radio 8px) */}
        <nav className="flex-1 space-y-1" aria-label="Navegación principal">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `w-full h-12 px-3.5 rounded-lg flex items-center gap-3 text-sm transition-all duration-150 select-none ${isActive
                  ? 'bg-[#E8EBED] text-[#202B33] font-semibold shadow-2xs rounded-lg'
                  : 'text-[#64748B] hover:bg-[#E8EBED]/70 hover:text-[#202B33] rounded-lg transition-colors'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-[#202B33] stroke-2' : 'text-[#778089] stroke-[1.5]'
                      }`}
                  />
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Perfil en la parte inferior con avatar SVG genérico */}
        <div className="relative pt-3 border-t border-[#EBE7E0]">
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Cerrar menú de perfil"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <div className="absolute inset-x-0 bottom-full z-50 mb-2 rounded-2xl border border-[#EBE7E0] bg-[#FAF9F6] p-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4 stroke-[1.5]" />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="relative z-50 flex w-full items-center gap-2.5 rounded-xl border border-[#EBE7E0] bg-[#FAF9F6] p-2.5 text-left transition hover:bg-[#E8EBED]/70 shadow-2xs cursor-pointer"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F5F9] border border-[#EBE7E0] text-[#535F68] shrink-0">
              <User className="h-4 w-4 stroke-[1.5]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#202B33]">{USER.name}</p>
              <p className="truncate text-[11px] text-[#778089]">Usuario activo</p>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-[#778089] shrink-0" />
          </button>
        </div>
      </aside>

      {/* Móvil: barra inferior */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 items-center border-t border-[#EBE7E0] bg-[#FAF9F6]/95 px-1.5 py-1 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] backdrop-blur lg:hidden select-none"
        aria-label="Navegación móvil"
      >
        {navItems.map(({ to, short, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl text-[10px] transition-all duration-150 ${isActive
                ? 'bg-[#E8EBED] text-[#202B33] font-bold shadow-2xs'
                : 'text-[#778089] hover:text-[#202B33]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-4 w-4 ${isActive ? 'text-[#202B33] stroke-[2]' : 'text-[#778089] stroke-[1.5]'
                    }`}
                />
                <span className="truncate leading-tight">{short}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
