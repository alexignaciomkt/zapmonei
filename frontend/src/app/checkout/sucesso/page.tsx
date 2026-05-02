'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2, Smartphone, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

const steps = [
  { icon: Sparkles, label: 'Configurando sua IA personalizada', delay: 0 },
  { icon: Smartphone, label: 'Preparando seu WhatsApp', delay: 2000 },
  { icon: MessageSquare, label: 'Enviando mensagem de boas-vindas', delay: 4000 },
];

export default function SucessoPage() {
  const searchParams = useSearchParams();
  const nome = searchParams.get('nome') || 'Motorista';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const timers = steps.map((step, index) =>
      setTimeout(() => {
        setCurrentStep(index + 1);
      }, step.delay + 1500)
    );

    const doneTimer = setTimeout(() => {
      setAllDone(true);
    }, 7500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg-dark text-white font-outfit flex flex-col items-center justify-center px-6 relative overflow-hidden">
      
      {/* Glow de fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center gap-8">
        
        {/* Ícone de Sucesso */}
        <div className={`relative transition-all duration-1000 ${allDone ? 'scale-110' : 'scale-100'}`}>
          <div className="w-24 h-24 rounded-full bg-brand-primary/20 flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-brand-primary/30 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-brand-primary" />
            </div>
          </div>
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-full border-2 border-brand-primary/20 animate-ping" />
        </div>

        {/* Título */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Bem-vindo ao ZapMonei! 🚀
          </h1>
          <p className="text-lg opacity-60">
            {nome}, seu assistente financeiro está sendo ativado agora mesmo.
          </p>
        </div>

        {/* Steps de Progresso */}
        <div className="w-full glass border-white/10 rounded-3xl p-8 flex flex-col gap-5">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > index;
            const isCurrent = currentStep === index;

            return (
              <div 
                key={index} 
                className={`flex items-center gap-4 transition-all duration-500 ${
                  isCompleted ? 'opacity-100' : isCurrent ? 'opacity-70' : 'opacity-30'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-brand-primary/20 text-brand-primary' 
                    : 'bg-white/5 text-white/40'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 size={20} />
                  ) : isCurrent ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <StepIcon size={18} />
                  )}
                </div>
                <span className={`text-sm font-medium transition-all duration-500 ${
                  isCompleted ? 'text-brand-primary' : 'text-white/60'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mensagem Final */}
        <div className={`transition-all duration-1000 ${allDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-center text-brand-primary font-bold">
              <MessageSquare size={20} />
              <span>Confira seu WhatsApp!</span>
            </div>
            <p className="text-sm opacity-70">
              Enviamos uma mensagem com as instruções de conexão. 
              Siga os passos para ativar seu assistente financeiro.
            </p>
          </div>
        </div>

        {/* Mensagem Pulsante (enquanto carrega) */}
        <p className={`text-sm opacity-40 transition-all duration-500 ${allDone ? 'hidden' : 'animate-pulse'}`}>
          Aguarde, estamos preparando tudo para você...
        </p>

        {/* Link de volta */}
        <Link 
          href="/" 
          className="text-sm text-white/30 hover:text-brand-primary transition-colors mt-4"
        >
          ← Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
