'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ChatSimulation from '@/components/ChatSimulation';
import { ChevronRight, Wallet, TrendingUp, Users, ShieldCheck, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-dark text-white font-outfit selection:bg-brand-primary selection:text-bg-dark">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center glass border-none rounded-none bg-bg-dark/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="ZapMonei" className="h-8 w-auto object-contain" />
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium opacity-70">
          <a href="#features" className="hover:text-brand-primary transition-colors">Funcionalidades</a>
          <a href="#family" className="hover:text-brand-primary transition-colors">Família</a>
          <a href="#pricing" className="hover:text-brand-primary transition-colors">Preços</a>
        </div>
        <Link href="/login">
          <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-brand-primary transition-all hover:scale-105 active:scale-95">
            Entrar
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-secondary/10 blur-[120px] rounded-full"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              NOVO: GESTÃO FAMILIAR LIBERADA
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] mb-6">
              Sua meta de hoje <br />
              <span className="text-gradient">no seu bolso.</span>
            </h1>
            <p className="text-lg opacity-60 max-w-lg mb-10 leading-relaxed">
              O ZapMonei é o seu novo Sócio-Assistente. Controle cada ganho e gasto pelo WhatsApp com IA. Simples, rápido e fora da curva.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-brand-primary text-bg-dark px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                Começar 3 Dias Grátis <ChevronRight size={20} />
              </button>
              <button className="glass px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                Ver Como Funciona
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex justify-center relative"
          >
            {/* Hero Image Background */}
            <div className="absolute inset-0 z-0 opacity-20 blur-2xl">
              <img src="/assets/hero_driver.png" alt="" className="w-full h-full object-cover rounded-full" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <ChatSimulation />
              <div className="mt-[-40px] glass p-4 rounded-3xl border-white/10 shadow-2xl z-20 flex items-center gap-4 animate-bounce">
                <img src="/assets/hero_driver.png" alt="Driver" className="w-12 h-12 rounded-full border-2 border-brand-primary object-cover" />
                <div className="text-sm font-bold">"ZapMonei salvou meu dia! 🚀"</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">5k+</div>
            <div className="text-xs opacity-40 uppercase font-bold tracking-widest">Motoristas Ativos</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">R$ 2M+</div>
            <div className="text-xs opacity-40 uppercase font-bold tracking-widest">Lucro Gerenciado</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">98%</div>
            <div className="text-xs opacity-40 uppercase font-bold tracking-widest">Satisfação</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">12s</div>
            <div className="text-xs opacity-40 uppercase font-bold tracking-widest">Tempo de Registro</div>
          </div>
        </div>
      </section>

      {/* Family Section */}
      <section id="family" className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-4 bg-brand-primary/20 blur-3xl rounded-full"></div>
            <img 
              src="/assets/family_finance.png" 
              alt="Family Managing Finances" 
              className="relative z-10 rounded-[40px] shadow-2xl border border-white/10"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Sua família em <br />
              <span className="text-brand-primary">sintonia total.</span>
            </h2>
            <p className="text-lg opacity-60 mb-10 leading-relaxed">
              No Plano Pro, você e sua esposa(o) podem acompanhar as finanças em tempo real. Cada um com seu acesso, mas com um só objetivo: o futuro da família.
            </p>
            <ul className="flex flex-col gap-4 mb-10">
              {[
                "2 Acessos Simultâneos",
                "Dashboard Compartilhado",
                "Relatórios de Gastos Domésticos",
                "Suporte Prioritário"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium">
                  <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                    <Check size={14} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button className="bg-white text-bg-dark px-8 py-4 rounded-2xl font-bold hover:bg-brand-primary transition-all">
              Conhecer Plano Família
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Tudo que você precisa <br /><span className="opacity-40">em um só lugar.</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Wallet />}
              title="Registro por Voz/Texto"
              description="Esqueça planilhas. Mande um áudio ou texto no WhatsApp e a IA faz o resto."
            />
            <FeatureCard 
              icon={<TrendingUp />}
              title="Metas de Faturamento"
              description="Defina quanto quer ganhar no dia e receba alertas sobre sua performance."
            />
            <FeatureCard 
              icon={<ShieldCheck />}
              title="Privacidade Total"
              description="Seus dados são criptografados e você tem controle total sobre seu histórico."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 blur-[150px] rounded-full"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">O investimento que <br /><span className="text-brand-primary">se paga em 1 dia.</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <PricingCard 
              name="Plano Piloto"
              price="39,90"
              period="/mês"
              checkoutUrl="/checkout?plan=piloto"
              features={["IA Ilimitada", "Relatórios Diários", "Suporte WhatsApp"]}
            />
            <PricingCard 
              name="Plano Anual"
              price="33,90"
              period="/mês"
              highlight
              checkoutUrl="/checkout?plan=anual"
              features={["15% de Desconto", "Cobrado Anualmente", "IA Ilimitada", "Relatórios Mensais", "Prioridade na Fila"]}
            />
            <PricingCard 
              name="Plano Pro (Familiar)"
              price="59,90"
              period="/mês"
              checkoutUrl="/checkout?plan=familiar"
              features={["Até 3 Acessos", "Gestão Familiar", "Dashboard Web Pro", "Análise de Metas", "Suporte Individual"]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ZapMonei" className="h-8 w-auto opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all" />
          </div>
          <div className="flex gap-8 text-sm opacity-40">
            <a href="#">Privacidade</a>
            <a href="#">Termos</a>
            <a href="#">Contato</a>
          </div>
          <p className="text-sm opacity-20">© 2026 ZapMonei. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-hover glass p-10 rounded-[32px] border-white/5 flex flex-col gap-6">
      <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-sm opacity-50 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="3"
    strokeLinecap="round" strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function PricingCard({ name, price, period, features, highlight, checkoutUrl, description }: { 
  name: string, price: string, period: string, features: string[], highlight?: boolean, checkoutUrl: string, description?: string
}) {
  const cardClasses = `
    backdrop-blur-[14px] bg-gradient-to-br rounded-3xl shadow-xl flex-1 px-7 py-10 flex flex-col transition-all duration-300
    from-white/10 to-white/5 border border-white/10
    ${highlight ? 'md:scale-105 relative ring-2 ring-brand-primary/20 from-white/15 to-white/10 border-brand-primary/30 shadow-2xl' : ''}
  `;

  return (
    <div className={cardClasses.trim()}>
      {highlight && (
        <div className="absolute -top-4 right-6 px-4 py-1 text-[13px] font-bold rounded-full bg-brand-primary text-bg-dark shadow-lg">
          Mais Vantajoso
        </div>
      )}
      
      <div className="mb-4">
        <h2 className="text-[36px] font-extralight tracking-tight text-white">{name}</h2>
        {description && <p className="text-[15px] text-white/60 mt-1">{description}</p>}
      </div>
      
      <div className="my-6 flex items-baseline gap-2">
        <span className="text-[52px] font-extralight tracking-tight text-white"><span className="text-3xl">R$</span> {price}</span>
        <span className="text-[15px] text-white/60">{period}</span>
      </div>
      
      <div className="w-full mb-6 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1)_20%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.1)_80%,transparent)]"></div>
      
      <ul className="flex flex-col gap-4 text-[15px] text-white/90 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <CheckIcon className="text-brand-primary w-5 h-5 shrink-0" /> {feature}
          </li>
        ))}
      </ul>
      
      <a href={checkoutUrl} className={`w-full py-4 rounded-xl font-bold flex justify-center items-center transition-all hover:scale-[1.02] active:scale-95 ${
        highlight 
          ? 'bg-brand-primary hover:bg-brand-primary/90 text-bg-dark shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)]' 
          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
      }`}>
        Escolher {name.split(' ')[1] || 'Plano'}
      </a>
    </div>
  );
}
