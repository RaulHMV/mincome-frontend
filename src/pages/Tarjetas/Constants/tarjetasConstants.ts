/** Clase compartida por los inputs de los modales de tarjetas. */
export const inputCls =
  'w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 text-zinc-900 placeholder:text-zinc-400';

/** Overlay estandarizado para los 5 modales del módulo (sin backdrop-blur). */
export const CARD_MODAL_BACKDROP_CLASS =
  'fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#202B33]/60';

/** Umbral máximo recomendado de utilización global/individual de crédito (%). */
export const HEALTHY_CREDIT_THRESHOLD_PCT = 30;

export const DEFAULT_CUT_DAY = '1';
export const DEFAULT_DUE_DAY = '20';
