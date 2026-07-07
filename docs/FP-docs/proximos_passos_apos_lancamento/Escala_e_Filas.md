# Planejamento: Configuração da Instância e Escala

Com a instância sendo criada com sucesso na Evo-Go, precisamos definir os próximos passos lógicos. Este documento aborda a configuração dessa instância e responde à sua excelente preocupação sobre escala (picos de 100-200 vendas simultâneas).

## 1. Arquitetura de Configuração da Instância

**Decisão Recomendada:** Manter a configuração no **mesmo fluxo** (`ZapMonei_Ativacao_Pos_Pagamento`).
*Por que?* Se criarmos um fluxo separado, teremos que gerenciar "gatilhos" artificiais. Mantendo no mesmo fluxo, garantimos que o usuário só é considerado "Ativo" se a instância for criada E configurada com sucesso.

**Próximos Nós (HTTP Requests) a serem adicionados:**
1. **Set Webhook (Evo-Go):** Dizer para a Evo-Go que todas as mensagens que chegarem no WhatsApp desse motorista devem ser enviadas para a URL do nosso fluxo principal (`ZapMonei: Motor de IA`).
2. **Conexão (Gerar QR Code):** Chamar o endpoint da Evo-Go que inicia a conexão e gera a string do QR Code em Base64.
3. **Atualizar Supabase:** Salvar esse QR Code (ou o status aguardando leitura) na tabela `users`, para que o Front-end consiga exibir na tela.

---

## 2. Estratégia de Escala e Filas (Preparando para o Boom 🚀)

Que Deus permita mesmo! Para lidar com 200 compras simultâneas sem derrubar o servidor, precisamos entender o gargalo. O n8n aguenta receber 200 webhooks do Asaas, mas se mandarmos a Evo-Go criar 200 instâncias no mesmo milissegundo, a API dela pode falhar.

Temos dois caminhos para gerenciar essa "Fila":

### Opção A: Controle de Concorrência Nativo do n8n (Recomendado para Agora)
O n8n permite limitar quantas vezes um fluxo pode rodar ao mesmo tempo. 
*   **Como funciona:** Vamos nas configurações do Workflow e ativamos o *Limit Concurrent Executions*. Definimos, por exemplo, `5`.
*   **O que acontece no pico:** Se 200 pessoas comprarem, o n8n vai processar 5 por vez. Os outros 195 ficam "na fila" interna da memória do n8n aguardando a vez deles. Ninguém é perdido, e a Evo-Go não é sobrecarregada.

### Opção B: n8n em Queue Mode (Escala Enterprise)
*   **Como funciona:** Exige mudar a arquitetura do servidor, instalando o **Redis** e criando instâncias "Worker" do n8n (uma máquina só recebe o webhook, outra só processa o fluxo).
*   **Veredito:** É excelente, mas traz uma complexidade de infraestrutura desnecessária para o lançamento. 
