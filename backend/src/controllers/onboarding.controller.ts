import { Request, Response } from 'express';
import { OnboardingService } from '../services/onboarding.service';
import prisma from '../config/database';
import logger from '../config/logger';

export const handleOnboardingMessage = async (req: Request, res: Response) => {
  const { whatsapp_number, user_id, message_content } = req.body;

  if ((!whatsapp_number && !user_id) || message_content === undefined) {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'whatsapp_number ou user_id e message_content são obrigatórios.' }
    });
  }

  try {
    let phone = whatsapp_number;

    let user = null;
    if (user_id && user_id !== 'undefined' && user_id !== '') {
      user = await prisma.user.findUnique({ where: { id: user_id } });
    }
    
    if (!user && phone) {
      user = await prisma.user.findUnique({ where: { whatsappNumber: phone } });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }
      });
    }

    const replyMessage = await OnboardingService.processMessage(user.whatsappNumber, message_content);

    return res.status(200).json({
      success: true,
      reply: replyMessage,
      whatsapp_number: user.whatsappNumber,
      whatsapp_instance_token: user.whatsappInstanceToken
    });
  } catch (error: any) {
    logger.error(`Error in handleOnboardingMessage: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Erro ao processar mensagem de onboarding.' }
    });
  }
};
