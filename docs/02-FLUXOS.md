# 02 - Fluxos do Usuário (ZapMonei V2)

---

## 1. Fluxo de Onboarding de 60 Segundos (Ativação)
O onboarding do ZapMonei V2 foca em demonstrar o valor do cálculo do Lucro Real antes de qualquer burocracia cadastral.

```
[Pagamento Confirmado / Teste Grátis]
                 │
                 ▼
     Bot envia desafio de ganho
                 │
                 ▼
    Usuário responde: "Ganhei 80"
                 │
                 ▼
    Bot anota e pede combustível
                 │
                 ▼
   Usuário responde: "Abasteci 30"
                 │
                 ▼
  Bot exibe Lucro Real + Depreciação (AHA MOMENT! 🎉)
                 │
                 ▼
Bot solicita nome de batismo para salvar a conta
```

*   **Fase Kathy (Suporte):** Conduz o pareamento técnico do número do WhatsApp da instância por QR Code ou Pairing Code.
*   **Fase Agente (Copiloto):** Entra em ação após o pareamento. Conduz o fluxo rápido acima e, após o "Aha Moment", coleta o nome do usuário e sua meta diária opcional.

---

## 2. Fluxo de Uso Diário (Core)
O motorista faz lançamentos financeiros livres enquanto trabalha.

*   **Entrada Simples de Ganhos:** *"Ganhei 45 no Uber"* → IA interpreta R$ 45,00, categoria "Corrida", tipo "ganho".
*   **Entrada Simples de Gastos:** *"20 reais de almoço"* → IA interpreta R$ 20,00, categoria "Alimentação", tipo "gasto".
*   **Mensagens Múltiplas:** *"Fiz 120 de corrida e paguei 40 de combustível"* → IA executa duas transações em lote.

---

## 3. Fluxo de Correção Conversacional (Retenção)
Permite ao motorista reverter erros sem atrito técnico.

*   **Cenário:** O motorista digitou o valor incorretamente e percebeu.
*   **Conversa:**
    *   *Usuário:* *"Escrevi errado, o gasto de antes foi 35"*
    *   *Agente:* Localiza a última transação de despesa do dia, atualiza o valor para R$ 35,00 e envia o resumo recalculado: *"Corrigido por aqui! Novo lucro do dia recalculado para R$ XX. 👊"*

---

## 4. Fluxo de Fechamento Semanal (Raio-X de Sexta)
O motor do hábito que atua na retenção do usuário.

*   **Gatilho:** Agendamento cron toda sexta-feira às 18h.
*   **Ação:** O n8n consolida todas as transações da semana, compara com o faturamento da semana anterior e envia um sumário direto no WhatsApp:
    > *"📊 **Seu Raio-X da Semana, Piloto!**
    > Faturamento: R$ 1.540,00
    > Combustível: -R$ 490,00
    > Outros Gastos: -R$ 120,00
    > Depreciação: -R$ 231,00
    > ─────────────────────────
    > **Lucro Líquido Real: R$ 699,00**
    > Margem: 45.3% do seu faturamento foi pro bolso. Rodou melhor do que semana passada (+12%)! 📈"*
