export const TRANSACTION_TYPES = {
  GANHO: 'ganho',
  GASTO: 'gasto'
} as const;

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
