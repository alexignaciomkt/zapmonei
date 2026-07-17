import { User } from '@prisma/client';

export interface UserDTO {
  id: string;
  name: string | null;
  whatsapp_number: string;
  plan: string | null;
  onboarding_status: string;
  onboarding_step: number;
  whatsapp_support_number: string | null;
  tutorial_visto: boolean;
  whatsapp_instance_name?: string | null;
  whatsapp_instance_token?: string | null;
  copilot_name?: string | null;
  work_regime?: string | null;
  financial_goal?: string | null;
  vehicle_info?: string | null;
  control_scope?: string | null;
  platforms?: string | null;
  daily_goal?: number | null;
}

/**
 * Converte o modelo User do banco de dados (Prisma Client) para um DTO formatado de resposta da API.
 * Isso garante que dados internos de infraestrutura (timestamps, chaves, etc.) não vazem nas respostas.
 */
export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    whatsapp_number: user.whatsappNumber,
    plan: user.planSlug,
    onboarding_status: user.onboardingStatus,
    onboarding_step: user.onboardingStep,
    whatsapp_support_number: user.whatsappSupportNumber,
    tutorial_visto: user.tutorialVisto,
    whatsapp_instance_name: user.whatsappInstanceName,
    whatsapp_instance_token: user.whatsappInstanceToken,
    copilot_name: user.copilotName,
    work_regime: user.workRegime,
    financial_goal: user.financialGoal,
    vehicle_info: user.vehicleInfo,
    control_scope: user.controlScope,
    platforms: user.platforms,
    daily_goal: user.dailyGoal ? Number(user.dailyGoal) : null
  };
}
