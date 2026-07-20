const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface UserProfile {
  id: string;
  nome: string;
  whatsapp_number: string;
  email: string;
  onboarding_status: string;
  onboarding_step: number;
}

export interface Transaction {
  id: string;
  tipo: string;
  valor: number;
  categoria: string;
  descricao: string;
  contexto: string;
  ocorrencia_em: string;
}

// Pure JS Cookie Helpers
export function getClientToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const name = 'zapmonei_token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return undefined;
}

export function setClientToken(token: string) {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
  const expires = 'expires=' + d.toUTCString();
  document.cookie = `zapmonei_token=${token};${expires};path=/;SameSite=Lax`;
}

export function removeClientToken() {
  if (typeof document === 'undefined') return;
  document.cookie = 'zapmonei_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export async function loginClient(whatsapp_number: string, password: string) {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ whatsapp_number, password }),
  });

  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message || 'Erro ao realizar login.');
  }

  const { token, user } = body.data;
  setClientToken(token);
  localStorage.setItem('zap_user', JSON.stringify(user));
  return { token, user };
}

export async function fetchTransactionsClient(userId: string): Promise<Transaction[]> {
  const token = getClientToken();
  const response = await fetch(`${API_URL}/api/v1/transactions/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message || 'Erro ao carregar transações.');
  }

  // Map backend model DTO structure to frontend expectation
  return (body.data || []).map((t: any) => ({
    id: t.id,
    tipo: t.type || t.tipo,
    valor: Number(t.amount !== undefined ? t.amount : t.valor),
    categoria: t.categoria || 'Outros',
    descricao: t.description || t.descricao || '',
    contexto: t.contexto || '',
    ocorrencia_em: t.date || t.ocorrenciaEm || t.createdAt,
  }));
}

export async function createTransactionClient(transaction: {
  tipo: string;
  valor: number;
  categoria?: string;
  descricao?: string;
  contexto?: string;
  ocorrencia_em?: string;
  user_id: string;
}) {
  const token = getClientToken();
  const response = await fetch(`${API_URL}/api/v1/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      user_id: transaction.user_id,
      amount: transaction.valor,
      type: transaction.tipo,
      description: transaction.descricao,
      date: transaction.ocorrencia_em,
    }),
  });

  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message || 'Erro ao criar transação.');
  }

  return body.data;
}

export async function fetchUserProfileByPhone(phone: string): Promise<UserProfile> {
  const token = getClientToken();
  const response = await fetch(`${API_URL}/api/v1/users?phone=${phone}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const body = await response.json();
  if (!response.ok || !body.success) {
    throw new Error(body.error?.message || 'Erro ao carregar perfil do usuário.');
  }

  return body.data;
}
