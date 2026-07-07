import { Router } from 'express';
import { createTransaction, getTransactionsByUserId } from '../../transactions/controller';

const router = Router();

// POST /api/v1/transactions - Criação de lançamento financeiro
router.post('/', createTransaction);

// GET /api/v1/transactions/user/:userId - Histórico de lançamentos por ID de usuário
router.get('/user/:userId', getTransactionsByUserId);

export default router;
