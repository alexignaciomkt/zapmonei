export const PLANS = {
  PILOTO: 'piloto',
  PRO: 'pro',
  ELITE: 'elite',
  EMBAIXADOR: 'embaixador'
} as const;

export type PlanSlug = typeof PLANS[keyof typeof PLANS];
