/**
 * Normaliza e valida um número de WhatsApp.
 * Remove todos os caracteres não numéricos e garante o prefixo DDI do Brasil (55) se necessário.
 * Lança um erro explicativo caso a validação falhe.
 */
export const normalizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') {
    throw new Error('O número de telefone deve ser uma string válida.');
  }

  // Remove tudo que não for dígito
  const cleaned = phone.replace(/\D/g, '');

  // Validação de tamanho (números brasileiros com DDI variam de 12 a 13 dígitos; sem DDI variam de 10 a 11)
  if (cleaned.length < 10 || cleaned.length > 15) {
    throw new Error('Telefone com quantidade de dígitos inválida.');
  }

  // Se não possuir o prefixo do país (55) e tiver tamanho de DDD + número (10 ou 11 dígitos)
  if (!cleaned.startsWith('55') && (cleaned.length === 10 || cleaned.length === 11)) {
    return '55' + cleaned;
  }

  return cleaned;
};
