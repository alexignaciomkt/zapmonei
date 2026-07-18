import prisma from '../config/database';
import { AIService } from './ai.service';
import logger from '../config/logger';

export class OnboardingService {
  /**
   * Processa a mensagem do usuário no fluxo de onboarding.
   * Fluxo com etapas de confirmação (Step 0 → 1 → 2 → 21 → 3 → 4 → 41 → 5 → 51 → Finalizado)
   */
  public static async processMessage(whatsappNumber: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { whatsappNumber }
    });

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const step = user.onboardingStep;
    logger.info(`Processing onboarding message for user ${user.id} at step ${step}`);

    switch (step) {
      case 0:
        return await this.handleStep0(user.id);
      case 1:
        return await this.handleStep1(user.id, messageContent);
      case 2:
        return await this.handleStep2(user.id, messageContent);
      case 21: // Confirmação de Regime/Escopo
        return await this.handleStep2Confirmation(user.id, messageContent);
      case 3:
        return await this.handleStep3(user.id, messageContent);
      case 4:
        return await this.handleStep4(user.id, messageContent);
      case 41: // Confirmação das Metas
        return await this.handleStep41Confirmation(user.id, messageContent);
      case 5:
        return await this.handleStep5(user.id, messageContent);
      case 51: // Confirmação do Veículo
        return await this.handleStep5Confirmation(user.id, messageContent);
      default:
        return 'Seu onboarding já está completo, parceiro! Se precisar de ajuda, é só me mandar os gastos ou corridas do dia. 🚀';
    }
  }

  // Helper para verificar se a resposta é um "Sim"
  private static async checkYesOrNo(messageContent: string): Promise<boolean> {
    const systemInstruction = `
      Analise o texto do usuário e responda rigorosamente com um JSON contendo a propriedade "is_yes" (booleano).
      Retorne true se o usuário está dizendo "Sim", confirmando algo, concordando, usando sinônimos de confirmação como "isso", "com certeza", "exato", "correto", "pode ser", "é isso", "ok", "beleza".
      Retorne false se ele está negando ("Não", "tá errado", "não é isso"), corrigindo a informação, ou se a resposta for confusa/negativa.
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        is_yes: { type: 'BOOLEAN' }
      },
      required: ['is_yes']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);
    if (aiRes.success && aiRes.data) {
      return aiRes.data.is_yes === true;
    }
    
    // Fallback simples local se a IA falhar
    const clean = messageContent.toLowerCase().trim();
    return clean.includes('sim') || clean.includes('isso') || clean.includes('exato') || clean.includes('ok') || clean.includes('correto') || clean === 's';
  }

  // ────────────────────────────────────────────────────
  // Step 0: Apresentação do Co-piloto + Pedir nome
  // ────────────────────────────────────────────────────
  private static async handleStep0(userId: string): Promise<string> {
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingStep: 1 }
    });

    return `Fala, parceiro! 👊 Eu sou o seu Co-piloto Inteligente 🤖\n\nMeu único objetivo aqui é simples: te ajudar a ver a cor do dinheiro no fim do dia e fazer seu lucro sobrar de verdade no bolso.\n\nQuando você fizer uma corrida ou tiver um gasto, é só me mandar aqui mesmo. Por exemplo:\n• *"fiz 50 no Uber"*\n• *"gasolina 100"*\n• *"almoço 25"*\n\nEu anoto tudo no ato! Pode mandar por texto ou áudio 🎙️\n\nAgora me diz: **como você quer me chamar?** Pode ser qualquer nome — Alfred, Monei, Sofia, Meu Sócio... você que manda! 😄`;
  }

  // ────────────────────────────────────────────────────
  // Step 1: Batismo do Co-piloto + Pergunta Regime/Escopo
  // ────────────────────────────────────────────────────
  private static async handleStep1(userId: string, messageContent: string): Promise<string> {
    const rawContent = messageContent.trim().replace(/^[\s=]+/, '');

    const systemInstruction = `
      Você é um assistente linguístico de elite. Sua tarefa é analisar o nome sugerido pelo usuário para o seu Co-piloto inteligente.
      Você deve identificar se o nome é predominantemente Masculino ("M") ou Feminino ("F") para usarmos o artigo correto em português ("o" para masculino, "a" para feminino).

      ATENÇÃO: Muitos nomes femininos comuns no Brasil não terminam com "a".
      Exemplos femininos: Stephanie, Kathelyn, Carol, Joyce, Mary, Nicole, Kelly, Ketlin, Evelyn, Miriam.
      Exemplos masculinos: Alfred, Gabriel, Davi, Samuel, Igor, Felipe, Yuri.

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

    const aiRes = await AIService.executeStructuredTask(systemInstruction, rawContent, jsonSchema);

    let copilotName = rawContent.replace(/[\s,\.?!]+$/, '');
    let article = 'o';

    if (aiRes.success && aiRes.data) {
      copilotName = aiRes.data.cleanedName || copilotName;
      article = aiRes.data.article || this.getArticle(copilotName);
    } else {
      article = this.getArticle(copilotName);
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        copilotName,
        onboardingStep: 2
      }
    });

    return `Prazer em te conhecer! Agora eu sou ${article === 'a' ? 'a' : 'o'} *${copilotName}*! 🤝\n\nA partir de hoje, tô aqui do seu lado na cabine. Agora preciso entender um pouquinho da sua rotina pra te ajudar melhor.\n\nMe conta duas coisas:\n\n1️⃣ **Você roda o dia inteiro ou é mais um bico nas horas vagas?**\n\n2️⃣ **Quer que eu cuide só do que rola no app (Uber, 99...) ou da sua vida financeira toda, incluindo contas de casa?**\n\n_(Pode mandar tudo junto, na boa! Texto ou áudio 🎙️)_`;
  }

  // ────────────────────────────────────────────────────
  // Step 2: Recebe Regime/Escopo -> Pergunta confirmação
  // ────────────────────────────────────────────────────
  private static async handleStep2(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';

    const systemInstruction = `
      Você é o ${copilotName}, um Co-piloto Inteligente para motoristas de app no Brasil. Analise a resposta do motorista e tente extrair as seguintes informações:

      1. work_regime: Se ele roda "o dia inteiro" / "tempo integral" / "todo dia" / "trabalho direto" → responda "integral". Se faz como "bico" / "extra" / "horas vagas" / "quando sobra tempo" → responda "bico". Se não mencionou ou ficou confuso, responda "integral".

      2. control_scope: Se ele quer controlar "só o app" / "só corridas" / "só carro" → responda "app". Se quer "incluir casa" / "tudo" / "vida financeira toda" / "casa e trabalho" → responda "ambos". Se quer "só casa" / "só pessoal" → responda "casa". Se não mencionou ou ficou confuso, responda "ambos".

      3. feedback_confirmacao: Crie uma frase curta e descontraída em português, dizendo o que você entendeu de forma natural e amigável. IMPORTANTE: termine a frase com uma pergunta de validação: "É isso mesmo, anotei corretamente?" ou similar.
         - Exemplo: "Maravilha, parceiro! Entendi que você roda o dia todo e quer que eu cuide de tudo (casa e app). É isso mesmo, anotei corretamente?"

      Seja extremamente tolerante e amigável no tom. Retorne estritamente o JSON solicitado.
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        work_regime: { type: 'STRING', enum: ['integral', 'bico'] },
        control_scope: { type: 'STRING', enum: ['app', 'casa', 'ambos'] },
        feedback_confirmacao: { type: 'STRING' }
      },
      required: ['work_regime', 'control_scope', 'feedback_confirmacao']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);

    const updateData: any = {
      onboardingStep: 21 // Vai para a confirmação
    };

    let feedbackConfirmacao = '';

    if (aiRes.success && aiRes.data) {
      updateData.workRegime = aiRes.data.work_regime;
      updateData.controlScope = aiRes.data.control_scope;
      feedbackConfirmacao = aiRes.data.feedback_confirmacao;
    } else {
      updateData.workRegime = 'integral';
      updateData.controlScope = 'ambos';
      feedbackConfirmacao = 'Maravilha, parceiro! Entendi que você roda o dia todo e quer que eu cuide de tudo, tanto do app quanto da casa. É isso mesmo, anotei corretamente?';
    }

    await prisma.user.update({ where: { id: userId }, data: updateData });
    return feedbackConfirmacao;
  }

  // ────────────────────────────────────────────────────
  // Step 21: Processa a confirmação do Regime/Escopo
  // ────────────────────────────────────────────────────
  private static async handleStep2Confirmation(userId: string, messageContent: string): Promise<string> {
    const isConfirmed = await this.checkYesOrNo(messageContent);

    if (isConfirmed) {
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingStep: 3 }
      });
      return `Show de bola! Confirmado! 🎯\n\nAgora me fala: **em quais apps você roda?** Uber, 99, iFood, InDrive...? Pode falar todos! 🚗📱`;
    } else {
      // Se não confirmou, resetamos para o Step 2 e pedimos novamente
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingStep: 2 }
      });
      return `Opa, desculpa a falha do seu Co-piloto! 😅 Me explica de novo então:\n\n1️⃣ **Você roda o dia inteiro ou é bico nas horas vagas?**\n\n2️⃣ **Quer que eu cuide só das corridas do app ou da casa toda também?**`;
    }
  }

  // ────────────────────────────────────────────────────
  // Step 3: Recebe Plataformas + Pergunta Metas ($$)
  // ────────────────────────────────────────────────────
  private static async handleStep3(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';

    const systemInstruction = `
      Você é o ${copilotName}, um Co-piloto Inteligente. Analise a resposta do motorista e extraia as plataformas/apps que ele usa.

      Retorne:
      1. platforms: Uma string com os nomes das plataformas separados por vírgula, com a primeira letra maiúscula. Ex: "Uber, 99, iFood". Se ele mencionou apenas uma, retorne apenas ela. Se ele disse algo genérico como "todos" ou "vários", retorne "Uber, 99, iFood, InDrive".
      2. understood: true se conseguiu identificar pelo menos uma plataforma, false se a resposta não faz sentido ou está vazia.

      Seja generoso na interpretação.
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        platforms: { type: 'STRING' },
        understood: { type: 'BOOLEAN' }
      },
      required: ['platforms', 'understood']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);

    // Salvamos e avançamos direto para a pergunta de Metas (plataformas geralmente é bem direta, não precisa de validação de sim/não)
    const platforms = (aiRes.success && aiRes.data?.understood) ? aiRes.data.platforms : 'Uber, 99';

    await prisma.user.update({
      where: { id: userId },
      data: {
        platforms,
        onboardingStep: 4
      }
    });

    return `Beleza, plataformas anotadas! 📝\n\nAgora vem a pergunta de ouro: **no final do mês, quanto você quer ter sobrado no bolso?**\n\nE no final de um dia de trabalho, **quanto precisa ter na tela do app pra você dizer "hoje valeu a pena"?**\n\n_(Pode mandar os valores aproximados, sem frescura!)_`;
  }

  // ────────────────────────────────────────────────────
  // Step 4: Recebe Metas -> Pergunta confirmação
  // ────────────────────────────────────────────────────
  private static async handleStep4(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';

    const systemInstruction = `
      Você é o ${copilotName}, um Co-piloto Inteligente para motoristas de app no Brasil. Analise a resposta do motorista e extraia os valores de meta financeira:

      1. monthly_goal: Meta mensal desejada pelo usuário (apenas o número decimal). Se não mencionou ou ficou confuso, responda 5000.00.
      2. daily_goal: Meta diária desejada pelo usuário (apenas o número decimal). Se não mencionou ou ficou confuso, responda 200.00.

      3. feedback_confirmacao: Crie uma frase curta, calorosa e descontraída em português confirmando as metas.
         Termine SEMPRE com uma pergunta de validação: "É isso mesmo, anotei corretamente?" ou similar.
         - Exemplo: "Meta de gigante! Anotei aqui: R$ 5.000 sobrando no bolso por mês, e R$ 200 na tela por dia. É isso mesmo, anotei certinho? 🎯"

      IMPORTANTE: Seja generoso.
      Retorne estritamente o JSON solicitado.
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        monthly_goal: { type: 'NUMBER' },
        daily_goal: { type: 'NUMBER' },
        feedback_confirmacao: { type: 'STRING' }
      },
      required: ['monthly_goal', 'daily_goal', 'feedback_confirmacao']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);

    const updateData: any = {
      onboardingStep: 41 // Vai para confirmação de metas
    };

    let feedbackConfirmacao = '';

    if (aiRes.success && aiRes.data) {
      updateData.monthlyGoal = aiRes.data.monthly_goal;
      updateData.dailyGoal = aiRes.data.daily_goal;
      feedbackConfirmacao = aiRes.data.feedback_confirmacao;
    } else {
      updateData.monthlyGoal = 5000.00;
      updateData.dailyGoal = 200.00;
      feedbackConfirmacao = `Deixei anotado nossa meta de R$ 5.000 por mês e R$ 200 por dia pra fazer o dia valer a pena. É isso mesmo, anotei corretamente? 🎯`;
    }

    await prisma.user.update({ where: { id: userId }, data: updateData });
    return feedbackConfirmacao;
  }

  // ────────────────────────────────────────────────────
  // Step 41: Processa confirmação das metas
  // ────────────────────────────────────────────────────
  private static async handleStep41Confirmation(userId: string, messageContent: string): Promise<string> {
    const isConfirmed = await this.checkYesOrNo(messageContent);

    if (isConfirmed) {
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingStep: 5 }
      });
      return `Fechado! Metas salvas! 🏁\n\nAgora me conta: **qual é o carro que a gente vai acelerar junto no trecho?** Me diz a marca, o modelo e o ano! 🚗\n_(Ex: Chevrolet Onix 2021, BYD Dolphin 2024)_`;
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingStep: 4 }
      });
      return `Tranquilo! Vamos arrumar. Me conta de novo: **quanto você quer ver sobrando no bolso no final do mês? E qual sua meta diária de faturamento?**`;
    }
  }

  // ────────────────────────────────────────────────────
  // Step 5: Recebe Veículo -> Pergunta confirmação
  // ────────────────────────────────────────────────────
  private static async handleStep5(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';

    const systemInstruction = `
      Você é o ${copilotName}, um Co-piloto Inteligente para motoristas de app no Brasil.
      O motorista informou o veículo dele. Sua tarefa:

      1. is_electric: Identifique se o veículo é elétrico/híbrido (true) ou combustão/gás (false).
      2. vehicle_summary: Uma string curta com marca, modelo e ano formatados. Ex: "Chevrolet Onix 2021"
      3. feedback_confirmacao: Crie uma mensagem empolgada e calorosa em português.
         Termine com a pergunta de confirmação: "É esse o seu carro mesmo, anotei correto?" ou similar.
         - Exemplo: "Baita carro! Um SUV compacto muito confortável. Entendi que é um Chevrolet Tracker 2022. É esse o seu carro mesmo, anotei correto?"

      Retorne estritamente o JSON.
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        is_electric: { type: 'BOOLEAN' },
        vehicle_summary: { type: 'STRING' },
        feedback_confirmacao: { type: 'STRING' }
      },
      required: ['is_electric', 'vehicle_summary', 'feedback_confirmacao']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);

    const updateData: any = {
      onboardingStep: 51
    };

    let feedbackConfirmacao = '';

    if (aiRes.success && aiRes.data) {
      updateData.vehicleInfo = aiRes.data.vehicle_summary;
      // Guardamos provisoriamente se é elétrico nas metas para uso final
      updateData.isDriver = !aiRes.data.is_electric; // isDriver falso pode significar elétrico se preferir, ou apenas guardamos a string do veículo
      feedbackConfirmacao = aiRes.data.feedback_confirmacao;
    } else {
      updateData.vehicleInfo = messageContent;
      feedbackConfirmacao = `Excelente escolha! Entendi que é um ${messageContent}. É esse mesmo o veículo que vamos usar, anotei correto? 🚗`;
    }

    await prisma.user.update({ where: { id: userId }, data: updateData });
    return feedbackConfirmacao;
  }

  // ────────────────────────────────────────────────────
  // Step 51: Processa confirmação do veículo e finaliza
  // ────────────────────────────────────────────────────
  private static async handleStep5Confirmation(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';
    const article = this.getArticle(copilotName);
    const isElectric = user?.isDriver === false; // Conforme mapeado provisoriamente no Step 5

    const isConfirmed = await this.checkYesOrNo(messageContent);

    if (isConfirmed) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          onboardingStep: 6,
          onboardingStatus: 'active'
        }
      });

      const exemploGasto = isElectric
        ? `Quando recarregar: *"35 de energia"*`
        : `Quando abastecer: *"40 de gasolina"*`;

      return `Sensacional! Tudo pronto e configurado no nosso painel de controle! 🚀\n\nA partir de agora, ${article} *${copilotName}* tá oficialmente monitorando a sua cabine! 🏁\n\nÉ só me mandar as coisas do dia a dia:\n• Fez uma corrida: *"fiz 80 no Uber"*\n• ${exemploGasto}\n• Teve um gasto: *"almoço 25"*\n\nPode mandar por texto ou áudio, eu me viro! 😉\n\nBora pra cima, parceiro! Desejo uma ótima rodagem e muito lucro pra nós! 🏁💰`;
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingStep: 5 }
      });
      return `Sem problemas, meu erro! Me diz de novo então: **qual a marca, modelo e ano do seu carro?**`;
    }
  }

  // ────────────────────────────────────────────────────
  // Utilitário: determina artigo (o/a) pelo nome
  // ────────────────────────────────────────────────────
  private static getArticle(name: string): string {
    const lowerName = name.toLowerCase().trim();
    if (lowerName.endsWith('a') || lowerName.endsWith('ia') || lowerName.endsWith('na')) {
      return 'a';
    }
    return 'o';
  }
}
