import { Router } from 'express';
import { transcribeAudio } from '../../controllers/ai.controller';

const router = Router();

// POST /api/v1/ai/transcribe - Transcreve um áudio a partir de uma URL pública
router.post('/transcribe', transcribeAudio);

export default router;
