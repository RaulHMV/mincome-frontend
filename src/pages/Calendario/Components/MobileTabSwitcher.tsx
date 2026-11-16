import { Calendar, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { MobileTabSwitcherProps } from '../types/calendar.types';

export default function MobileTabSwitcher({
  activeTab,
  onTabChange,
}: MobileTabSwitcherProps) {
  return (
    <div className="sm:hidden mb-4">
      <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
        <button
          type="button"
          onClick={() => onTabChange('calendario')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-150 select-none cursor-pointer',
            activeTab === 'calendario'
              ? 'bg-white text-[#202B33] shadow-2xs font-bold'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>Calendario</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('proyecciones')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all duration-150 select-none cursor-pointer',
            activeTab === 'proyecciones'
              ? 'bg-white text-[#202B33] shadow-2xs font-bold'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
          <span>Proyecciones</span>
        </button>
      </div>
    </div>
  );
}
