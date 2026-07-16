import { Router } from 'express';
import { handleOnboardingMessage } from '../../controllers/onboarding.controller';

const router = Router();

// POST /api/v1/onboarding/message - Processa resposta do onboarding
router.post('/message', handleOnboardingMessage);

export default router;
