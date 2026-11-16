import type { LucideIcon } from 'lucide-react';

export type MovimientosTab = 'Todos' | 'Gastos' | 'Ingresos' | 'Ahorros';

export type NewOperationFlowType = 'gasto' | 'ingreso';

export type RecurrenceOption = 'Puntual' | 'Quincenal' | 'Mensual';

export interface IncomeSourceItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

