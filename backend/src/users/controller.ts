import { Request, Response } from 'express';
import prisma from '../config/database';
import { normalizePhone } from '../lib/phone';
import { ONBOARDING } from '../constants/onboarding';
import { toUserDTO } from './mapper';
import logger from '../config/logger';
import bcrypt from 'bcryptjs';

// 1. Criar ou Atualizar Usuário (POST /api/v1/users)
export const createUser = async (req: Request, res: Response) => {
  const { name, whatsapp_number, email, plan } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_NAME', message: 'Nome é obrigatório e deve ser uma string.' }
    });
  }

  if (!whatsapp_number || typeof whatsapp_number !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PHONE', message: 'whatsapp_number é obrigatório e deve ser uma string.' }
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

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_EMAIL', message: 'E-mail inválido.' }
    });
  }

  if (!plan || typeof plan !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PLAN', message: 'Plano é obrigatório.' }
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { whatsappNumber: normalizedPhone }
    });

    const user = await prisma.user.upsert({
      where: { whatsappNumber: normalizedPhone },
      update: {
        name,
        email,
        planSlug: plan
      },
      create: {
        whatsappNumber: normalizedPhone,
        name,
        email,
        planSlug: plan,
        onboardingStatus: ONBOARDING.PENDING_KATHY,
        onboardingStep: 0,
        isDriver: true
      }
    });

    const isCreated = !existingUser;
    logger.info(`User ${isCreated ? 'created' : 'updated'}: ${user.id} (${normalizedPhone})`);

    return res.status(isCreated ? 201 : 200).json({
      success: true,
      data: toUserDTO(user)
    });

  } catch (error: any) {
    logger.error(`Error upserting user: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro interno no banco de dados.' }
    });
  }
};

// 2. Buscar Usuário por ID (GET /api/v1/users/:id)
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: toUserDTO(user)
    });

  } catch (error: any) {
    logger.error(`Error fetching user by ID: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro interno no banco de dados.' }
    });
  }
};

// 3. Buscar Usuário por Telefone (GET /api/v1/users?phone=...)
export const getUserByPhone = async (req: Request, res: Response) => {
  const { phone } = req.query;

  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Parâmetro query ?phone é obrigatório nesta rota.' }
    });
  }

  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhone(phone);
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PHONE', message: err.message || 'Número de telefone inválido.' }
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { whatsappNumber: normalizedPhone }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: toUserDTO(user)
    });

  } catch (error: any) {
    logger.error(`Error fetching user by phone: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro interno no banco de dados.' }
    });
  }
};

// 4. Atualizar Dados do Usuário (PATCH /api/v1/users/:id)
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, plan, whatsapp_instance_name, whatsapp_instance_token, onboarding_step, onboarding_status, whatsapp_support_number, tutorial_visto, password, copilot_name, work_regime, financial_goal, vehicle_info } = req.body;

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_NAME', message: 'Nome inválido.' }
    });
  }

  if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_EMAIL', message: 'E-mail inválido.' }
    });
  }

  if (plan !== undefined && (typeof plan !== 'string' || !plan.trim())) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PLAN', message: 'Plano inválido.' }
    });
  }

  if (whatsapp_instance_name !== undefined && (typeof whatsapp_instance_name !== 'string' || !whatsapp_instance_name.trim())) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INSTANCE_NAME', message: 'Nome da instância inválido.' }
    });
  }

  if (whatsapp_instance_token !== undefined && (typeof whatsapp_instance_token !== 'string' || !whatsapp_instance_token.trim())) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INSTANCE_TOKEN', message: 'Token da instância inválido.' }
    });
  }

  if (onboarding_step !== undefined && (typeof onboarding_step !== 'number' || !Number.isInteger(onboarding_step))) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ONBOARDING_STEP', message: 'onboarding_step deve ser um número inteiro.' }
    });
  }

  if (onboarding_status !== undefined) {
    const validStatuses = Object.values(ONBOARDING) as string[];
    if (!validStatuses.includes(onboarding_status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ONBOARDING_STATUS', message: 'onboarding_status inválido.' }
      });
    }
  }

  if (whatsapp_support_number !== undefined && whatsapp_support_number !== null && typeof whatsapp_support_number !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_SUPPORT_NUMBER', message: 'whatsapp_support_number deve ser uma string ou null.' }
    });
  }

  if (tutorial_visto !== undefined && typeof tutorial_visto !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_TUTORIAL_VISTO', message: 'tutorial_visto deve ser um booleano.' }
    });
  }

  if (password !== undefined && (typeof password !== 'string' || !password.trim())) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PASSWORD', message: 'Senha inválida.' }
    });
  }

  if (copilot_name !== undefined && copilot_name !== null && typeof copilot_name !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_COPILOT_NAME', message: 'copilot_name deve ser uma string ou null.' }
    });
  }

  if (work_regime !== undefined && work_regime !== null && typeof work_regime !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_WORK_REGIME', message: 'work_regime deve ser uma string ou null.' }
    });
  }

  if (financial_goal !== undefined && financial_goal !== null && typeof financial_goal !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_FINANCIAL_GOAL', message: 'financial_goal deve ser uma string ou null.' }
    });
  }

  if (vehicle_info !== undefined && vehicle_info !== null && typeof vehicle_info !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_VEHICLE_INFO', message: 'vehicle_info deve ser uma string ou null.' }
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }
      });
    }

    let passwordHash: string | undefined = undefined;
    if (password !== undefined) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        email: email !== undefined ? email : undefined,
        planSlug: plan !== undefined ? plan : undefined,
        whatsappInstanceName: whatsapp_instance_name !== undefined ? whatsapp_instance_name : undefined,
        whatsappInstanceToken: whatsapp_instance_token !== undefined ? whatsapp_instance_token : undefined,
        onboardingStep: onboarding_step !== undefined ? onboarding_step : undefined,
        onboardingStatus: onboarding_status !== undefined ? onboarding_status : undefined,
        whatsappSupportNumber: whatsapp_support_number !== undefined ? whatsapp_support_number : undefined,
        tutorialVisto: tutorial_visto !== undefined ? tutorial_visto : undefined,
        password: passwordHash !== undefined ? passwordHash : undefined,
        copilotName: copilot_name !== undefined ? copilot_name : undefined,
        workRegime: work_regime !== undefined ? work_regime : undefined,
        financialGoal: financial_goal !== undefined ? financial_goal : undefined,
        vehicleInfo: vehicle_info !== undefined ? vehicle_info : undefined
      }
    });

    logger.info(`User updated via PATCH: ${user.id}`);

    return res.status(200).json({
      success: true,
      data: toUserDTO(user)
    });

  } catch (error: any) {
    logger.error(`Error updating user: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro interno no banco de dados.' }
    });
  }
};

// 5. Atualizar Status de Onboarding (PATCH /api/v1/users/:id/status)
export const updateUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { onboarding_status } = req.body;

  const validStatuses = Object.values(ONBOARDING) as string[];
  if (!onboarding_status || !validStatuses.includes(onboarding_status)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_STATUS', message: 'Status de onboarding inválido.' }
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' }
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        onboardingStatus: onboarding_status
      }
    });

    logger.info(`User onboarding status updated via PATCH: ${user.id} -> ${onboarding_status}`);

    return res.status(200).json({
      success: true,
      data: toUserDTO(user)
    });

  } catch (error: any) {
    logger.error(`Error updating user status: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Erro interno no banco de dados.' }
    });
  }
};

// 6. Webhook da Evolution API (POST /api/v1/webhooks/evolution)
export const handleEvolutionWebhook = async (req: Request, res: Response) => {
  const { event, instance, data } = req.body;

  logger.info(`Received Evolution webhook event: ${event} for instance: ${instance}`);

  if (event === 'connection.update') {
    const isConnected = data?.status === 'CONNECTED' || data?.state === 'CONNECTED' || data?.status === 'connected' || data?.state === 'connected';

    if (isConnected) {
      logger.info(`Evolution instance connected: ${instance}`);
      if (!instance) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Instance name is missing in payload.' }
        });
      }

      try {
        const user = await prisma.user.findFirst({
          where: { whatsappInstanceName: instance }
        });

        if (!user) {
          logger.warn(`No user found for instance: ${instance}`);
          return res.status(404).json({
            success: false,
            error: { code: 'USER_NOT_FOUND', message: 'Usuário não encontrado para esta instância.' }
          });
        }

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            onboardingStatus: ONBOARDING.CONNECTED
          }
        });

        logger.info(`User onboarding status updated to connected: ${updatedUser.id}`);

        return res.status(200).json({
          success: true,
          data: toUserDTO(updatedUser)
        });

      } catch (error: any) {
        logger.error(`Error updating user status via webhook: ${error.message}`);
        return res.status(500).json({
          success: false,
          error: { code: 'DATABASE_ERROR', message: 'Erro interno no banco de dados.' }
        });
      }
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Webhook received but not processed'
  });
};

