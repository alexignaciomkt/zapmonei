Passo 3 — MVP inicial do sistema
1. Objetivo da fase
Criar a primeira versão funcional do produto para que o motorista consiga:
●	registrar ganhos;
●	registrar despesas;
●	separar despesas pessoais e profissionais;
●	enviar foto de nota fiscal;
●	consultar resumo financeiro básico;
●	usar tudo isso principalmente pelo WhatsApp.
Resultado esperado
Ao final desta fase, o usuário deve sentir que consegue:
“controlar meu dinheiro sem planilha e sem complicação.”
________________________________________
2. Problema que essa fase resolve
Hoje o motorista de aplicativo normalmente:
●	mistura vida pessoal e trabalho;
●	esquece gastos do dia;
●	não sabe o lucro real;
●	anota em papel ou memória;
●	não quer abrir app complexo enquanto trabalha.
O MVP precisa resolver exatamente isso:
 capturar os dados financeiros com rapidez e organizar de forma clara.
________________________________________
3. Escopo do MVP
O que entra no MVP
1.	Cadastro básico do usuário
2.	Conexão inicial com WhatsApp
3.	Registro de ganhos por texto
4.	Registro de gastos por texto
5.	Classificação entre pessoal e trabalho
6.	Upload de foto de nota
7.	Leitura básica da nota
8.	Painel com resumo simples
9.	Consulta de saldo/lucro por período
10.	Histórico básico de lançamentos
O que não entra ainda
●	integração com banco
●	categorização avançada por IA
●	gamificação completa
●	metas financeiras sofisticadas
●	múltiplas carteiras
●	contabilidade completa
●	suporte a mais de um perfil por conta
●	automações complexas com alertas inteligentes
________________________________________
4. Público-alvo da fase 1
Usuário principal
Motorista de aplicativo que:
●	trabalha com Uber, 99, inDrive ou app similar;
●	passa o dia no celular;
●	precisa de rapidez;
●	quer organização sem burocracia.
Características do usuário
●	pouco tempo
●	rotina corrida
●	familiaridade com WhatsApp
●	baixa paciência para aprender sistemas complexos
●	necessidade de ver valor rápido
________________________________________
5. Proposta da primeira versão
O motorista envia uma mensagem no WhatsApp, por exemplo:
●	“Ganhei R$ 85 na corrida”
●	“Abastecimento de R$ 120 para trabalhar”
●	“Comprei almoço, gasto pessoal”
●	“Vou mandar a nota”
●	“Quanto eu gastei hoje?”
O sistema:
●	interpreta a mensagem;
●	identifica valor;
●	entende se é ganho ou gasto;
●	classifica como pessoal ou profissional;
●	salva no banco;
●	responde confirmando;
●	atualiza o painel.
________________________________________
6. Funcionalidades detalhadas do MVP
6.1 Cadastro básico do usuário
O sistema deve coletar:
●	nome
●	telefone
●	cidade
●	tipo de atividade:
○	motorista de app
○	entregador
○	ambos
●	tipo de veículo:
○	carro
○	moto
●	preferência inicial:
○	finanças pessoais
○	finanças de trabalho
○	ambas
Objetivo: entender o perfil do motorista para adaptar mensagens, categorias e relatórios.
________________________________________
6.2 Registro de ganhos via WhatsApp
Exemplos:
●	“Ganhei 52 reais”
●	“Corrida de 34”
●	“Hoje fiz 180 no Uber”
●	“Recebi Pix de 70”
O sistema deve:
●	reconhecer que é ganho;
●	identificar o valor;
●	marcar como profissional, a menos que o contexto indique o contrário;
●	salvar data e hora automaticamente;
●	responder com confirmação.
Exemplo de resposta:
 “Anotei seu ganho de R$ 52 como receita de trabalho.”
________________________________________
6.3 Registro de gastos via WhatsApp
Exemplos:
●	“Gastei 100 no posto”
●	“Comprei almoço de 25”
●	“Lavagem do carro 35”
●	“Pedágio 12”
●	“Farmácia 18”
O sistema deve:
●	reconhecer que é despesa;
●	identificar o valor;
●	sugerir categoria;
●	separar pessoal e profissional;
●	pedir confirmação quando necessário.
Exemplo de resposta:
 “Anotei R$ 100 como abastecimento para trabalho. Está correto?”
________________________________________
6.4 Classificação pessoal x profissional
Esse é um dos pontos mais importantes do produto.
Regras simples no MVP
Se a mensagem contiver termos como:
●	corrida
●	Uber
●	99
●	entrega
●	posto
●	combustível
●	manutenção
●	pedágio
●	lavagem
o sistema tende a classificar como trabalho.
Se contiver termos como:
●	mercado
●	almoço
●	farmácia
●	roupa
●	lazer
●	casa
o sistema tende a classificar como pessoal.
Importante:
 Mesmo com regra automática, o usuário deve poder corrigir.
________________________________________
6.5 Foto de nota fiscal
Como funciona:
●	o motorista manda foto da nota via WhatsApp;
●	o sistema recebe a imagem;
●	faz OCR;
●	identifica valor;
●	identifica nome do estabelecimento;
●	sugere categoria;
●	pergunta se é pessoal ou trabalho;
●	salva após confirmação.
Exemplo:
 “Identifiquei uma compra de R$ 137,80 no Posto X. Quer salvar como abastecimento para trabalho?”
________________________________________
6.6 Histórico de lançamentos
O usuário precisa ver:
●	lançamentos do dia
●	lançamentos da semana
●	lançamentos do mês
●	entradas
●	saídas
●	categoria
●	origem
●	data/hora
Exemplo de lista:
●	R$ 52 — corrida — trabalho
●	R$ 120 — abastecimento — trabalho
●	R$ 25 — almoço — pessoal
________________________________________
6.7 Resumo financeiro básico
Indicadores mínimos:
●	total de ganhos
●	total de gastos
●	saldo
●	lucro líquido
●	gastos de trabalho
●	gastos pessoais
Exemplo de resposta:
 “Hoje você ganhou R$ 210 e gastou R$ 78. Seu saldo do dia é R$ 132.”
________________________________________
6.8 Painel web simples
Mesmo com foco em WhatsApp, o painel é importante.
Deve mostrar:
●	saldo total
●	total de ganhos
●	total de gastos
●	gráfico simples por período
●	lista de lançamentos
●	filtros por data e categoria
Objetivo: dar visão consolidada da evolução financeira.
________________________________________
7. Fluxos principais do MVP
Fluxo 1 — Primeiro acesso
1.	Usuário acessa o sistema
2.	Informa telefone
3.	Recebe instrução de uso
4.	Conecta o WhatsApp
5.	Informa dados básicos
6.	Faz primeiro lançamento
7.	Visualiza resumo inicial
Fluxo 2 — Registrar ganho
1.	Usuário envia mensagem
2.	Sistema interpreta
3.	Classifica como ganho
4.	Salva
5.	Confirma com mensagem automática
Fluxo 3 — Registrar gasto
1.	Usuário envia mensagem
2.	Sistema interpreta
3.	Identifica categoria
4.	Pergunta se é pessoal ou trabalho, se necessário
5.	Salva
6.	Confirma
Fluxo 4 — Enviar nota fiscal
1.	Usuário envia foto
2.	Sistema processa OCR
3.	Sugere classificação
4.	Usuário confirma
5.	Registro salvo
Fluxo 5 — Consultar resumo
1.	Usuário pergunta “Quanto gastei hoje?”
2.	Sistema calcula
3.	Responde de forma simples
4.	Mostra resumo
________________________________________
8. Requisitos funcionais do MVP
Cadastro
●	criar conta
●	editar perfil
●	salvar preferências
Comunicação
●	receber mensagens do WhatsApp
●	interpretar texto
●	responder automaticamente
Lançamentos
●	criar lançamento de ganho
●	criar lançamento de gasto
●	editar lançamento
●	excluir lançamento
Classificação
●	identificar pessoal/profissional
●	sugerir categoria
●	permitir correção manual
OCR
●	ler foto de nota
●	extrair valor e nome
Relatórios
●	exibir resumo diário
●	exibir resumo semanal
●	exibir resumo mensal
________________________________________
9. Requisitos não funcionais do MVP
Simplicidade
●	linguagem clara
●	botões e respostas curtas
●	sem menus complexos
Rapidez
●	resposta quase imediata no WhatsApp
●	sistema leve
Confiabilidade
●	não perder lançamentos
●	registrar data e hora corretamente
●	ter logs de falha
Segurança
●	proteger dados pessoais
●	proteger histórico financeiro
●	acesso autenticado
Escalabilidade inicial
●	suportar vários motoristas sem travar
________________________________________
10. Modelo mental do produto nessa fase
A melhor forma de pensar o MVP é assim:
o sistema é um copiloto financeiro
Ele não substitui o motorista.
 Ele ajuda a:
●	lembrar;
●	organizar;
●	classificar;
●	resumir.
________________________________________
11. Entidades mínimas do banco de dados
Usuário
●	id
●	nome
●	telefone
●	cidade
●	tipo de atividade
●	tipo de veículo
Lançamento
●	id
●	user_id
●	tipo: ganho ou gasto
●	valor
●	categoria
●	origem: texto, áudio, imagem
●	contexto: pessoal ou trabalho
●	data/hora
●	observação
Anexo
●	id
●	lançamento_id
●	url da imagem
●	tipo de arquivo
Conversa
●	id
●	user_id
●	mensagem
●	resposta do sistema
●	status de processamento
________________________________________
12. Critérios de sucesso do MVP
O Passo 3 só pode ser considerado bom se o usuário conseguir:
●	lançar ganhos e gastos sem dificuldade;
●	entender a resposta do sistema;
●	usar mais de uma vez por semana;
●	consultar resumo financeiro sem depender de suporte;
●	sentir que o sistema economiza tempo.
________________________________________
13. Métricas do MVP
Métricas de uso
●	número de lançamentos por usuário
●	quantidade de mensagens por WhatsApp
●	taxa de envio de nota fiscal
●	taxa de resposta do bot
Métricas de retenção
●	usuários ativos em 7 dias
●	usuários ativos em 30 dias
Métricas de valor
●	quantos lançamentos foram classificados automaticamente
●	quantas correções o usuário fez
●	quanto tempo ele levou para registrar uma despesa
________________________________________
14. Entregáveis da fase 1
Ao terminar esse passo, você deve ter:
●	sistema base de cadastro
●	integração com WhatsApp
●	registro de ganho e gasto
●	leitura de nota fiscal
●	painel simples
●	banco de dados estruturado
●	regras iniciais de classificação
●	resumo financeiro básico
________________________________________
15. Riscos dessa fase
Risco 1 — IA errar classificação
Mitigação: permitir correção e usar regras simples no começo.
Risco 2 — usuário não usar sempre
Mitigação: fluxo rápido, linguagem prática e respostas curtas.
Risco 3 — OCR falhar em notas ruins
Mitigação: pedir confirmação e aceitar correção manual.
Risco 4 — sistema virar complexo demais
Mitigação: manter o MVP enxuto e não tentar resolver tudo no início.
________________________________________
16. Ordem prática de execução
Eu faria assim:
1.	definir entidades do banco e tipos de lançamento
2.	criar o fluxo de WhatsApp para texto
3.	implementar classificação pessoal/profissional
4.	adicionar leitura de nota fiscal
5.	criar painel simples de resumo
6.	testar com 3 a 5 motoristas reais
________________________________________
17. Resultado ideal do Passo 3
Se esse passo for bem feito, o motorista vai conseguir:
●	mandar uma mensagem no WhatsApp;
●	registrar dinheiro que entrou ou saiu;
●	entender quanto lucrou;
●	separar vida pessoal da profissional;
●	usar o sistema sem sentir esforço.

