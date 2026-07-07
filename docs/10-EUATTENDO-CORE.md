# 🏛️ 10 - EuAttendo Core: A Constituição Técnica

Este documento constitui a **Lei Geral de Arquitetura e Engenharia** da plataforma EuAttendo. Toda e qualquer decisão de desenvolvimento, infraestrutura, modelagem de banco de dados ou integração de módulos deve obrigatoriamente estar em conformidade com as diretrizes e princípios estabelecidos nesta constituição.

---

## 1. Objetivo do Core

O EuAttendo Core é o backend único da plataforma EuAttendo.

Ele fornece todos os serviços compartilhados entre os módulos.

Nenhum módulo implementa autenticação, pagamentos, IA, WhatsApp ou integrações externas.

Todo módulo apenas consome as APIs do Core.

O Core deve ser completamente independente dos produtos.

---

## 2. Princípio Mestre

O Core nunca conhecerá regras de negócio.

Ele apenas disponibiliza serviços.

Exemplos de serviços disponibilizados:
*   Auth
*   Billing
*   WhatsApp
*   IA
*   Storage
*   Notificações
*   Usuários
*   Permissões
*   Logs
*   Auditoria

Quem conhece regra de negócio é sempre o módulo.

---

## 3. Princípios de Engenharia

Toda a arquitetura da plataforma deve seguir rigidamente os seguintes princípios:

1.  **Isolamento do Banco de Dados:** Módulos e frontends **nunca acessam o banco de dados diretamente**. Toda leitura e escrita deve ser requisitada através da API unificada do Core.
2.  **Comunicação Exclusiva por API:** Toda e qualquer interação entre componentes e módulos acontece via requisições HTTP REST padronizadas pelo Core.
3.  **Desacoplamento por Adapters:** Nenhuma integração externa (ex: Asaas, Evolution API, Gemini) deve ser exposta diretamente para a aplicação principal. Elas devem passar obrigatoriamente por uma camada de **Adapter (Wrapper)** que traduz os payloads para o padrão interno do Core. Isso permite trocar de gateway de pagamento ou de API de WhatsApp no futuro sem alterar o código dos módulos.
4.  **n8n Livre de Lógica Complexa (n8n is just a pipe):** O n8n deve atuar estritamente como um **orquestrador/transportador de dados (pipeline)**. Lógicas complexas de validação, cálculos matemáticos pesados ou manipulação de banco de dados devem ocorrer no código da API Core. O n8n apenas conecta os pontos e dispara os gatilhos.

---

## 4. Multi Tenant

Toda requisição deverá possuir:
*   `tenant_id`

Todo registro do banco deverá possuir:
*   `tenant_id`

Nenhuma consulta poderá retornar dados de outro tenant.

O isolamento é obrigatório.

Mesmo utilizando apenas um cliente durante o desenvolvimento.

---

## 5. Event Bus

O Core deverá trabalhar orientado a eventos.

Eventos internos:
*   `USER_CREATED`
*   `PAYMENT_CONFIRMED`
*   `INSTANCE_CONNECTED`
*   `INSTANCE_DISCONNECTED`
*   `MESSAGE_RECEIVED`
*   `MESSAGE_SENT`
*   `TRANSACTION_CREATED`
*   `TRANSACTION_UPDATED`
*   `REPORT_GENERATED`

Sempre que possível módulos deverão reagir a eventos e não realizar chamadas acopladas.

---

## 6. Arquitetura de Software e Fluxo de Dados

A plataforma adota uma arquitetura clássica em camadas desacopladas (Clean Architecture / Repository Pattern):

```
       +---------------------------------------------+
       |            FRONTEND / CLIENTES              |
       |  (PWA, Web Dashboard, Mobile, WhatsApp Web) |
       +---------------------------------------------+
                              │
                              ▼  [Requisita via REST / JWT]
       +---------------------------------------------+
       |                  API CORE                   |
       |    (Endpoints, Roteador, Middlewares)       |
       +---------------------------------------------+
                              │
                              ▼  [Regras de Negócio Gerais]
       +---------------------------------------------+
       |                  SERVICES                   |
       |     (Lógica de Negócio, Validações, IA)     |
       +---------------------------------------------+
                              │
                              ▼  [Interface de Acesso a Dados]
       +---------------------------------------------+
       |                REPOSITORIES                 |
       |      (Queries de escrita e leitura SQL)      |
       +---------------------------------------------+
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
     +---------------++---------------++---------------+
     |  PostgreSQL   ||     Redis     ||    MinIO     |
     | (Dados Relac) || (Fila/Cache)  || (S3 Storage) |
     +---------------++---------------++---------------+
```

*   **PostgreSQL:** O banco de dados relacional e transacional do sistema (Supabase).
*   **Redis:** Gerenciador de cache temporário de alta performance e fila assíncrona de mensagens (Message Queue) para evitar timeouts.
*   **MinIO (S3 Compatible):** Servidor de armazenamento de mídias e recibos (Storage).

---

## 7. Módulos Oficiais Suportados

Os módulos são produtos acoplados que consomem os microsserviços do Core:

1.  **ZapMonei (M01):** Gestor de finanças pessoais e profissionais para motoristas de aplicativos e profissionais do volante.
2.  **EuAttendo Auto (M02):** Sistema de atração, gestão e comunicação para o segmento automotivo (oficinas e centros automotivos).
3.  **EuAttendo Market (M03):** Automatizador de vendas e CRM inteligente para pequenos negócios locais.
4.  **EuAttendo Consórcio (M04):** Ferramenta de prospecção, simulação e fechamento para corretores de consórcio.
5.  **Futuros Módulos:** Qualquer novo produto construído deve se registrar no Core, gerando um `Client ID` e consumindo as mesmas rotas de Auth, Billing e WhatsApp.

---

## 8. Responsabilidades do Core (Detalhamento)

*   **Auth:** Gerenciar login (Magic Link, senha, WhatsApp OTP), tokens JWT, tenant_id e expiração de sessões.
*   **Billing:** Integração de pagamentos com o Asaas, conciliação de faturas, controle de status da assinatura (ativo, inadimplente, cancelado).
*   **IA Engine:** O IA Engine não possui prompts específicos. Ele apenas recebe:
    - `modelo`
    - `prompt`
    - `temperatura`
    - `tools`
    - `json_mode`
    
    e devolve a resposta. Os prompts pertencem aos módulos.
*   **WhatsApp Engine:** Controlar a saúde das instâncias dedicadas na Evolution API, gerenciar o envio de textos, áudios e imagens.
*   **Dashboard:** Servir o painel web administrativo do Core e expor as APIs de dados consolidados dos módulos.
*   **Storage:** Gerenciar upload, download e geração de URLs pré-assinadas seguras de imagens e comprovantes.
*   **Notifications:** Gerenciar templates de e-mail transacional e mensagens padronizadas de WhatsApp.
*   **Logs e Auditoria:** Rastrear todas as ações críticas em nível de banco de dados na tabela `audits`.
*   **Permissões (RBAC):** Controlar o acesso do usuário baseado em seus níveis (Administrador, Cliente Premium, Cliente Grátis).

---

## 9. Padrões de Comunicação e APIs

Para manter a consistência e permitir que qualquer desenvolvedor integre sistemas com facilidade, as APIs da plataforma devem seguir estritamente o padrão abaixo:

*   **Arquitetura:** RESTful.
*   **Payloads:** JSON puro para requisições e respostas.
*   **Autenticação:** JWT (JSON Web Token) contendo obrigatoriamente `tenant_id`, trafegado no header `Authorization: Bearer <token>`.
*   **Versionamento:** Obrigatório na URL. Exemplo: `https://api.euattendo.com.br/v1/users`.
*   **Erros Padronizados:** Respostas de erro devem sempre seguir a estrutura:
    ```json
    {
      "success": false,
      "error": {
        "code": "CODIGO_DO_ERRO",
        "message": "Mensagem amigável explicando o erro."
      }
    }
    ```

---

## 10. Roadmap Técnico de Implantação

O desenvolvimento técnico deve seguir a ordem de dependência lógica estabelecida abaixo:

```
  1. Infraestrutura
             │
             ▼
  2. Core API
             │
             ▼
  3. Auth
             │
             ▼
  4. Billing
             │
             ▼
  5. Storage
             │
             ▼
  6. WhatsApp Engine
             │
             ▼
  7. IA Engine
             │
             ▼
  8. Notification Engine
             │
             ▼
  9. ZapMonei
             │
             ▼
 10. Demais módulos
```

---

## 11. Regra de Ouro

Nenhum módulo poderá acessar:
*   PostgreSQL
*   Redis
*   MinIO
*   Evolution
*   Gemini
*   Asaas

diretamente.

Todo acesso deverá ocorrer através do Core.

Esta regra nunca poderá ser quebrada.
