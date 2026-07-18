import prisma from '../config/database';
import { AIService } from './ai.service';
import logger from '../config/logger';

export class OnboardingService {
  /**
   * Processa a mensagem do usuário no fluxo de onboarding.
   * Nova Sequência Dinâmica com Menus Numéricos e Lógica de Divisão de Metas.
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
      case 51: // Confirmação de Metas (Sim/Não)
        return await this.handleStep5Confirmation(user.id, messageContent);
      case 6:
        return await this.handleStep6(user.id, messageContent);
      case 61: // Pergunta Veículo e extrai dados
        return await this.handleStep6Confirmation(user.id, messageContent);
      case 7: // Confirmação do Veículo (Sim/Não)
        return await this.handleStep6ConfirmationProcess(user.id, messageContent);
      default:
        return 'Seu onboarding já está completo, parceiro! Se precisar de ajuda, é só me mandar os gastos ou corridas do dia. 🚀';
    }
  }

  // Helper robusto para validar confirmação "Sim/Não" do usuário (Aceita gírias + opção 1/2)
  private static async checkYesOrNo(messageContent: string): Promise<boolean> {
    const clean = messageContent.toLowerCase().trim().replace(/[\.\!\?\,=]/g, '');
    const digitsOnly = clean.replace(/\D/g, '');

    // Prioridade máxima e determinística para opções numéricas 1 e 2
    if (digitsOnly === '1' || clean === '1' || clean.startsWith('1 ') || clean.includes('opcao 1') || clean.includes('opção 1')) {
      return true;
    }
    if (digitsOnly === '2' || clean === '2' || clean.startsWith('2 ') || clean.includes('opcao 2') || clean.includes('opção 2')) {
      return false;
    }

    // Se o usuário respondeu em texto (sinônimos brasileiros)
    const afirmativas = [
      'sim', 's', 'isso', 'exato', 'ok', 'correto', 'perfeito', 
      'fechado', 'beleza', 'show', 'valeu', 'exatamente', 
      'e isso', 'e isso mesmo', 'pode ser', 'com certeza', 'tranquilo',
      'pode crer', 'demorou', 'e nois', 'top', 'firmeza', 'pode pa',
      'massa', 'suave', 'na mosca', 'tmj', 'ja e', 'sem cao', 'da hora',
      'certim', 'certinho', 'certeza', 'so o miolo', 'brocou', 'estourou', 
      'tri', 'baita', 'boto fe', 'so o ouro', 'rocha', 'bem isso', 'faz sentido'
    ];
    return afirmativas.some(palavra => clean === palavra || clean.includes(palavra)) || clean === 's';
  }

  // ────────────────────────────────────────────────────
  // Step 0: Apresentação Geral + Migué do Regionalismo + Pede Nome
  // ────────────────────────────────────────────────────
  private static async handleStep0(userId: string): Promise<string> {
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingStep: 1 }
    });

    return `Fala, parceiro! 👊 Eu sou o seu Co-piloto Inteligente 🤖\n\nMeu único objetivo é fazer seu lucro sobrar de verdade no bolso no fim do mês! 💰\n\nComo o nosso Brasil é gigante e a gente tem gírias muito diferentes de norte a sul, eu preparei um fluxo bem rapidinho com opções de números para eu não correr o risco de entender nada errado, blz? \n\nAssim, a gente fala a mesma língua e deixa tudo configurado perfeitamente pro seu trampo! 😉\n\nPara começar: **como você quer me chamar?** Pode ser Alfred, Monei, Sofia, Meu Sócio... o nome que preferir! 👇`;
  }

  // ────────────────────────────────────────────────────
  // Step 1: Recebe Nome -> Pergunta 1: Regime (Integral vs Bico)
  // ────────────────────────────────────────────────────
  private static async handleStep1(userId: string, messageContent: string): Promise<string> {
    const rawContent = messageContent.trim().replace(/^[\s=]+/, '');

    const systemInstruction = `
      Você é um assistente linguístico de elite. Identifique se o nome sugerido é predominantemente Masculino ("M") ou Feminino ("F") para o artigo definido correspondente.
      Nomes femininos como Stephanie, Kathelyn, Carol, Joyce, Mary, Nicole, Kelly, Ketlin, Evelyn, Miriam são Femininos.
      Retorne estritamente o JSON.
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

    return `Prazer enorme! Agora eu sou a sua *${copilotName}*! 🤝\n\nBora lá pras perguntinhas. Responda digitando apenas o número:\n\n1️⃣ **Como é a sua rotina de rodagem?**\n\n**1** - Rodo o dia todo (Integral) 🚗\n**2** - É mais um bico nas horas vagas (Bico) ⏱️`;
  }

  // ────────────────────────────────────────────────────
  // Step 2: Recebe Regime -> Pergunta 2: Escopo (App vs Casa)
  // ────────────────────────────────────────────────────
  private static async handleStep2(userId: string, messageContent: string): Promise<string> {
    const clean = messageContent.toLowerCase().trim().replace(/[\.\!\?\,=]/g, '');
    const digitsOnly = clean.replace(/\D/g, '');

    let workRegime = 'integral';
    if (digitsOnly === '2' || clean.includes('bico') || clean.includes('horas vagas')) {
      workRegime = 'bico';
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        workRegime,
        onboardingStep: 3
      }
    });

    return `Fechado! Já salvei aqui. 📝\n\n2️⃣ **Onde você quer que eu te ajude a organizar a grana?**\n\n**1** - Só o dinheiro do trampo (Uber, 99, gastos do carro...) 🚗\n**2** - Só as minhas contas de casa (aluguel, mercado, luz...) 🏠\n**3** - De tudo um pouco (Tanto o trampo quanto a minha casa) 📊`;
  }

  // ────────────────────────────────────────────────────
  // Step 3: Recebe Escopo -> Pergunta 3: Plataformas (ABERTA)
  // ────────────────────────────────────────────────────
  private static async handleStep3(userId: string, messageContent: string): Promise<string> {
    const clean = messageContent.toLowerCase().trim().replace(/[\.\!\?\,=]/g, '');
    const digitsOnly = clean.replace(/\D/g, '');

    let controlScope = 'ambos';
    if (digitsOnly === '1') {
      controlScope = 'app';
    } else if (digitsOnly === '2') {
      controlScope = 'casa';
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        controlScope,
        onboardingStep: 4
      }
    });

    return `Combinado! Tudo anotado por aqui. 😉\n\n3️⃣ **Me conta agora: em quais aplicativos você costuma rodar no dia a dia?**\n_(Pode escrever o nome deles pra mim: Uber, 99, iFood, InDrive... os que você usar!)_ 📱`;
  }

  // ────────────────────────────────────────────────────
  // Step 4: Recebe Plataformas -> Pergunta 4: Meta Mensal (ABERTA)
  // ────────────────────────────────────────────────────
  private static async handleStep4(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';

    const systemInstruction = `
      Você é o ${copilotName}, um Co-piloto Inteligente. Analise a resposta do motorista e extraia as plataformas/apps que ele usa.
      Retorne:
      1. platforms: Uma string com as plataformas separadas por vírgula (ex: "Uber, 99"). Se ele disse algo genérico como "todos", retorne "Uber, 99, iFood".
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        platforms: { type: 'STRING' }
      },
      required: ['platforms']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);
    const platforms = aiRes.success && aiRes.data?.platforms ? aiRes.data.platforms : messageContent;

    await prisma.user.update({
      where: { id: userId },
      data: {
        platforms,
        onboardingStep: 5
      }
    });

    return `Beleza, plataformas salvas na sua ficha! 📝📱\n\n4️⃣ **No final do mês, quanto de dinheiro você quer ver sobrando livre no seu bolso?**\n_(Me diz um valor aproximado em reais, ex: 5000, 6000...)_ 💰`;
  }

  // ────────────────────────────────────────────────────
  // Step 5: Recebe Meta Mensal -> Pergunta 5: Dias por Semana (CÁLCULO)
  // ────────────────────────────────────────────────────
  private static async handleStep5(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';

    const systemInstruction = `
      Analise o texto e extraia o valor numérico da meta financeira mensal desejada em reais.
      Retorne apenas o número decimal (ex: 5000.00). Se não mencionado ou confuso, retorne 5000.00.
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        monthly_goal: { type: 'NUMBER' }
      },
      required: ['monthly_goal']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);
    const monthlyGoal = aiRes.success && aiRes.data?.monthly_goal ? aiRes.data.monthly_goal : 5000.00;

    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyGoal,
        onboardingStep: 51 // Próxima é receber dias e calcular
      }
    });

    return `Meta salva! Agora, para eu calcular direitinho a sua meta diária de faturamento:\n\n5️⃣ **Quantos dias por semana você costuma rodar no trecho?**\n_(Responda digitando apenas o número de dias de **1** a **7**)_ 🗓️`;
  }

  // ────────────────────────────────────────────────────
  // Step 51: Recebe Dias -> Calcula Meta Diária -> Pergunta Confirmação
  // ────────────────────────────────────────────────────
  private static async handleStep5Confirmation(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const clean = messageContent.trim();
    const digitsOnly = clean.replace(/\D/g, '');
    let diasRoda = parseInt(digitsOnly);

    if (isNaN(diasRoda) || diasRoda < 1 || diasRoda > 7) {
      diasRoda = 6; // Padrão seguro
    }

    const monthlyGoalVal = user.monthlyGoal ? Number(user.monthlyGoal) : 5000.00;
    
    // Cálculo: Meta Diária = Meta Mensal / (dias por semana * 4.33 semanas por mês)
    const dailyGoalVal = Math.round(monthlyGoalVal / (diasRoda * 4.333));

    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyGoal: dailyGoalVal,
        onboardingStep: 6 // Avança para o Veículo após essa confirmação
      }
    });

    const monthlyFormatted = monthlyGoalVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const dailyFormatted = dailyGoalVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return `Contas feitas aqui, parceiro! 📊\n\nPara fazer sobrar **${monthlyFormatted}** livre no final do mês rodando **${diasRoda} dias** por semana, o seu objetivo diário vai ser fazer em média **${dailyFormatted}** na tela dos aplicativos.\n\nFicou bom assim? Me responde com o número:\n\n**1** - Ficou top, é isso mesmo! 👍\n**2** - Não, quero corrigir os valores 👎`;
  }

  // ────────────────────────────────────────────────────
  // Step 6: Recebe Confirmação de Metas -> Pergunta Veículo
  // ────────────────────────────────────────────────────
  private static async handleStep6(userId: string, messageContent: string): Promise<string> {
    const isConfirmed = await this.checkYesOrNo(messageContent);

    if (isConfirmed) {
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingStep: 61 } // Step 61 será a confirmação do carro
      });
      return `Fechado! Objetivo traçado! 🎯🏁\n\nÚltima perguntinha do nosso cadastro:\n\n6️⃣ **Qual é o carro que a gente vai acelerar junto no trecho?**\n_(Me diz a marca, o modelo e o ano. Ex: Chevrolet Onix 2021, BYD Dolphin 2024)_ 🚗`;
    } else {
      // Se não confirmou, volta para o Step 5 (perguntar meta mensal novamente)
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingStep: 5 }
      });
      return `Sem problemas! Vamos recalcular então. Me conta de novo: **quanto você quer ver sobrando no bolso no final do mês?** 💰`;
    }
  }

  // ────────────────────────────────────────────────────
  // Step 61: Recebe Veículo -> Pergunta confirmação
  // ────────────────────────────────────────────────────
  private static async handleStep6Confirmation(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';

    const systemInstruction = `
      Você é um motor de extração de dados em JSON.
      O motorista informou o veículo dele. Sua tarefa:
      1. is_electric: Identifique se o veículo é elétrico/híbrido (true) ou combustão/gás (false).
      2. vehicle_summary: Uma string curta com marca, modelo e ano formatados. Ex: "Chevrolet Onix 2021"
      3. feedback_humanizado: Uma breve classificação do tipo de carro em português. Ex: "hatch prático", "SUV confortável".
      Retorne o JSON.
    `;

    const jsonSchema = {
      type: 'OBJECT',
      properties: {
        is_electric: { type: 'BOOLEAN' },
        vehicle_summary: { type: 'STRING' },
        feedback_humanizado: { type: 'STRING' }
      },
      required: ['is_electric', 'vehicle_summary', 'feedback_humanizado']
    };

    const aiRes = await AIService.executeStructuredTask(systemInstruction, messageContent, jsonSchema);

    const updateData: any = {
      onboardingStep: 7 // Vai para a finalização
    };

    let vehicleSummary = messageContent;
    let feedback = 'Baita escolha para encarar o trecho!';

    if (aiRes.success && aiRes.data) {
      vehicleSummary = aiRes.data.vehicle_summary || messageContent;
      updateData.vehicleInfo = vehicleSummary;
      updateData.isDriver = !aiRes.data.is_electric; // Guarda se é elétrico
      feedback = `Baita escolha! Um ${aiRes.data.feedback_humanizado || 'carro'} excelente para o dia a dia.`;
    } else {
      updateData.vehicleInfo = messageContent;
    }

    await prisma.user.update({ where: { id: userId }, data: updateData });

    return `${feedback} Entendi que a gente vai rodar em um *${vehicleSummary}*.\n\nConfirma para mim:\n\n**1** - Esse é o meu carro mesmo 👍\n**2** - Não, digitei errado e quero corrigir 👎`;
  }

  // ────────────────────────────────────────────────────
  // Step 7: Processa confirmação do veículo e finaliza
  // ────────────────────────────────────────────────────
  private static async handleStep6ConfirmationProcess(userId: string, messageContent: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const copilotName = user?.copilotName || 'Co-piloto';
    const article = this.getArticle(copilotName);
    const isElectric = user?.isDriver === false;

    const isConfirmed = await this.checkYesOrNo(messageContent);

    if (isConfirmed) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          onboardingStep: 8,
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
        data: { onboardingStep: 61 } // Volta para a pergunta de veículo
      });
      return `Sem problemas, meu erro! Me diz de novo então: **qual a marca, modelo e ano do seu carro?**`;
    }
  }

  // Corrigindo mapeamento final do Step 7 no processMessage
  public static async processMessageExtended(userId: string, step: number, messageContent: string): Promise<string> {
    if (step === 7) {
      return await this.handleStep6ConfirmationProcess(userId, messageContent);
    }
    return '';
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
