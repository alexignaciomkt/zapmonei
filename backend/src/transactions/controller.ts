import { Request, Response } from 'express';
import prisma from '../config/database';
import { toTransactionDTO } from './mapper';
import { TRANSACTION_TYPES } from '../constants/transaction-types';
import { Decimal } from '@prisma/client/runtime/library';
import logger from '../config/logger';

// 1. Criar Lançamento Financeiro (POST /api/v1/transactions)
export const createTransaction = async (req: Request, res: Response) => {
  const { user_id, description, amount, type, date } = req.body;

  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_USER_ID', message: 'user_id é obrigatório e deve ser uma string.' }
    });
  }

  if (amount === undefined || typeof amount !== 'number' || amount === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_AMOUNT', message: 'amount é obrigatório e deve ser um número diferente de zero.' }
    });
  }

  if (!type || !Object.values(TRANSACTION_TYPES).includes(type)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_TYPE', message: 'type deve ser "ganho" ou "gasto".' }
    });
  }

  try {
    // Valida se o motorista existe no banco para manter integridade
    const userExists = await prisma.user.findUnique({
      where: { id: user_id }
    });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }
      });
    }

    // CTO Note: Força o amount a ser salvo no banco como um valor absoluto positivo
    const valorSalvar = new Decimal(Math.abs(amount));

    const transaction = await prisma.transaction.create({
      data: {
        userId: user_id,
        tipo: type,
        valor: valorSalvar,
        descricao: description || null,
        ocorrenciaEm: date ? new Date(date) : new Date()
      }
    });

    logger.info(`Transaction created: ${transaction.id} for user ${user_id}`);

    return res.status(201).json({
      success: true,
      data: toTransactionDTO(transaction)
    });

  } catch (error: any) {
    logger.error(`Error creating transaction: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro interno ao salvar lançamento financeiro.' }
    });
  }
};

// 2. Obter Histórico de Transações de um Usuário (GET /api/v1/transactions/user/:userId)
export const getTransactionsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    // Valida se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }
      });
    }

    // Busca lançamentos ordenados pelo mais recente
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { ocorrenciaEm: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: transactions.map(toTransactionDTO)
    });

  } catch (error: any) {
    logger.error(`Error fetching transactions for user ${userId}: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro interno no banco de dados.' }
    });
  }
};
