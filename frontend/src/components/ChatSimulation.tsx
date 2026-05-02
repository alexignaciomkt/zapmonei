'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const MESSAGES = [
  { id: 1, role: 'user', content: 'E aí! Ganhei 85 reais na Uber agora.' },
  { id: 2, role: 'ai', content: 'Boa, patrão! 🔥 Anotado aqui. Sua meta do dia está em 65%! 🚀' },
  { id: 3, role: 'user', content: 'Gastei 45 com gasolina.' },
  { id: 4, role: 'ai', content: '⛽ Registrado! Esse foi seu terceiro abastecimento da semana. Cuidado com o pé pra sobrar mais no bolso! 💰' },
];

export default function ChatSimulation() {
  const [visibleMessages, setVisibleMessages] = useState<typeof MESSAGES>([]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const showNextMessage = (index: number) => {
      if (index >= MESSAGES.length) {
        timeout = setTimeout(() => {
          setVisibleMessages([]);
          showNextMessage(0);
        }, 3000);
        return;
      }

      timeout = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, MESSAGES[index]]);
        showNextMessage(index + 1);
      }, 2000);
    };

    showNextMessage(0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full max-w-[320px] h-[500px] glass rounded-[40px] p-6 relative overflow-hidden border-8 border-bg-dark">
      <div className="absolute top-0 left-0 w-full h-8 bg-bg-dark/50 flex justify-center items-center">
        <div className="w-20 h-4 bg-bg-dark rounded-full mt-2"></div>
      </div>
      
      <div className="mt-10 flex flex-col gap-4">
        <AnimatePresence>
          {visibleMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-brand-secondary/20 self-end rounded-tr-none border border-brand-secondary/30'
                  : 'bg-glass self-start rounded-tl-none border border-glass-border'
              }`}
            >
              {msg.content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 left-6 right-6 h-10 glass rounded-full flex items-center px-4 opacity-50">
        <span className="text-xs">Digite uma mensagem...</span>
      </div>
    </div>
  );
}
