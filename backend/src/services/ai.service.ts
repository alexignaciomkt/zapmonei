import axios from 'axios';
import logger from '../config/logger';

export interface AIResponse {
  success: boolean;
  data: any;
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

export class AIService {
  private static getApiKey(): string {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    if (!key) {
      logger.error('Neither GEMINI_API_KEY nor GOOGLE_GEMINI_API_KEY is defined in environment variables.');
      throw new Error('Chave de API do Gemini não configurada.');
    }
    return key;
  }

  private static getModel(): string {
    return process.env.AI_PRIMARY_MODEL || 'gemini-3.5-flash';
  }

  /**
   * Executa uma chamada estruturada de IA (retorna JSON)
   */
  public static async executeStructuredTask(
    systemInstruction: string,
    userPrompt: string,
    jsonSchema?: object
  ): Promise<AIResponse> {
    const apiKey = this.getApiKey();
    const model = this.getModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    if (jsonSchema) {
      requestBody.generationConfig.responseSchema = jsonSchema;
    }

    try {
      const startTime = Date.now();
      const response = await axios.post(url, requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });
      const duration = Date.now() - startTime;

      const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const usageMetadata = response.data?.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || 0;
      const candidatesTokens = usageMetadata.candidatesTokenCount || 0;

      // Estimativa simples de custo (com base em valores médios de mercado de tokens por milhão do Gemini 1.5 Flash)
      // Entrada: $0.075 / M, Saída: $0.30 / M
      const cost = (promptTokens * 0.075 + candidatesTokens * 0.30) / 1000000;

      logger.info(
        `AI call completed successfully in ${duration}ms. Tokens: In=${promptTokens}, Out=${candidatesTokens}. Cost: $${cost.toFixed(6)}`
      );

      let parsedData = {};
      if (candidateText) {
        try {
          parsedData = JSON.parse(candidateText.trim());
        } catch (e) {
          logger.error('Failed to parse AI JSON response: ' + candidateText);
          throw new Error('Resposta da IA inválida ou malformada.');
        }
      }

      return {
        success: true,
        data: parsedData,
        modelUsed: model,
        inputTokens: promptTokens,
        outputTokens: candidatesTokens,
        estimatedCost: cost
      };
    } catch (error: any) {
      logger.error(`Error in AI Service execution: ${error.message}`);
      if (error.response?.data) {
        logger.error(`Gemini API Error details: ${JSON.stringify(error.response.data)}`);
      }
      return {
        success: false,
        data: null,
        modelUsed: model,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0
      };
    }
  }
}
