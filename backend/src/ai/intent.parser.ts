import axios from 'axios';
import geminiConfig from '../integrations/gemini';
import logger from '../config/logger';

export interface ParsedIntent {
  intent: 'REGISTER_TRANSACTION' | 'CHITCHAT' | 'ASK_BALANCE';
  data: {
    description?: string | null;
    amount?: number | null;
    type?: 'ganho' | 'gasto' | null;
  } | null;
}

export class IntentParser {
  /**
   * Envia a mensagem informal do motorista ao Google Gemini usando Structured Outputs (JSON Mode)
   * para obter a classificação de intenção e extração das entidades.
   */
  public static async parse(message: string): Promise<ParsedIntent> {
    const apiKey = geminiConfig.apiKey;
    const model = geminiConfig.model;
    
    if (!apiKey) {
      logger.warn('GOOGLE_GEMINI_API_KEY não configurada. Utilizando fallback CHITCHAT.');
      return { intent: 'CHITCHAT', data: null };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemPrompt = `Você é o analisador inteligente de linguagem natural do assistente financeiro ZapMonei. 
Sua tarefa é analisar a mensagem informal recebida do motorista de aplicativo e classificar em uma das 3 intenções permitidas:
1. "REGISTER_TRANSACTION": O usuário quer registrar uma entrada financeira (ganhos, corridas, faturamento, Uber, 99) ou uma despesa/saída (combustível, gasolina, almoço, mecânico).
2. "ASK_BALANCE": O usuário quer saber o saldo acumulado, resumo financeiro do dia/período ou extrato de lançamentos.
3. "CHITCHAT": Saudação simples (olá, bom dia), dúvidas gerais de uso ou mensagens que não correspondam a finanças.

Se a intenção for REGISTER_TRANSACTION, você DEVE extrair as entidades no campo "data":
- "description": Breve descrição do item (ex: "Posto Shell", "Corrida Uber", "Lanche").
- "amount": Valor numérico positivo correspondente (ex: 80.00). Nunca negativo.
- "type": "ganho" (se for entrada/receita) ou "gasto" (se for saída/despesa).

Você DEVE responder estritamente um JSON válido no formato:
{
  "intent": "REGISTER_TRANSACTION" | "CHITCHAT" | "ASK_BALANCE",
  "data": {
    "description": string | null,
    "amount": number | null,
    "type": "ganho" | "gasto" | null
  }
}
`;

    try {
      const response = await axios.post(
        url,
        {
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                { text: `Mensagem do Motorista: "${message}"` }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const candidates = response.data?.candidates;
      const textContent = candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error('Retorno vazio do Google Gemini.');
      }

      // Converte a resposta em JSON estruturado
      const parsed: ParsedIntent = JSON.parse(textContent.trim());
      logger.info(`Gemini parsing completed. Intent identified: ${parsed.intent}`);
      return parsed;

    } catch (error: any) {
      logger.error(`Error parsing message with Gemini: ${error.message}`);
      // Fallback robusto e resiliente para não quebrar a aplicação
      return {
        intent: 'CHITCHAT',
        data: null
      };
    }
  }
}
