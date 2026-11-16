import { cn } from '../../../lib/utils';
import type { GoalIcon } from '../../../types';
import { AVAILABLE_GOAL_ICONS } from '../Constants/apartadosConstants';
import type { GoalIconPickerProps } from '../types/apartados.types';

function isIconMatch(optionId: GoalIcon, selectedIcon: GoalIcon): boolean {
  if (optionId === selectedIcon) return true;
  if (optionId === 'travel' && selectedIcon === 'plane') return true;
  if (optionId === 'tech' && selectedIcon === 'laptop') return true;
  if (optionId === 'health' && selectedIcon === 'heart') return true;
  return false;
}

export default function GoalIconPicker({
  selectedIcon,
  onSelect,
  variant = 'create',
}: GoalIconPickerProps) {
  const isEdit = variant === 'edit';

  return (
    <div className={isEdit ? 'grid grid-cols-5 gap-2.5' : 'grid grid-cols-5 gap-2 sm:gap-3'}>
      {AVAILABLE_GOAL_ICONS.map((item) => {
        const IconComp = item.icon;
        const isSelected = isIconMatch(item.id, selectedIcon);
        return (
          <button
            key={item.id}
            type="button"
            title={item.label}
            onClick={() => onSelect(item.id)}
            className={cn(
              'flex items-center justify-center rounded-lg transition-all cursor-pointer',
              isEdit ? 'h-12' : 'h-11',
              isSelected
                ? 'bg-[#E8EBED] text-[#202B33] font-semibold border border-[#D5DCD9] shadow-2xs'
                : isEdit
                  ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium',
            )}
          >
            <IconComp className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}
