import { Request, Response } from 'express';
import prisma from '../config/database';
import { normalizePhone } from '../lib/phone';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

export const login = async (req: Request, res: Response) => {
  const { whatsapp_number, password } = req.body;

  if (!whatsapp_number || typeof whatsapp_number !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PHONE', message: 'Número de WhatsApp é obrigatório.' }
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PASSWORD', message: 'Senha é obrigatória.' }
    });
  }

  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhone(whatsapp_number);
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PHONE', message: err.message || 'Número de WhatsApp inválido.' }
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { whatsappNumber: normalizedPhone }
    });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Número ou senha incorretos.' }
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Número ou senha incorretos.' }
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        whatsapp_number: user.whatsappNumber,
        nome: user.name || 'Motorista'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`User logged in: ${user.id} (${normalizedPhone})`);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          nome: user.name,
          whatsapp_number: user.whatsappNumber,
          email: user.email,
          onboarding_status: user.onboardingStatus,
          onboarding_step: user.onboardingStep
        }
      }
    });

  } catch (error: any) {
    logger.error(`Error during login: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno durante o processamento do login.' }
    });
  }
};
