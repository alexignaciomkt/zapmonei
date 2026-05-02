# Fase 3: Engine de IA e Processamento (Gemini)

Onde a mágica acontece. O ZapMonei deixa de ser um "chat" e passa a ser uma inteligência que entende o contexto financeiro do motorista.

## 🛠️ Tecnologias
- **Modelo de Linguagem:** Google Gemini 1.5 Flash (Multimodal).
- **Processamento:** n8n LangChain Nodes.
- **Storage:** MinIO para armazenamento de mídia (fotos de recibos).

## 📋 Funcionalidades Implementadas
1. **NLP Engine (Texto):** Extração estruturada de dados a partir de frases naturais como "Abasteci 150 no Shell" ou "Ganhei 45 numa corrida pro centro".
   - Identificação automática de: Valor, Categoria, Tipo (Ganho/Gasto) e Contexto (Trabalho/Pessoal).
2. **OCR Handler (Visão):** 
   - Captura de fotos de notas fiscais e recibos de postos.
   - Extração de valores e itens diretamente da imagem usando Gemini Vision.
3. **Classificação Inteligente:** Atribuição de transações às categorias do motorista, com aprendizado contínuo.
4. **Confirmação Automatizada:** Respostas imediatas no WhatsApp confirmando o lançamento com emojis e resumo do valor salvo.

## 🎯 Objetivo de Branding
Posicionar o ZapMonei como um sistema **inteligente e sem esforço**. O motorista "fala" com o sistema e a IA faz o trabalho duro de classificar e somar.
