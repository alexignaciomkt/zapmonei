import { Transaction } from '@prisma/client';

export interface TransactionDTO {
  id: string;
  user_id: string;
  description: string | null;
  amount: number;
  type: string;
  date: Date;
}

/**
 * Converte o modelo Transaction do Prisma para um DTO formatado de resposta da API,
 * garantindo o encapsulamento e ocultando campos internos de infraestrutura.
 */
export function toTransactionDTO(transaction: Transaction): TransactionDTO {
  return {
    id: transaction.id,
    user_id: transaction.userId,
    description: transaction.descricao,
    amount: Number(transaction.valor),
    type: transaction.tipo,
    date: transaction.ocorrenciaEm
  };
}
