import redis from '../config/redis';
import logger from '../config/logger';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export class ContextBuilder {
  private static getKey(userId: string): string {
    return `chat_context:${userId}`;
  }

  /**
   * CTO Note - Resiliência do Redis:
   * Recupera o histórico recente de mensagens do motorista do Redis.
   * Se o Redis estiver offline ou falhar, o método captura a exceção,
   * loga o aviso e retorna um array vazio [] para permitir que o fluxo prossiga sem histórico.
   */
  public static async getRecentContext(userId: string): Promise<ChatMessage[]> {
    try {
      const data = await redis.get(this.getKey(userId));
      if (!data) return [];
      return JSON.parse(data);
    } catch (error: any) {
      // Degradação elegante: Loga o aviso e retorna histórico vazio
      logger.warn(`Redis is offline or failed during getRecentContext: ${error.message}`);
      return [];
    }
  }

  /**
   * CTO Note - Resiliência do Redis:
   * Adiciona uma mensagem ao histórico do usuário no Redis com expiração automática de 20 minutos.
   * Se o Redis falhar, captura a exceção e loga o aviso, permitindo a continuidade do fluxo.
   */
  public static async addMessageToContext(userId: string, role: 'user' | 'model', text: string): Promise<void> {
    try {
      const context = await this.getRecentContext(userId);
      context.push({ role, text });

      // Mantém apenas as últimas 10 interações para manter o contexto enxuto
      const limitedContext = context.slice(-10);

      await redis.set(
        this.getKey(userId),
        JSON.stringify(limitedContext),
        'EX',
        1200 // Expira em 20 minutos (1200 segundos)
      );
    } catch (error: any) {
      logger.warn(`Redis is offline or failed during addMessageToContext: ${error.message}`);
    }
  }

  /**
   * CTO Note - Resiliência do Redis:
   * Limpa o contexto de conversa armazenado do usuário.
   */
  public static async clearTimeoutContext(userId: string): Promise<void> {
    try {
      await redis.del(this.getKey(userId));
    } catch (error: any) {
      logger.warn(`Redis failed during clearTimeoutContext: ${error.message}`);
    }
  }
}
