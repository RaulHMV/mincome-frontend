import {
  Car,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Laptop,
  PiggyBank,
  Plane,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { GoalIcon } from '../../../types';
import type { GoalIconOption } from '../types/apartados.types';

export const MAX_GOALS = 10;
export const MAX_GOAL_NAME_LENGTH = 60;

export const GOAL_ICON_MAP: Record<GoalIcon, LucideIcon> = {
  ahorro: PiggyBank,
  home: Home,
  shield: ShieldCheck,
  travel: Plane,
  plane: Plane,
  car: Car,
  tech: Laptop,
  laptop: Laptop,
  leisure: Gamepad2,
  education: GraduationCap,
  health: Heart,
  gift: Gift,
  heart: Heart,
};

export const AVAILABLE_GOAL_ICONS: GoalIconOption[] = [
  { id: 'ahorro', label: 'Ahorro / General', icon: PiggyBank },
  { id: 'home', label: 'Hogar', icon: Home },
  { id: 'shield', label: 'Emergencia', icon: ShieldCheck },
  { id: 'travel', label: 'Viajes', icon: Plane },
  { id: 'car', label: 'Vehículo', icon: Car },
  { id: 'tech', label: 'Tecnología', icon: Laptop },
  { id: 'leisure', label: 'Ocio / Entretenimiento', icon: Gamepad2 },
  { id: 'education', label: 'Educación', icon: GraduationCap },
  { id: 'health', label: 'Salud', icon: Heart },
  { id: 'gift', label: 'Regalos / Eventos', icon: Gift },
];
