import { NextResponse } from 'next/server';

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';
// Workaround: o $ no início da chave do Asaas confunde o dotenv. Guardamos sem o $ e adicionamos aqui.
const ASAAS_API_KEY = process.env.ASAAS_API_KEY_RAW ? `$${process.env.ASAAS_API_KEY_RAW}` : null;

export async function POST(req: Request) {
  if (!ASAAS_API_KEY) {
    return NextResponse.json({ error: 'Chave da API do Asaas não configurada no servidor.' }, { status: 500 });
  }

  try {
    const { name, phone, plan, price, period, coupon } = await req.json();

    // 1. Criar ou Recuperar o Cliente (Customer) no Asaas
    const customerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        name: name,
        mobilePhone: phone.replace(/\D/g, ''),
      })
    });

    const customerData = await customerResponse.json();

    if (!customerResponse.ok) {
      console.error('Erro ao criar cliente Asaas:', customerData);
      return NextResponse.json({ error: 'Falha ao criar cliente no Asaas.' }, { status: 400 });
    }

    const customerId = customerData.id;

    // 2. Criar a Assinatura (Subscription)
    const cycle = period.includes('anualmente') ? 'YEARLY' : 'MONTHLY';
    // Conversão de preço string "29,90" para numérico 29.90
    const numericPrice = parseFloat(price.replace(',', '.'));

    // Configuração do Desconto (Apenas se o cupom for o nosso código secreto KATHY100)
    // Se o cliente digitar qualquer outra coisa, o desconto fica undefined (sem desconto).
    const isFreeTest = coupon === 'KATHY100';
    
    const discountConfig = isFreeTest ? {
      value: 100,           // 100% de desconto
      dueDateLimitDays: 0,
      type: "PERCENTAGE"
    } : undefined;

    // Regra de Negócio: Plano Anual (Recorrente) obriga Cartão de Crédito para não prender limite.
    // Os demais (Piloto/Familiar Mensal) permitem Pix, Boleto ou Cartão.
    const billingType = period.includes('anualmente') ? 'CREDIT_CARD' : 'UNDEFINED';

    const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: billingType, 
        value: numericPrice,
        nextDueDate: new Date().toISOString().split('T')[0], // Cobrança para Hoje
        cycle: cycle,
        description: `ZapMonei - ${plan}${coupon ? ` (Cupom: ${coupon})` : ''}`,
        discount: discountConfig
      })
    });

    const subscriptionData = await subscriptionResponse.json();

    if (!subscriptionResponse.ok) {
      console.error('Erro ao criar assinatura Asaas:', JSON.stringify(subscriptionData, null, 2));
      console.error('Payload enviado:', JSON.stringify({
        customer: customerId, billingType, value: numericPrice,
        nextDueDate: new Date().toISOString().split('T')[0], cycle,
        description: `ZapMonei - ${plan}`, discount: discountConfig
      }, null, 2));
      return NextResponse.json({ error: `Falha ao criar assinatura no Asaas. Detalhes: ${JSON.stringify(subscriptionData)}` }, { status: 400 });
    }

    // 3. Buscar o Link de Pagamento da primeira fatura gerada
    // Quando criamos a assinatura para "hoje", o Asaas já gera a primeira cobrança automaticamente.
    const paymentsResponse = await fetch(`${ASAAS_API_URL}/payments?subscription=${subscriptionData.id}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });
    const paymentsData = await paymentsResponse.json();
    
    // Pegamos a URL da fatura para redirecionar o cliente
    const invoiceUrl = paymentsData.data[0]?.invoiceUrl;

    if (!invoiceUrl) {
      return NextResponse.json({ error: 'Fatura não gerada a tempo.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, invoiceUrl: invoiceUrl });

  } catch (error) {
    console.error('Erro no checkout API:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
