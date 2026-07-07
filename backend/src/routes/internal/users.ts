import { Router, Request, Response } from 'express';
import {
  createUser,
  getUserById,
  getUserByPhone,
  updateUser,
  updateUserStatus
} from '../../users/controller';

const router = Router();

// POST /api/v1/users - Cria/atualiza (upsert) motorista
router.post('/', createUser);

// GET /api/v1/users - Consulta motorista por telefone (via query ?phone=)
router.get('/', (req: Request, res: Response) => {
  if (req.query.phone) {
    return getUserByPhone(req, res);
  }
  return res.status(400).json({
    success: false,
    error: { code: 'BAD_REQUEST', message: 'Parâmetro query ?phone é obrigatório nesta rota.' }
  });
});

// GET /api/v1/users/:id - Consulta motorista por ID
router.get('/:id', getUserById);

// PATCH /api/v1/users/:id - Atualiza dados cadastrais
router.patch('/:id', updateUser);

// PATCH /api/v1/users/:id/status - Atualiza status de onboarding
router.patch('/:id/status', updateUserStatus);

export default router;
