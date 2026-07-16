import prisma from '../config/database';
import { AIService } from './ai.service';
import logger from '../config/logger';

export class OnboardingService {
  /**
   * Processa a mensagem do usuário no fluxo de onboarding
   */
  public static async processMessage(whatsappNumber: string, messageContent: string): Promise<string> {
    // 1. Busca o usuário pelo número de WhatsApp
    const user = await prisma.user.findUnique({
      where: { whatsappNumber }
    });

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const step = user.onboardingStep;
    logger.info(`Processing onboarding message for user ${user.id} at step ${step}`);

    if (step === 0) {
      return await this.handleStep0(user.id, messageContent);
    } else if (step === 2) {
      return await this.handleStep2(user.id, messageContent);
    } else if (step === 3) {
      return await this.handleStep3(user.id, messageContent);
    } else {
      // Caso de segurança: usuário já ativo ou em estado inconsistente
      return 'Seu onboarding já está completo, parceiro! Se precisar de ajuda, é só me mandar os gastos ou corridas do dia. 🚀';
    }
  }

  /**
   * Passo 0: Nome do Co-piloto
   */
  private static async handleStep0(userId: string, messageContent: string): Promise<string> {
    const systemInstruction = `
      Você é um assistente linguístico. Sua tarefa é analisar o nome sugerido pelo usuário para o seu Co-piloto inteligente.
      Você deve:
      1. Limpar o nome de qualquer pontuação final (como vírgulas, pontos ou exclamações) e espaços desnecessários.
      2. Identificar se o nome é predominantemente Masculino ("M") ou Feminino ("F") para usarmos o artigo correto em português.
      3. Determinar o artigo definido correspondente ("o" para masculino, "a" para feminino).
      Retorne estritamente um JSON no schema solicitado.
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        cleanedName: { type: 'STRING' },
        gender: { type: 'STRING', enum: ['M', 'F'] },
        article: { type: 'STRING', enum: ['o', 'a'] }
      },
      required: ['cleanedName', 'gender', 'article']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);

    let copilotName = messageContent.trim().replace(/[\s,\.\?!]+$/, '');
    let article = 'o';

    if (aiRes.success && aiRes.data?.cleanedName) {
      copilotName = aiRes.data.cleanedName;
      article = aiRes.data.article;
    }

    // Avança para o Step 2 (o Step 1 era a espera antiga, agora vamos direto ao 2)
    await prisma.user.update({
      where: { id: userId },
      data: {
        copilotName,
        onboardingStep: 2
      }
    });

    return `Prazer em conhecer você, agora eu sou ${article === 'a' ? 'a' : 'o'} *${copilotName}*! 🤝\n\nA partir de hoje, vou estar aqui do seu lado na cabine. Quando fizer uma corrida ou tiver um gasto, é só me mandar: por exemplo, 'fiz 50 no Uber' ou 'gasolina 100'. Eu anoto tudo no ato!\n\nAgora, para eu entender sua rotina e te ajudar a bater metas:\n\n**Qual o seu principal objetivo financeiro hoje rodando comigo e você roda em tempo integral ou faz apenas um bico nas horas vagas?**\n\n*(Pode digitar ou mandar um áudio de voz! 🎙️)*`;
  }

  /**
   * Passo 2: Objetivo e Regime
   */
  private static async handleStep2(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';

    const systemInstruction = `
      Você é o Co-piloto Inteligente. Sua missão é analisar a resposta do motorista e extrair:
      1. work_regime: Se o motorista roda em "tempo integral" (responda "integral") ou se faz apenas como "bico/extra" nas horas vagas (responda "bico").
      2. financial_goal: O objetivo financeiro ESPECÍFICO dele (ex: "pagar as contas", "comprar uma moto", "economizar").
      3. advance_step (boolean): Defina true APENAS se ele respondeu tanto o regime quanto o objetivo financeiro. Caso contrário, defina false.
      4. fallback_message (string/null): Se advance_step for false, crie uma mensagem amigável e calorosa insistindo no que faltou responder, usando o nome "${copilotName}" para se referir a si mesmo.
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        work_regime: { type: 'STRING', enum: ['integral', 'bico'] },
        financial_goal: { type: 'STRING' },
        advance_step: { type: 'BOOLEAN' },
        fallback_message: { type: 'STRING' }
      },
      required: ['work_regime', 'financial_goal', 'advance_step', 'fallback_message']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);

    if (aiRes.success && aiRes.data?.advance_step) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          workRegime: aiRes.data.work_regime,
          financialGoal: aiRes.data.financial_goal,
          onboardingStep: 3
        }
      });

      return `Entendido, parceiro! Já guardei tudo aqui no nosso painel. 📝\n\nAgora, para eu deixar seu relatório de bordo cirúrgico e calcular a saúde financeira do seu carro:\n\n**Qual é a Marca, o Modelo e o Ano do carro que a gente vai acelerar junto no trecho?**\n*(Exemplo: Chevrolet Onix 2021)*`;
    } else {
      const fallbackMsg = aiRes.data?.fallback_message || `Opa parceiro! Me conta também: qual é o seu principal objetivo financeiro rodando para que a ${copilotName} consiga te ajudar? 💰`;
      return fallbackMsg;
    }
  }

  /**
   * Passo 3: Veículo e Conclusão
   */
  private static async handleStep3(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';

    const systemInstruction = `
      Você é um especialista em mecânica, consumo e negócios para motoristas de aplicativos.
      Sua tarefa é analisar o veículo informado ("${messageContent}").
      Você deve:
      1. Identificar se o veículo é elétrico/híbrido (is_electric = true) ou combustão/gás (is_electric = false).
      2. Escrever um feedback humanizado, curto (máximo 2 parágrafos simples), parabenizando a escolha do carro, classificando-o (hatch, sedan, SUV, etc.) e dando uma dica prática de economia de combustível ou de manutenção preventiva específica desse modelo que ajude o motorista a poupar dinheiro. Seja caloroso, informal e chame-o de parceiro.
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        is_electric: { type: 'BOOLEAN' },
        feedback_humanizado: { type: 'STRING' }
      },
      required: ['is_electric', 'feedback_humanizado']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);

    const isElectric = aiRes.data?.is_electric === true;
    const feedback = aiRes.data?.feedback_humanizado || `Baita carro! O ${messageContent} vai nos ajudar muito nas corridas do dia a dia.`;

    await prisma.user.update({
      where: { id: userId },
      data: {
        vehicleInfo: messageContent,
        onboardingStep: 4,
        onboardingStatus: 'active'
      }
    });

    const dicaExemplo = isElectric
      ? `Quando recarregar a bateria ou tiver um gasto, manda: *'35 de energia'*`
      : `Quando abastecer ou tiver um gasto, manda: *'40 de gasolina'*`;

    return `Sensacional! Tudo pronto e configurado no nosso painel de controle. 🚀\n\nA partir de agora, a *${copilotName}* está oficialmente monitorando a sua cabine!\n\n${feedback}\n\nQuando fizer uma corrida, é só me mandar: *'fiz 80 no Uber'*. ${dicaExemplo}. Se preferir, pode mandar áudio que eu me viro pra ler. 😉\n\nEstou pronto aqui no banco do passageiro. Desejo uma ótima rodagem para nós e muito lucro! 🏁💰`;
  }
}
