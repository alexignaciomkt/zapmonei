'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const PLAN_DETAILS = {
  piloto: {
    name: 'Plano Piloto',
    price: '39,90',
    period: '/mês',
    features: ['IA Ilimitada', 'Relatórios Diários', 'Suporte WhatsApp'],
  },
  anual: {
    name: 'Plano Anual',
    price: '33,90',
    period: '/mês (cobrado anualmente)',
    features: ['15% de Desconto', 'Cobrado Anualmente', 'IA Ilimitada', 'Relatórios Mensais'],
  },
  familiar: {
    name: 'Plano Pro (Familiar)',
    price: '59,90',
    period: '/mês',
    features: ['Até 3 Acessos', 'Gestão Familiar', 'Dashboard Web Pro', 'Análise de Metas'],
  }
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  
  // Default to 'piloto' if invalid or missing
  const selectedPlan = (planParam && planParam in PLAN_DETAILS) 
    ? PLAN_DETAILS[planParam as keyof typeof PLAN_DETAILS] 
    : PLAN_DETAILS['piloto'];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    coupon: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const isFreeTest = formData.coupon === 'KATHY100';

      if (isFreeTest) {
        // Formata o telefone: remove caracteres especiais e garante o prefixo 55 (Brasil)
        let cleanPhone = formData.phone.replace(/\D/g, '');
        if (!cleanPhone.startsWith('55')) {
          cleanPhone = '55' + cleanPhone;
        }

        // MODO TESTE: Bypass do Asaas — envia direto pro n8n como se o pagamento já tivesse sido confirmado
        const webhookResponse = await fetch('https://auto.euattendo.com.br/webhook/asaas-payment-webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'PAYMENT_CONFIRMED',
            payment: {
              customer: formData.name,
              value: 0,
              description: `ZapMonei - ${selectedPlan.name} (Cupom: KATHY100)`,
            },
            customer_name: formData.name,
            customer_phone: cleanPhone,
            plan: selectedPlan.name,
            status: 'CONFIRMED'
          }),
        });

        if (webhookResponse.ok) {
          window.location.href = `/checkout/sucesso?nome=${encodeURIComponent(formData.name)}`;
        } else {
          alert('⚠️ Erro ao ativar. Verifique se o fluxo do n8n está ativo.');
        }
      } else {
        // MODO PRODUÇÃO: Chama o Asaas para gerar a cobrança real
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            coupon: formData.coupon,
            plan: selectedPlan.name,
            price: selectedPlan.price,
            period: selectedPlan.period
          }),
        });

        const data = await response.json();

        if (response.ok && data.invoiceUrl) {
          window.location.href = data.invoiceUrl;
        } else {
          alert(`Erro ao gerar cobrança: ${data.error || 'Erro desconhecido'}`);
        }
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      alert('Erro ao conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-white font-outfit selection:bg-brand-primary selection:text-bg-dark flex flex-col">
      {/* Header Simples */}
      <nav className="w-full p-6 border-b border-white/5 flex justify-between items-center bg-bg-dark/50 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="ZapMonei" className="h-6 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-2 text-sm text-brand-primary font-medium">
          <ShieldCheck size={16} />
          <span>Checkout Seguro</span>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 p-6 py-12 md:py-20 items-start">
        
        {/* Formulário de Contato */}
        <div className="order-2 md:order-1 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quase lá! 🚀</h1>
            <p className="opacity-60">Precisamos de alguns dados para configurar o seu Sócio-Assistente no WhatsApp.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium opacity-80">Nome Completo</label>
              <input 
                type="text" 
                id="name"
                required
                placeholder="Como quer ser chamado?"
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-primary transition-colors"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-medium opacity-80">WhatsApp (com DDD)</label>
              <input 
                type="tel" 
                id="phone"
                required
                placeholder="(00) 00000-0000"
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-primary transition-colors"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              <p className="text-xs opacity-40">Nós enviaremos as instruções de conexão para este número.</p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label htmlFor="coupon" className="text-sm font-medium opacity-80 flex items-center justify-between">
                <span>Cupom de Desconto</span>
                <span className="text-xs text-brand-primary opacity-60">(Opcional)</span>
              </label>
              <input 
                type="text" 
                id="coupon"
                placeholder="Insira seu código"
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-primary transition-colors uppercase"
                value={formData.coupon}
                onChange={(e) => setFormData({...formData, coupon: e.target.value.toUpperCase()})}
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`mt-4 text-bg-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                isSubmitting ? 'bg-brand-primary/50 cursor-not-allowed' : 'bg-brand-primary hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isSubmitting ? 'Gerando Pagamento...' : 'Finalizar Compra Segura'} <ArrowRight size={20} />
            </button>
          </form>

          <div className="flex items-center gap-3 justify-center opacity-40 mt-8">
            <ShieldCheck size={20} />
            <span className="text-sm">Pagamento processado com segurança.</span>
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className="order-1 md:order-2 glass border-white/10 p-8 md:p-10 rounded-[32px] sticky top-32">
          <h2 className="text-xl font-bold mb-6 pb-6 border-b border-white/10">Resumo do Pedido</h2>
          
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="text-sm opacity-60 mb-1">Plano Selecionado</div>
              <div className="text-2xl font-bold text-brand-primary">{selectedPlan.name}</div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold opacity-50">R$</span>
                <span className="text-3xl font-bold">{selectedPlan.price}</span>
              </div>
              <div className="text-xs opacity-50">{selectedPlan.period}</div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-8">
            {selectedPlan.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-brand-primary" />
                </div>
                <span className="text-sm opacity-80 leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/5 rounded-xl p-4 text-sm opacity-70">
            Você terá <strong>7 dias de garantia</strong>. Se não gostar da experiência, devolvemos seu dinheiro.
          </div>
        </div>

      </div>
    </div>
  );
}
