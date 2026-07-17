import prisma from '../config/database';
import { AIService } from './ai.service';
import logger from '../config/logger';

export class OnboardingService {
  /**
   * Processa a mensagem do usuário no fluxo de onboarding.
   * Fluxo: Step 0→5 (5 interações do usuário)
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
      case 3:
        return await this.handleStep3(user.id, messageContent);
      case 4:
        return await this.handleStep4(user.id, messageContent);
      case 5:
        return await this.handleStep5(user.id, messageContent);
      default:
        return 'Seu onboarding já está completo, parceiro! Se precisar de ajuda, é só me mandar os gastos ou corridas do dia. 🚀';
    }
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
      Você é um assistente linguístico. Sua tarefa é analisar o nome sugerido pelo usuário para o seu Co-piloto inteligente.
      Você deve:
      1. Limpar o nome de qualquer pontuação final (como vírgulas, pontos ou exclamações), aspas e espaços desnecessários.
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

    const aiRes = await AIService.executeStructuredTask(systemInstruction, rawContent, jsonSchema);

    let copilotName = rawContent.replace(/[\s,\.?!]+$/, '');
    let article = 'o';

    if (aiRes.success && aiRes.data?.cleanedName) {
      copilotName = aiRes.data.cleanedName;
      article = aiRes.data.article || 'o';
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
  // Step 2: Recebe Regime/Escopo + Pergunta Plataformas
  // ────────────────────────────────────────────────────
  private static async handleStep2(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';

    const systemInstruction = `
      Você é o ${copilotName}, um Co-piloto Inteligente para motoristas de app. Analise a resposta do motorista e extraia:

      1. work_regime: Se ele roda "o dia inteiro" / "tempo integral" → responda "integral". Se faz como "bico" / "extra" / "horas vagas" → responda "bico". Se não mencionou, responda null.

      2. control_scope: Se ele quer controlar "só o app" / "só corridas" → responda "app". Se quer "incluir casa" / "tudo" / "vida financeira toda" → responda "ambos". Se quer "só casa" / "só pessoal" → responda "casa". Se não mencionou, responda null.

      3. missing_fields: Liste os campos que NÃO foram respondidos (array de strings: "work_regime" e/ou "control_scope"). Se ambos foram respondidos, retorne array vazio [].

      4. followup_message: Se missing_fields não está vazio, crie uma mensagem curta, amigável e descontraída pedindo APENAS o que faltou. Use o nome "${copilotName}" para se referir a si mesmo. Se tudo foi respondido, retorne null.

      IMPORTANTE: Seja generoso na interpretação. Se o motorista deu qualquer indicação sobre o tema, considere como respondido.
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        work_regime: { type: 'STRING' },
        control_scope: { type: 'STRING' },
        missing_fields: { type: 'ARRAY', items: { type: 'STRING' } },
        followup_message: { type: 'STRING' }
      },
      required: ['missing_fields']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);

    if (!aiRes.success) {
      return `Opa, não consegui entender direito! 😅 Me conta de novo: você roda o dia inteiro ou é mais um bico? E quer que eu cuide só do app ou da vida financeira toda?`;
    }

    const data = aiRes.data;
    const updateData: any = {};

    // Salva progressivamente o que foi extraído
    if (data.work_regime) {
      updateData.workRegime = data.work_regime;
    }
    if (data.control_scope) {
      updateData.controlScope = data.control_scope;
    }

    const missingFields = data.missing_fields || [];

    if (missingFields.length > 0) {
      // Salva o que conseguiu extrair (parcial)
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({ where: { id: userId }, data: updateData });
      }
      return data.followup_message || `Opa parceiro! Me faltou entender uma coisinha. Me conta: ${missingFields.includes('work_regime') ? 'você roda o dia inteiro ou é bico?' : ''} ${missingFields.includes('control_scope') ? 'E quer que eu cuide só do app ou da vida financeira toda?' : ''}`.trim();
    }

    // Tudo extraído → avança
    updateData.onboardingStep = 3;
    await prisma.user.update({ where: { id: userId }, data: updateData });

    return `Show, já anotei tudo aqui! 📝\n\nAgora me fala: **em quais apps você roda?** Uber, 99, iFood, InDrive...? Pode falar todos! 🚗📱`;
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

      Seja generoso na interpretação. "Uber" sozinho já basta. "99 e uber" = "Uber, 99".
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

    if (!aiRes.success || !aiRes.data?.understood) {
      return `Hmm, não consegui pegar direito 😅 Me fala de novo: em quais apps você roda? Uber, 99, iFood...?`;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        platforms: aiRes.data.platforms,
        onboardingStep: 4
      }
    });

    return `Beleza, parceiro! Agora vem a pergunta de ouro 💰\n\n**No final do mês, quanto você quer ter sobrado no bolso?**\n\nE me diz também: **no final de um dia de trabalho, quanto precisa ter na tela do app pra você dizer "poxa, hoje valeu a pena"?**\n\n_(Pode mandar um valor aproximado, sem frescura! Ex: "quero fazer 5 mil no mês e uns 200 por dia")_`;
  }

  // ────────────────────────────────────────────────────
  // Step 4: Recebe Metas + Pergunta Veículo
  // ────────────────────────────────────────────────────
  private static async handleStep4(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';

    const systemInstruction = `
      Você é o ${copilotName}, um Co-piloto Inteligente. Analise a resposta do motorista e extraia os valores de meta financeira.

      Retorne:
      1. monthly_goal: O valor da meta MENSAL em número decimal (apenas o número, sem R$ ou texto). Ex: se ele disse "5 mil no mês", retorne 5000.00. Se não mencionou meta mensal, retorne null.
      2. daily_goal: O valor da meta DIÁRIA em número decimal. Ex: se ele disse "200 por dia", retorne 200.00. Se não mencionou meta diária, retorne null.
      3. missing_fields: Array com os campos não respondidos ("monthly_goal" e/ou "daily_goal"). Se ambos foram respondidos, retorne [].
      4. followup_message: Se faltou algum campo, crie uma mensagem curta e descontraída pedindo APENAS o que faltou. Lembre-se: linguagem simples, como se tivesse conversando no bar. Use o nome "${copilotName}". Se tudo foi respondido, retorne null.

      IMPORTANTE: Seja generoso. "uns 5k" = 5000. "200 conto" = 200. Se ele deu um range como "entre 4 e 5 mil", use o valor do meio (4500).
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        monthly_goal: { type: 'NUMBER' },
        daily_goal: { type: 'NUMBER' },
        missing_fields: { type: 'ARRAY', items: { type: 'STRING' } },
        followup_message: { type: 'STRING' }
      },
      required: ['missing_fields']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);

    if (!aiRes.success) {
      return `Opa, não consegui entender os valores! 😅 Me fala de novo: quanto você quer fazer no mês e quanto por dia? Pode ser um número redondo, sem frescura!`;
    }

    const data = aiRes.data;
    const updateData: any = {};

    if (data.monthly_goal !== null && data.monthly_goal !== undefined) {
      updateData.monthlyGoal = data.monthly_goal;
    }
    if (data.daily_goal !== null && data.daily_goal !== undefined) {
      updateData.dailyGoal = data.daily_goal;
    }

    const missingFields = data.missing_fields || [];

    if (missingFields.length > 0) {
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({ where: { id: userId }, data: updateData });
      }
      return data.followup_message || `Quase lá! Me fala também: ${missingFields.includes('monthly_goal') ? 'quanto quer ter sobrado no final do mês?' : ''} ${missingFields.includes('daily_goal') ? 'E quanto precisa fazer por dia pra dizer que valeu a pena?' : ''}`.trim();
    }

    updateData.onboardingStep = 5;
    await prisma.user.update({ where: { id: userId }, data: updateData });

    return `Anotado! 📝 Agora a gente sabe exatamente onde mirar. 🎯\n\nÚltima pergunta: **qual é o carro que a gente vai acelerar junto no trecho?**\n\nMe diz a marca, o modelo e o ano! 🚗\n_(Ex: Chevrolet Onix 2021, BYD Dolphin 2024, Fiat Argo 2020)_`;
  }

  // ────────────────────────────────────────────────────
  // Step 5: Recebe Veículo + Feedback + Finaliza
  // ────────────────────────────────────────────────────
  private static async handleStep5(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';
    const article = this.getArticle(copilotName);

    const systemInstruction = `
      Você é o ${copilotName}, um Co-piloto Inteligente para motoristas de app no Brasil.

      O motorista informou o veículo dele. Sua tarefa:

      1. is_electric: Identifique se o veículo é elétrico/híbrido (true) ou combustão/gás (false).
         - BYD, Tesla, Nissan Leaf, Renault Zoe, JAC E-JS1 → true
         - Chevrolet, Fiat, Volkswagen, Hyundai HB20, Toyota Corolla (não híbrido) → false
         - Se for híbrido (como Corolla Hybrid, Prius), considere true.

      2. vehicle_summary: Uma string curta com marca, modelo e ano formatados. Ex: "Chevrolet Onix 2021"

      3. feedback: Uma mensagem simpática e calorosa (2-3 frases no máximo) elogiando a escolha do carro.
         - Classifique o tipo (hatch, sedan, SUV, etc.)
         - Faça um elogio genuíno sobre o carro
         - NÃO dê dicas técnicas de consumo ou manutenção (isso virá numa fase futura)
         - NÃO mencione valores de km/L ou problemas mecânicos
         - Seja descontraído e positivo, como um amigo empolgado
         - Exemplo: "Poxa, que top! Um SUV compacto super confortável tanto pra você quanto pro passageiro. Ótima escolha, parceiro!"

      Retorne estritamente o JSON.
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        is_electric: { type: 'BOOLEAN' },
        vehicle_summary: { type: 'STRING' },
        feedback: { type: 'STRING' }
      },
      required: ['is_electric', 'vehicle_summary', 'feedback']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);

    const isElectric = aiRes.data?.is_electric === true;
    const vehicleSummary = aiRes.data?.vehicle_summary || messageContent;
    const feedback = aiRes.data?.feedback || `Baita carro! O ${messageContent} vai nos ajudar muito nas corridas!`;

    await prisma.user.update({
      where: { id: userId },
      data: {
        vehicleInfo: vehicleSummary,
        onboardingStep: 6,
        onboardingStatus: 'active'
      }
    });

    const exemploGasto = isElectric
      ? `Quando recarregar: *"35 de energia"*`
      : `Quando abastecer: *"40 de gasolina"*`;

    return `Sensacional! Tudo pronto e configurado no nosso painel de controle! 🚀\n\n${feedback}\n\nA partir de agora, ${article} *${copilotName}* tá oficialmente monitorando a sua cabine! 🏁\n\nÉ só me mandar as coisas do dia a dia:\n• Fez uma corrida: *"fiz 80 no Uber"*\n• ${exemploGasto}\n• Teve um gasto: *"almoço 25"*\n\nPode mandar por texto ou áudio, eu me viro! 😉\n\nBora pra cima, parceiro! Desejo uma ótima rodagem e muito lucro pra nós! 🏁💰`;
  }

  // ────────────────────────────────────────────────────
  // Utilitário: determina artigo (o/a) pelo nome
  // ────────────────────────────────────────────────────
  private static getArticle(name: string): string {
    const lowerName = name.toLowerCase().trim();
    // Nomes terminados em 'a' geralmente são femininos em português
    if (lowerName.endsWith('a') || lowerName.endsWith('ia') || lowerName.endsWith('na')) {
      return 'a';
    }
    return 'o';
  }
}
