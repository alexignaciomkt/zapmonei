# Fluxo de Onboarding do Usuário (ZapMonei)

## 1. Fase 1: Kathy (Infraestrutura)
A Kathy é a IA de boas-vindas. Seu objetivo é técnico.
*   **Ações:** Ajuda a conectar o WhatsApp, cria a instância na Evolution API, gera login/senha.
*   **Encerramento:** Kathy instrui o usuário: *"Sua conexão está pronta! Aguarde 5 minutos e mande um 'Oi' aqui mesmo para conhecer seu novo Agente de Finanças."*
*   **Trigger Técnico:** O fluxo da Kathy dispara um comando para a Evolution API vinculando a instância do usuário ao Webhook do fluxo principal.

## 2. Fase 2: O Agente Personalizado (Negócio)
O usuário manda "Oi" e desperta seu Agente pessoal (Fluxo: `ZapMonei: Entrada de WhatsApp`).

### Sequência de Onboarding do Agente:
1.  **Batismo:** "Olá! Eu serei seu assistente financeiro. Como você quer me chamar?" (Salva em `agent_custom_name`).
2.  **Objetivo:** "Você usará o ZapMonei para controle Profissional, Pessoal ou ambos?" (Salva em `control_type`).
3.  **Perfil:** "Você trabalha como motorista de aplicativo?" (Salva em `is_driver`).
4.  **Configuração de KPIs:** (Se motorista) Pergunta sobre meta mensal e custos.

## 3. Lógica de Personalização do Dashboard
Os dados coletados pelo Agente ativam/desativam componentes no Frontend:

| Dado Coletado | Impacto no Dashboard |
|---------------|----------------------|
| `is_driver = true` | Ativa cards de Combustível, Manutenção e Lucro por KM |
| `control_type = 'personal'` | Habilita categorias de lazer, casa e família |
| `agent_custom_name` | Altera o título do assistente no chat do Dashboard |

## 4. Estrutura de Dados (Tabela `users`)
Novas colunas necessárias para a "Memória da IA":
*   `onboarding_status`: `pending_kathy` | `kathy_done` | `agent_started` | `completed`
*   `onboarding_step`: Inteiro para controle de posição no chat.
*   `agent_custom_name`: String.
*   `control_type`: String/Enum.
*   `is_driver`: Boolean.
*   `user_metadata`: JSONB para KPIs adicionais.

## 5. Conexão Técnica Crítica
A transição entre Kathy e Agente exige que a instância do usuário seja reconfigurada via API:
*   **Endpoint:** `POST /webhook/set` (Evolution API).
*   **Webhook URL:** `https://n8n.dominio.com.br/webhook/zapmonei-entrada`
*   **Segurança:** A mensagem "Oi" deve vir da instância do usuário para ser processada pelo fluxo de entrada.

