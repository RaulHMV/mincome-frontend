import type {
  BankCard,
  Budget,
  CalendarEvent,
  Goal,
  Transaction,
  TxType,
  PaymentMethod,
} from '../types';

/** Fecha de referencia fija para que el prototipo sea determinista. */
export const TODAY = new Date(2026, 9, 24);

export const USER = {
  name: 'Valeria Zapata',
  email: 'valeria.zapata@correo.com',
  initials: 'VZ',
};

/* ───────── Saldos ─────────
 * Saldo Libre = Efectivo + Débito Nómina
 * Capital en Apartados = Σ metas (no reduce el patrimonio, sólo lo aísla)
 * Saldo Total Consolidado = Saldo Libre + Capital en Apartados
 * Crédito Utilizado = deuda financiada por el banco (no resta del efectivo)
 */
export const liquidAccounts = [
  { id: 'cash', name: 'Efectivo', amount: 1250 },
  { id: 'debit', name: 'Débito Nómina', amount: 5200 },
];

export const initialFreeBalance = liquidAccounts.reduce((s, a) => s + a.amount, 0);

export const initialGoals: Goal[] = [
  { id: 'g1', name: 'Fondo de Emergencia', saved: 4000, target: 10000, icon: 'shield' },
  { id: 'g2', name: 'Vacaciones en Oaxaca', saved: 1800, target: 4500, icon: 'plane' },
  { id: 'g3', name: 'Laptop nueva', saved: 1200, target: 8000, icon: 'laptop' },
  { id: 'g4', name: 'Enganche departamento', saved: 1500, target: 25000, icon: 'home' },
];

export const initialCards: BankCard[] = [
  {
    id: 'c1',
    alias: 'BBVA Oro',
    bank: 'BBVA',
    last4: '4821',
    kind: 'Crédito',
    limit: 7000,
    used: 1650,
    cutDay: 12,
    dueDay: 2,
  },
  {
    id: 'c2',
    alias: 'Nu Morada',
    bank: 'Nu México',
    last4: '3306',
    kind: 'Crédito',
    limit: 5000,
    used: 800,
    cutDay: 20,
    dueDay: 10,
  },
  {
    id: 'c3',
    alias: 'Nómina Santander',
    bank: 'Santander',
    last4: '7712',
    kind: 'Débito',
    limit: 0,
    used: 0,
    balance: 5200,
    cutDay: 1,
    dueDay: 1,
  },
];

export const budgets: Budget[] = [
  { category: 'Comida', limit: 1500, spent: 1260 },
  { category: 'Compras', limit: 1000, spent: 840 },
  { category: 'Educación', limit: 800, spent: 480 },
  { category: 'Salud', limit: 500, spent: 125 },
  { category: 'Supermercado', limit: 1200, spent: 960 },
  { category: 'Entretenimiento', limit: 600, spent: 250 },
  { category: 'Hogar', limit: 1000, spent: 500 },
  { category: 'Servicios', limit: 900, spent: 675 },
  { category: 'Transporte', limit: 800, spent: 820 },
  { category: 'Otro', limit: 500, spent: 130 },
];

export const categoryBudgets = budgets;

export const monthlyFlow = [
  { month: 'May', ingresos: 10000, gastos: 7200 },
  { month: 'Jun', ingresos: 10000, gastos: 7500 },
  { month: 'Jul', ingresos: 10500, gastos: 7900 },
  { month: 'Ago', ingresos: 10000, gastos: 7100 },
  { month: 'Sep', ingresos: 10200, gastos: 7400 },
  { month: 'Oct', ingresos: 10000, gastos: 4820 },
];

export const expenseCategories = [
  'Comida',
  'Compras',
  'Educación',
  'Salud',
  'Supermercado',
  'Entretenimiento',
  'Hogar',
  'Servicios',
  'Transporte',
  'Otro',
];
export const incomeCategories = ['Nómina', 'Freelance', 'Reembolso', 'Otros'];
export const allCategories = [...expenseCategories, ...incomeCategories, 'Ahorro'];

const t = (
  id: number,
  date: string,
  concept: string,
  category: string,
  type: TxType,
  method: PaymentMethod,
  amount: number,
  recurring = false,
  cuenta?: string,
): Transaction => {
  let defaultCuenta: string;
  if (method === 'Débito') {
    defaultCuenta = 'Nómina Santander ••7712';
  } else if (method === 'Crédito') {
    defaultCuenta = id % 2 === 0 ? 'BBVA Oro ••4821' : 'Nu Morada ••3306';
  } else {
    defaultCuenta = 'Efectivo';
  }

  return {
    id: `t${id}`,
    date,
    concept,
    category,
    type,
    method,
    amount,
    recurring,
    cuenta: cuenta ?? defaultCuenta,
  };
};

export const initialTransactions: Transaction[] = [
  t(1, '2026-10-24', 'Supermercado La Comer', 'Comida', 'gasto', 'Débito', 420),
  t(2, '2026-10-23', 'Uber a la oficina', 'Transporte', 'gasto', 'Crédito', 85),
  t(3, '2026-10-22', 'Abono a Fondo de Emergencia', 'Ahorro', 'ahorro', 'Débito', 500, true),
  t(4, '2026-10-21', 'Netflix', 'Entretenimiento', 'gasto', 'Crédito', 149, true),
  t(5, '2026-10-20', 'Farmacia del Ahorro', 'Salud', 'gasto', 'Efectivo', 125),
  t(6, '2026-10-18', 'Internet Telmex', 'Servicios', 'gasto', 'Débito', 389, true),
  t(7, '2026-10-17', 'Tacos El Güero', 'Comida', 'gasto', 'Efectivo', 95),
  t(8, '2026-10-15', 'Nómina quincenal', 'Nómina', 'ingreso', 'Débito', 5000, true),
  t(9, '2026-10-15', 'Recibo de luz CFE', 'Servicios', 'gasto', 'Débito', 286, true),
  t(10, '2026-10-14', 'Gasolina', 'Transporte', 'gasto', 'Crédito', 450),
  t(11, '2026-10-12', 'Zapatos deportivos', 'Compras', 'gasto', 'Crédito', 840),
  t(12, '2026-10-10', 'Cena con amigas', 'Comida', 'gasto', 'Crédito', 320),
  t(13, '2026-10-08', 'Proyecto de diseño web', 'Freelance', 'ingreso', 'Débito', 1500),
  t(14, '2026-10-06', 'Abono a Vacaciones', 'Ahorro', 'ahorro', 'Efectivo', 400),
  t(15, '2026-10-05', 'Cine y palomitas', 'Entretenimiento', 'gasto', 'Efectivo', 101),
  t(16, '2026-10-03', 'Despensa semanal', 'Comida', 'gasto', 'Débito', 425),
  t(17, '2026-10-01', 'Renta departamento', 'Servicios', 'gasto', 'Débito', 3200, true),
  t(18, '2026-09-30', 'Nómina quincenal', 'Nómina', 'ingreso', 'Débito', 5000, true),
  t(19, '2026-09-28', 'Curso de TypeScript', 'Educación', 'gasto', 'Crédito', 480),
  t(20, '2026-09-25', 'Reembolso de gastos de viaje', 'Reembolso', 'ingreso', 'Débito', 650),
  t(21, '2026-09-22', 'Abono a Laptop nueva', 'Ahorro', 'ahorro', 'Débito', 400),
  t(22, '2026-09-19', 'Consulta médica', 'Salud', 'gasto', 'Efectivo', 350),
  t(23, '2026-09-16', 'Spotify Familiar', 'Entretenimiento', 'gasto', 'Crédito', 129, true),
  t(24, '2026-09-15', 'Nómina quincenal', 'Nómina', 'ingreso', 'Débito', 5000, true),
  t(25, '2026-09-12', 'Mercado de la colonia', 'Comida', 'gasto', 'Efectivo', 240),
  t(26, '2026-09-09', 'Metro y transporte', 'Transporte', 'gasto', 'Efectivo', 180),
  t(27, '2026-09-04', 'Regalo de cumpleaños', 'Compras', 'gasto', 'Crédito', 450),
  t(28, '2026-09-01', 'Renta departamento', 'Servicios', 'gasto', 'Débito', 3200, true),
];

export const calendarEvents: CalendarEvent[] = [
  { id: 'e1', day: 1, title: 'Renta departamento', amount: 3200, kind: 'pago' },
  { id: 'e2', day: 2, title: 'Pago tarjeta BBVA Oro', amount: 1650, kind: 'pago' },
  { id: 'e3', day: 10, title: 'Pago tarjeta Nu Morada', amount: 800, kind: 'pago' },
  { id: 'e4', day: 12, title: 'Corte BBVA Oro', amount: 0, kind: 'corte' },
  { id: 'e5', day: 15, title: 'Nómina quincenal', amount: 5000, kind: 'ingreso' },
  { id: 'e6', day: 15, title: 'Recibo de luz CFE', amount: 286, kind: 'pago' },
  { id: 'e7', day: 18, title: 'Internet Telmex', amount: 389, kind: 'pago' },
  { id: 'e8', day: 20, title: 'Corte Nu Morada', amount: 0, kind: 'corte' },
  { id: 'e9', day: 21, title: 'Netflix', amount: 149, kind: 'pago' },
  { id: 'e10', day: 30, title: 'Nómina quincenal', amount: 5000, kind: 'ingreso' },
];

/** Días naturales hasta la próxima ocurrencia de `day` (0 = hoy). */
export function daysUntilDay(day: number, from: Date = TODAY) {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let target = new Date(from.getFullYear(), from.getMonth(), day);
  if (target < start) target = new Date(from.getFullYear(), from.getMonth() + 1, day);
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}
