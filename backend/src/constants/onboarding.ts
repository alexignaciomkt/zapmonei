export const ONBOARDING = {
  PENDING_KATHY: 'pending_kathy',           // Inicial, aguardando contato da Kathy
  WAITING_CONNECTION: 'waiting_connection', // Kathy enviou QR/Pairing, aguardando conexão
  CONNECTED: 'connected',                   // Instância Evolution conectada com sucesso
  PENDING_AGENT: 'pending_agent',           // Apresentado o Agente, aguardando onboarding financeiro
  PENDING_COPILOT: 'pending_copilot',       // Apresentado o Co-piloto, aguardando onboarding financeiro
  COPILOT_ONBOARDING: 'copilot_onboarding', // Em andamento no onboarding do co-piloto
  ACTIVE: 'active',                         // Onboarding concluído, usando o assistente
  BLOCKED: 'blocked'                        // Instância desconectada ou inadimplência
} as const;

export type OnboardingStatus = typeof ONBOARDING[keyof typeof ONBOARDING];
