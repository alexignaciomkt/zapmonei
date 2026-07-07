# 🔍 Relatório de Auditoria de Prompts — ZapMonei
### Análise Crítica dos Prompts do Gemini 1.5 Flash

Este relatório apresenta uma auditoria técnica e comportamental detalhada dos prompts em execução na inteligência artificial do ZapMonei, cobrindo os workflows `Motor de Inteligência Artificial` e `Leitor de Recibos (OCR)`.

---

## 1. Prompt: Motor de Inteligência Artificial
**Localização:** Workflow `ZapMonei: Motor de Inteligência Artificial` (Nó: `IA: Analisar Texto Financeiro`)

### 1.1 Redundâncias Detectadas
*   **Conflito de Persona:** O System Message define a persona como *"Você é um especialista em contabilidade para motoristas de aplicativo."*, enquanto o User Prompt inicia dizendo *"Você é o Assistente Financeiro ZapMonei."*. 
    *   *Impacto:* A LLM recebe duas instruções de persona diferentes. Isso dilui a atenção do modelo e pode causar respostas com tom de voz inconsistente.

### 1.2 Ambiguidades e Desalinhamento com o Banco de Dados
*   **Desalinhamento Crítico de Categorias:** O prompt limita a escolha do modelo a: `Combustível, Corrida, Alimentação, Manutenção, Outros`. No entanto, no banco de dados ([schema.sql](file:///e:/Sistemas/ZapMonei2/database/schema.sql#L86-L99)), as categorias padrão do sistema são:
    - `'Combustível'`
    - `'Alimentação'`
    - `'Manutenção'`
    - `'Ganhos Uber'`, `'Ganhos 99'`, `'Ganhos InDrive'`, `'Outros Ganhos'`
    - `'Despesa Pessoal'`
    *   *Impacto:* A IA extrai e salva `'Corrida'`, que é uma categoria que **não existe** por padrão no banco. Isso quebra a consistência analítica dos relatórios do dashboard e pode violar restrições caso o RLS ou chaves estrangeiras sejam ativados rigidamente.
*   **Falta de Definição para "Descrição":** O prompt pede o campo `descricao` no JSON de retorno, mas não explica o que deve conter.
    *   *Impacto:* A IA oscila entre repetir a categoria (ex: `"Combustível"`) ou copiar a mensagem do usuário (ex: `"Paguei 30 de gasolina"`).

### 1.3 Fragilidades de Formatação e Casos de Falha
*   **Instabilidade de Formatação JSON:** O prompt usa instrução textual para o formato: `"RETORNE APENAS JSON: ..."`. 
    *   *Impacto:* Sem a ativação do modo de resposta nativo JSON do Gemini (`JSON Mode` do LangChain/n8n), o modelo frequentemente envolve a resposta em blocos de código Markdown (\`\`\`json ... \`\`\`). Como o workflow do Motor de IA faz `JSON.parse` diretamente no output, o fluxo quebra e o usuário fica sem resposta.
*   **Vulnerabilidade a Mensagens Irrelevantes (Mensagens "Fora de Escopo"):** O prompt não instrui a IA sobre o que fazer se a mensagem não for financeira (ex: *"Bom dia"*, *"Tudo bem?"*, *"Quero cancelar"*).
    *   *Impacto:* A IA tentará forçar a extração de dados financeiros, gerando transações fantasmas (ex: `tipo: "gasto"`, `valor: 0.00`, `categoria: "Outros"`) no banco de dados para conversas cotidianas.

---

## 2. Prompt: Leitor de Recibos (OCR)
**Localização:** Workflow `ZapMonei: Leitor de Recibos (OCR) - Versão Estável` (Nó: `IA: Analisador de Recibo`)

### 2.1 Ambiguidades e Desalinhamento
*   **Ausência Total de Guia de Categorias:** O prompt solicita a extração de `categoria` de forma genérica, sem listar as categorias aceitas pelo sistema.
    *   *Impacto:* A IA inventa categorias em texto livre baseado no que lê na nota (ex: `"gasolina"`, `"combustivel-etanol"`, `"shell-sa"`), gerando total inconsistência de agregação no banco de dados.
*   **Falta de Instrução de Prioridade de Valor:** Em recibos com múltiplos valores listados (Subtotal, Descontos, Impostos, Valor Pago), o prompt não especifica qual campo extrair.
    *   *Impacto:* A IA pode extrair o subtotal antes dos descontos, gerando lançamentos com valores maiores do que o motorista efetivamente desembolsou.

### 2.2 Fragilidades de Robustez (Casos de Erro)
*   **Vulnerabilidade a Imagens Inválidas:** O prompt não ensina a IA como agir caso a imagem esteja borrada, ilegível ou não seja um recibo (ex: uma selfie ou foto da rua).
    *   *Impacto:* A IA alucina valores ou falha silenciosamente, podendo quebrar o fluxo do n8n na conversão.

---

## 3. Oportunidades de Simplificação e Melhorias

Para a evolução do sistema, recomenda-se:

1.  **Centralização de Persona:** Definir a persona da IA unicamente no System Message e focar o User Prompt apenas nas variáveis de contexto da mensagem.
2.  **Mapeamento Sincronizado de Categorias:** Alimentar o prompt da IA com a lista real de categorias do banco de dados (passando as strings permitidas como lista de enums).
3.  **Implementação de Proteção contra Fora de Escopo:** Adicionar uma regra de desvio: se a intenção for não-financeira, retornar `{"tipo": "conversa", "texto_resposta": "..."}` e abortar a gravação no Supabase.
4.  **Habilitar JSON Mode nativo nas configurações do nó do Gemini:** Eliminando a necessidade de prompts textuais implorando por JSON e garantindo estabilidade de código no Javascript.
