import { Router } from 'express';
import { handleEvolutionWebhook } from '../../users/controller';

const router = Router();

// POST /api/v1/webhooks/evolution - Recebe webhook de status da Evolution API
router.post('/evolution', handleEvolutionWebhook);

export default router;
