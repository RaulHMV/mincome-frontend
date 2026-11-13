import { useEffect, useRef, useState } from 'react';
import { Info, Send, X } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { cn } from '../../lib/utils';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const seed: ChatMessage[] = [
  {
    id: 'm1',
    role: 'assistant',
    text: '¡Hola, Valeria! Soy Piggy, tu asistente en mincome. Puedo ayudarte a entender tus gastos, presupuestos y apartados.',
  },
  { id: 'm2', role: 'user', text: '¿Cómo voy con mi presupuesto de Comida este mes?' },
  {
    id: 'm3',
    role: 'assistant',
    text: 'Llevas $1,260.00 de $1,500.00 (84%). Estás por encima del 80%, así que conviene moderar los gastos en esta categoría el resto de octubre.',
  },
];

const suggestions = [
  '¿Cuánto puedo ahorrar este mes?',
  'Resume mis gastos por categoría',
  '¿Qué tarjeta vence primero?',
];

const replies = [
  'Con base en tus movimientos simulados, tu saldo libre es suficiente para cubrir los próximos pagos programados.',
  'Tus gastos de octubre van 18% por debajo del promedio de los últimos 5 meses. ¡Buen ritmo!',
  'Tu tarjeta BBVA Oro tiene la fecha límite más próxima: el 2 de noviembre.',
];

export default function AIChatDrawer({ isOpen, onClose }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(seed);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const counter = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, isOpen]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text: clean }]);
    setInput('');
    setTyping(true);
    window.setTimeout(() => {
      const reply = replies[counter.current++ % replies.length];
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: 'assistant', text: reply }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className={cn('fixed inset-0 z-50', isOpen ? 'visible' : 'invisible')} aria-hidden={!isOpen}>
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-zinc-900/30 backdrop-blur-sm transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        role="dialog"
        aria-label="Asistente Piggy"
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
              <img src="/piggy.png" alt="Piggy" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#202B33]">Asistente Piggy</p>
              <p className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                En línea
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar Asistente Piggy"
            className="rounded-xl p-1.5 text-[#778089] hover:bg-slate-100 hover:text-[#202B33] transition cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Historial de conversación */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#FAF9F6]/60">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn('flex items-end gap-2.5', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-2xs',
                  m.role === 'user'
                    ? 'bg-[#202B33] text-white rounded-br-sm'
                    : 'bg-white border border-[#EBE7E0] text-[#202B33] rounded-bl-sm',
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex items-end gap-2.5">
              <div className="rounded-2xl rounded-bl-sm bg-white border border-[#EBE7E0] px-4 py-2.5 text-xs text-[#778089] shadow-2xs">
                Piggy está escribiendo...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Preguntas rápidas e Input */}
        <div className="border-t border-slate-200 bg-white px-5 py-3.5 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={typing}
                className="rounded-full border border-[#EBE7E0] bg-[#FAF9F6] px-3 py-1 text-[11px] font-medium text-[#535F68] hover:bg-[#E8EBED] hover:text-[#202B33] transition cursor-pointer disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              className="flex-1 h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-[#202B33] placeholder:text-slate-400 outline-none focus:border-[#202B33] focus:ring-1 focus:ring-[#202B33] transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Enviar mensaje"
              className="h-10 w-10 rounded-xl bg-[#202B33] hover:bg-[#141A29] text-white flex items-center justify-center shrink-0 transition cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4 stroke-[1.75]" />
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#778089] pt-0.5">
            <Info className="w-3.5 h-3.5 shrink-0 text-slate-400 stroke-[1.75]" />
            <span>El Asistente es una IA orientativa y no sustituye el consejo de un profesional.</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

