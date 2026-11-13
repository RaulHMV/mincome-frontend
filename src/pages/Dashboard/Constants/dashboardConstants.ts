import {
  Landmark,
  Banknote,
  Wallet,
  ArrowUpRight,
  Car,
  ShoppingBag,
  ShieldCheck,
  Utensils,
  ShoppingCart,
  Zap,
  GraduationCap,
  Home,
  Film,
  HeartPulse,
  MoreHorizontal,
} from 'lucide-react';
import type {
  BudgetItem,
  ChartBarItem,
  MetricItem,
  RecentTransactionItem,
} from '../types/dashboard.types';

export const METRICS: MetricItem[] = [
  { title: 'Patrimonio Total', value: '$14,950.00', subtitle: 'Saldo Libre + Capital en Apartados', icon: Landmark, color: 'text-[#202B33]' },
  { title: 'Saldo Libre', value: '$6,450.00', subtitle: 'Efectivo + Débito Nómina', icon: Banknote, color: 'text-emerald-600' },
  { title: 'Capital en Apartados', value: '$8,500.00', subtitle: '4 metas en progreso', icon: Wallet, color: 'text-[#315B50]' },
  { title: 'Gasto del Mes', value: '$4,820.00', subtitle: '48% de tus ingresos de octubre', icon: ArrowUpRight, color: 'text-[#202B33]' },
];

export const data6m: ChartBarItem[] = [
  { month: 'May', height: 'h-[38%]', active: false, amount: '$11,200' },
  { month: 'Jun', height: 'h-[50%]', active: false, amount: '$11,900' },
  { month: 'Jul', height: 'h-[62%]', active: false, amount: '$12,600' },
  { month: 'Ago', height: 'h-[76%]', active: false, amount: '$13,400' },
  { month: 'Sep', height: 'h-[84%]', active: false, amount: '$14,100' },
  { month: 'Oct', height: 'h-[95%]', active: true, amount: '$14,950' },
];

export const data1y: ChartBarItem[] = [
  { month: 'Nov', height: 'h-[24%]', active: false, amount: '$8,200' },
  { month: 'Dic', height: 'h-[28%]', active: false, amount: '$8,900' },
  { month: 'Ene', height: 'h-[30%]', active: false, amount: '$9,400' },
  { month: 'Feb', height: 'h-[32%]', active: false, amount: '$9,800' },
  { month: 'Mar', height: 'h-[34%]', active: false, amount: '$10,200' },
  { month: 'Abr', height: 'h-[36%]', active: false, amount: '$10,800' },
  ...data6m,
];

export const defaultBudgets: BudgetItem[] = [
  { id: 'comida', name: 'Comida', icon: Utensils, limit: 1500, spent: 1260, pct: 84, status: 'warning' },
  { id: 'compras', name: 'Compras', icon: ShoppingBag, limit: 1000, spent: 840, pct: 84, status: 'warning' },
  { id: 'supermercado', name: 'Supermercado', icon: ShoppingCart, limit: 1200, spent: 960, pct: 80, status: 'warning' },
  { id: 'transporte', name: 'Transporte', icon: Car, limit: 800, spent: 820, pct: 103, status: 'danger' },
  { id: 'servicios', name: 'Servicios', icon: Zap, limit: 900, spent: 675, pct: 75, status: 'ok' },
  { id: 'educacion', name: 'Educación', icon: GraduationCap, limit: 800, spent: 480, pct: 60, status: 'ok' },
  { id: 'hogar', name: 'Hogar', icon: Home, limit: 1000, spent: 500, pct: 50, status: 'ok' },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: Film, limit: 600, spent: 250, pct: 42, status: 'ok' },
  { id: 'salud', name: 'Salud', icon: HeartPulse, limit: 500, spent: 125, pct: 25, status: 'ok' },
  { id: 'otro', name: 'Otro', icon: MoreHorizontal, limit: 500, spent: 130, pct: 26, status: 'ok' },
];

export const RECENT_TX: RecentTransactionItem[] = [
  { id: '1', name: 'Uber', category: 'Transporte', date: 'Hoy, 14:20', amount: '-$85.00', tone: 'text-[#202B33]', icon: Car },
  { id: '2', name: 'Supermercado', category: 'Comida', date: 'Ayer, 18:45', amount: '-$420.00', tone: 'text-[#202B33]', icon: ShoppingBag },
  { id: '3', name: 'Fondo de emergencia', category: 'Apartado', date: '24 Oct', amount: '$500.00', tone: 'text-emerald-600', icon: ShieldCheck },
];

