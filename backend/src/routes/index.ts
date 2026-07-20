import { Router } from 'express';
import { getRoot } from '../controllers/root.controller';
import { getHealth } from '../controllers/health.controller';
import internalUsersRouter from './internal/users';
import internalTransactionsRouter from './internal/transactions';
import internalWebhooksRouter from './internal/webhooks';
import internalOnboardingRouter from './internal/onboarding';
import internalAiRouter from './internal/ai';
import authRouter from './auth.routes';

const router = Router();

router.get('/', getRoot);
router.get('/health', getHealth);
router.get('/api/v1/health', getHealth);

// Vincula os domínios da API
router.use('/api/v1/auth', authRouter);
router.use('/api/v1/users', internalUsersRouter);
router.use('/api/v1/transactions', internalTransactionsRouter);
router.use('/api/v1/webhooks', internalWebhooksRouter);
router.use('/api/v1/onboarding', internalOnboardingRouter);
router.use('/api/v1/ai', internalAiRouter);

export default router;
