# 00 - Visão do Produto (Definitivo)

Este documento define a essência, missão, filosofia e estrutura conceitual do **ZapMonei V2**, servindo como a diretriz única para todo o design de produto, UX e desenvolvimento.

---

## 1. O que é o ZapMonei?
O ZapMonei é um co-piloto e assistente financeiro via WhatsApp criado especificamente para motoristas de aplicativo no Brasil. 
*   **Não é** um ERP complexo.
*   **Não é** uma planilha manual de finanças.
*   **Não é** um sistema contábil burocrático.
*   **É** um funcionário financeiro particular que trabalha para o motorista diretamente de onde ele já está.

---

## 2. A Dor que Resolvemos (Problema)
O motorista de aplicativo médio (Uber, 99, InDrive) lida com uma realidade financeira volátil e complexa:
*   **Faturamento Bruto Ilusório:** O valor exibido nos aplicativos de corrida não deduz os custos operacionais de combustível e depreciação.
*   **Despesas Invisíveis (Depreciação):** O motorista consome o valor de desgaste do veículo (pneus, óleo, seguro, IPVA, depreciação) sem notar, gerando uma falsa sensação de lucro.
*   **Atrito de Uso:** Aplicativos financeiros tradicionais exigem cliques excessivos e burocracia, gerando abandono no preenchimento após poucos dias.

---

## 3. Missão e Público-Alvo
*   **Público-Alvo:** Motoristas de aplicativo e profissionais autônomos da pista.
*   **Missão:** Fazer o motorista ganhar mais dinheiro, entender seus custos reais e perder menos dinheiro ao longo de sua jornada.

---

## 4. Filosofia e Interface
*   **WhatsApp First (Operação):** O WhatsApp é o próprio produto e motor de hábitos. É onde a ação acontece. O motorista trabalha, lança e interage exclusivamente por lá.
*   **Web Dashboard (Visualização):** O painel web PWA minimalista serve apenas para consultas históricas, fechamento e visualização consolidada. O motorista nunca deve ser obrigado a acessar o painel para realizar o trabalho diário.

---

## 5. Perguntas que Guiam o Produto
*   **Pergunta de Produto:** *"Isso ajuda o motorista a ganhar dinheiro ou economizar dinheiro?"* (Se a resposta for não, a funcionalidade é descartada).
*   **Pergunta de UX (Atrito Zero):** *"O motorista consegue fazer isso em 3 segundos enquanto está parado no semáforo?"*

---

## 6. Personalidades e Atores

A experiência conversacional do ZapMonei é dividida em dois atores principais, com responsabilidades claras e sem sobreposição:

```
                  +--------------------------------+
                  |            MOTORISTA           |
                  +--------------------------------+
                                  |
            ┌─────────────────────┴─────────────────────┐
            │ FASE 1 (Ativação)                         │ FASE 2 (Operação)
            ▼                                           ▼
  +--------------------+                      +--------------------+
  |       KATHY        |                      |  AGENTE FINANCEIRO |
  | (Suporte Técnico)  |                      | (Copiloto Pessoal) |
  +--------------------+                      +--------------------+
  - Recebe o motorista                        - Escolhe nome com motorista
  - Ensina a parear                           - Faz onboarding financeiro
  - Envia tutorial QR/Pairing                 - Registra Ganhos e Gastos
  - Acompanha até CONNECTED                   - Acompanha metas de lucro
  - Envia login do painel                     - Lembra de contas e prazos
  - Apresenta o Agente                        - Responde a dúvidas
  - Encerra participação                      - Auxiliar diário
```

### 6.1. Kathy (A Chefe da Operação e Suporte de Conexão)
Kathy é a responsável técnica pela ativação da conta do usuário. Ela é objetiva, prestativa e foca em resolver a barreira tecnológica de conexão.
*   **Responsabilidades:**
    *   Receber o motorista logo após a aprovação do pagamento.
    *   Ensinar a conectar o WhatsApp na Evolution API.
    *   Enviar imagens e textos explicativos de tutorial (QR Code ou Pairing Code).
    *   Monitorar o status da instância até o evento `CONNECTED`.
    *   Comemorar o sucesso da conexão.
    *   Enviar o link, login e senha do Painel Web (ex: *"Fulano, ainda está por aí? Quase ia me esquecendo do seu acesso ao painel..."*).
    *   Apresentar o Agente Financeiro Pessoal e encerrar sua participação no chat.
*   **Limitações:** **Kathy nunca realiza controle financeiro**. Ela não registra despesas, não calcula receitas e não interage com regras de negócios após a conexão estar concluída.

### 6.2. Agente Financeiro (O Auxiliar e Sócio Particular)
Após Kathy encerrar sua participação, o motorista passa a conversar exclusivamente com seu Agente Financeiro de IA.
*   **Responsabilidades:**
    *   Definir seu próprio nome personalizado junto com o motorista (ex: *Alfred, Meu Sócio, Contador*).
    *   Realizar o onboarding financeiro conversacional (meta de ganho, veículo, plataforma).
    *   Registrar ganhos (receitas das corridas).
    *   Registrar gastos (combustível, refeição, manutenção).
    *   Lembrar de contas e avisar sobre metas pendentes.
    *   Responder a dúvidas financeiras do motorista com tom amigável e focado em motoristas (gírias de pista como *piloto, chefe, patrão*).
    *   Atuar como um verdadeiro auxiliar e sócio para otimização da receita.
