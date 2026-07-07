# Protocolo de Atualização de Fluxos n8n

Devido a restrições e instabilidades na atualização via API/MCP, o protocolo oficial para atualização de fluxos no n8n a partir de agora será manual e colaborativo:

1. **Geração**: O agente (IA) gera o arquivo JSON completo e funcional com a lógica do fluxo.
2. **Disponibilização**: O agente salva o arquivo no sistema local (ex: `scratch/onboarding_final.json`) ou serve via localhost se necessário.
3. **Ação do Usuário**: O usuário (Sanja) abre o arquivo local, copia o conteúdo (`Ctrl+A`, `Ctrl+C`) e cola diretamente no editor visual do n8n (`Ctrl+V`), substituindo o conteúdo antigo.

*Esta regra deve ser lembrada em todas as sessões futuras para evitar perda de tempo com tentativas de deploy via API.*
