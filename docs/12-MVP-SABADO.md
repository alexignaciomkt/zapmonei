# MVP - Objetivo Sábado

## Missão
Até sábado o ZapMonei deverá ser capaz de realizar o fluxo completo abaixo utilizando dados reais.

## Fluxo Principal
Cliente compra o plano
↓
Asaas confirma pagamento
↓
Workflow M02 recebe PAYMENT_CONFIRMED
↓
Consulta pedido no WooCommerce
↓
Obtém:
* Nome
* Telefone
* Email
↓
Cria (ou atualiza) usuário
↓
Cria instância Evolution
↓
Gera Pairing Code
↓
Kathy envia mensagem
↓
Cliente conecta WhatsApp
↓
Cliente envia:
"Ganhei 80 na Uber"
↓
Workflow Receber Mensagens
↓
Decision Engine
↓
Motor Financeiro
↓
Gemini Flash
↓
JSON Estruturado
↓
Grava transaction
↓
Resposta ao usuário
↓
Cliente envia
"Gastei 30 de gasolina"
↓
Repete processo
↓
Cliente envia
"Resumo"
↓
Sistema calcula
↓
Resposta via WhatsApp

## Escopo do MVP

### Incluído
* Compra
* Ativação
* Pairing
* Recebimento de mensagens
* Registro de ganhos
* Registro de gastos
* Consulta de resumo
* Dashboard simples

### Fora do MVP
Não desenvolver agora:
* OCR
* Áudio
* Memória
* Agente Cognitivo
* pgvector
* Gamificação
* Indicações
* Dashboard avançado
* Relatórios semanais
* Multi tenant
* API pública
* Múltiplos módulos

## Regra do MVP
* Sempre escolher a solução mais simples.
* Se existir uma solução pronta funcionando hoje, reutilizar.
* Nunca reescrever um fluxo apenas por questões estéticas.

## Critérios de Aceite
O MVP será considerado pronto quando o fluxo abaixo funcionar em ambiente real:
* ✅ Compra aprovada
* ✅ Usuário criado
* ✅ Pairing enviado
* ✅ WhatsApp conectado
* ✅ Ganho registrado
* ✅ Gasto registrado
* ✅ Resumo retornado

Tudo utilizando dados reais.

## Filosofia
A prioridade absoluta é colocar o primeiro motorista utilizando o ZapMonei.
Toda melhoria futura será construída sobre um sistema funcionando.

## Plano de Execução

### Fase 1 - Ativação
**Objetivo:** Fazer um pagamento criar um usuário totalmente funcional.

**Checklist:**
* [ ] Asaas envia `PAYMENT_CONFIRMED`
* [ ] M02 recebe webhook
* [ ] Consulta WooCommerce
* [ ] Cria usuário
* [ ] Cria instância Evolution
* [ ] Gera Pairing Code
* [ ] Kathy envia mensagem inicial

> [!IMPORTANT]
> Não seguir para a Fase 2 enquanto esta fase não estiver validada.

### Fase 2 - Conexão
**Objetivo:** Garantir que o WhatsApp esteja conectado.

**Checklist:**
* [ ] Cliente conecta
* [ ] Evolution envia evento `CONNECTED`
* [ ] Sistema salva status
* [ ] Kathy envia mensagem de boas-vindas

### Fase 3 - Registro Financeiro
**Objetivo:** Registrar ganhos e gastos.

**Checklist:**
* [ ] Receber mensagem
* [ ] Decision Engine
* [ ] Gemini
* [ ] JSON válido
* [ ] INSERT transaction
* [ ] Resposta ao usuário

### Fase 4 - Consulta
**Objetivo:** Responder consultas simples.

**Checklist:**
* [ ] Resumo
* [ ] Hoje
* [ ] Semana

## Regras de Desenvolvimento
* Nunca desenvolver duas fases ao mesmo tempo.
* Uma fase só inicia após a anterior estar funcionando em ambiente real.
* **Validação Prática:** Nunca avançar porque "o código parece certo". Só avançar porque você testou no WhatsApp. Ou seja, cada fase termina com um teste real:
  * Compra real ✅
  * Asaas real ✅
  * Evolution real ✅
  * WhatsApp real ✅
  * Gemini real ✅
  * PostgreSQL real ✅
* Nada de "deve funcionar". A partir de agora, tudo será validado na prática.

