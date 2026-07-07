Passo 2 — Backlog completo com épicos, histórias de usuário e critérios de aceite
Perfeito.
 Agora vamos transformar o PRD em algo executável para produto e desenvolvimento.
O backlog serve para responder:
●	o que precisa ser construído
●	em que ordem
●	por quê
●	como saber se está pronto
Vou organizar em:
1.	épicos
2.	histórias de usuário
3.	critérios de aceite
4.	prioridade
5.	dependências
________________________________________
1. Objetivo do backlog
Transformar o PRD em uma lista estruturada de entregas para que o time possa desenvolver o produto de forma organizada, priorizada e incremental.
________________________________________
2. Estrutura de priorização
Vou usar esta lógica:
●	P0 = essencial para o MVP
●	P1 = importante, mas pode vir logo depois do MVP
●	P2 = melhoria futura
●	P3 = evolução avançada
________________________________________
3. Épicos do produto
Épico 1 — Cadastro e autenticação do usuário
Base para identificar quem está usando o sistema.
Épico 2 — Integração com WhatsApp
Canal principal de interação com o produto.
Épico 3 — Registro de ganhos e gastos
Coração do sistema financeiro.
Épico 4 — Classificação financeira automática
Separação entre pessoal e profissional.
Épico 5 — Upload e leitura de notas fiscais
Captura de despesas por imagem.
Épico 6 — Dashboard e relatórios
Visualização do resultado financeiro.
Épico 7 — Histórico de lançamentos
Consulta e rastreabilidade das informações.
Épico 8 — Mensageria e respostas automáticas
Experiência conversacional no WhatsApp.
Épico 9 — Configurações do usuário
Preferências, categorias e ajustes.
Épico 10 — Segurança, logs e auditoria
Confiabilidade e controle do sistema.
________________________________________
4. Backlog detalhado por épico
________________________________________
Épico 1 — Cadastro e autenticação do usuário
História 1.1 — Criar conta com telefone
Como motorista
 quero me cadastrar com meu número de telefone
 para começar a usar o sistema rapidamente.
Critérios de aceite
●	o usuário informa telefone válido;
●	o sistema cria um cadastro único;
●	o usuário recebe confirmação de cadastro;
●	não é permitido duplicar conta com o mesmo telefone.
Prioridade
P0
Dependências
Nenhuma
________________________________________
História 1.2 — Completar perfil inicial
Como usuário
 quero informar meu nome, cidade e tipo de atividade
 para que o sistema personalize minha experiência.
Critérios de aceite
●	salvar nome;
●	salvar cidade;
●	salvar tipo de atividade;
●	salvar tipo de veículo;
●	permitir editar depois.
Prioridade
P0
Dependências
Cadastro por telefone
________________________________________
História 1.3 — Definir perfil financeiro inicial
Como usuário
 quero escolher se uso o sistema para finanças pessoais, trabalho ou ambos
 para organizar melhor meus lançamentos.
Critérios de aceite
●	escolher entre pessoal, trabalho ou ambos;
●	salvar preferência;
●	usar essa preferência nas sugestões do sistema.
Prioridade
P0
Dependências
Completar perfil inicial
________________________________________
Épico 2 — Integração com WhatsApp
História 2.1 — Conectar o número do WhatsApp
Como usuário
 quero conectar meu WhatsApp ao sistema
 para registrar minhas finanças pelo celular.
Critérios de aceite
●	o sistema reconhece o número do WhatsApp;
●	o usuário recebe mensagem inicial;
●	o canal fica apto para receber e enviar mensagens.
Prioridade
P0
Dependências
Cadastro por telefone
________________________________________
História 2.2 — Receber mensagens de texto
Como sistema
 quero receber mensagens de texto do usuário
 para interpretar ganhos e gastos.
Critérios de aceite
●	mensagens chegam ao sistema;
●	o texto é armazenado;
●	o texto é processado para classificação.
Prioridade
P0
Dependências
Integração com WhatsApp
________________________________________
História 2.3 — Responder automaticamente no WhatsApp
Como usuário
 quero receber respostas automáticas
 para saber se meu lançamento foi registrado corretamente.
Critérios de aceite
●	toda mensagem válida gera resposta;
●	resposta é clara e objetiva;
●	resposta confirma ou solicita ajuste.
Prioridade
P0
Dependências
Receber mensagens de texto
________________________________________
Épico 3 — Registro de ganhos e gastos
História 3.1 — Registrar ganho por texto
Como usuário
 quero enviar uma mensagem com um ganho
 para salvar meu faturamento rapidamente.
Critérios de aceite
●	identificar valor;
●	identificar que é ganho;
●	salvar data e hora;
●	confirmar o lançamento.
Prioridade
P0
Dependências
Receber mensagens de texto
________________________________________
História 3.2 — Registrar gasto por texto
Como usuário
 quero enviar uma mensagem com uma despesa
 para salvar meus gastos rapidamente.
Critérios de aceite
●	identificar valor;
●	identificar que é gasto;
●	salvar data e hora;
●	confirmar o lançamento.
Prioridade
P0
Dependências
Receber mensagens de texto
________________________________________
História 3.3 — Editar lançamento
Como usuário
 quero corrigir um lançamento
 para manter meus dados certos.
Critérios de aceite
●	usuário pode editar valor;
●	usuário pode editar categoria;
●	usuário pode editar tipo;
●	alterações são registradas.
Prioridade
P1
Dependências
Histórico de lançamentos
________________________________________
História 3.4 — Excluir lançamento
Como usuário
 quero excluir um lançamento errado
 para não distorcer meu relatório.
Critérios de aceite
●	usuário confirma exclusão;
●	lançamento deixa de aparecer nos relatórios;
●	exclusão fica registrada em log.
Prioridade
P1
Dependências
Histórico de lançamentos
________________________________________
Épico 4 — Classificação financeira automática
História 4.1 — Classificar ganho ou gasto automaticamente
Como sistema
 quero identificar se a mensagem é receita ou despesa
 para organizar o lançamento sem esforço do usuário.
Critérios de aceite
●	texto com ganho é classificado como entrada;
●	texto com despesa é classificado como saída;
●	quando houver dúvida, o sistema pede confirmação.
Prioridade
P0
Dependências
Processamento de mensagens
________________________________________
História 4.2 — Classificar como pessoal ou profissional
Como sistema
 quero sugerir o contexto do lançamento
 para separar trabalho e vida pessoal.
Critérios de aceite
●	sistema sugere contexto com base em palavras-chave;
●	usuário pode confirmar ou corrigir;
●	contexto fica salvo no lançamento.
Prioridade
P0
Dependências
Registro de ganhos e gastos
________________________________________
História 4.3 — Aprender com correções do usuário
Como sistema
 quero registrar correções do usuário
 para melhorar futuras sugestões.
Critérios de aceite
●	correção é armazenada;
●	sugestão futura pode considerar histórico;
●	não altera lançamentos antigos sem confirmação.
Prioridade
P2
Dependências
Correção de classificação
________________________________________
Épico 5 — Upload e leitura de notas fiscais
História 5.1 — Receber foto de nota fiscal
Como usuário
 quero enviar uma foto da nota
 para registrar meu gasto sem digitar tudo.
Critérios de aceite
●	imagem é recebida;
●	imagem é armazenada;
●	o sistema inicia processamento da nota.
Prioridade
P0
Dependências
Integração com WhatsApp
________________________________________
História 5.2 — Extrair dados da nota por OCR
Como sistema
 quero ler valor e informações da imagem
 para preencher o lançamento automaticamente.
Critérios de aceite
●	valor é extraído quando possível;
●	nome do estabelecimento é extraído quando possível;
●	dados são mostrados ao usuário para confirmação.
Prioridade
P0
Dependências
Recebimento de foto
________________________________________
História 5.3 — Confirmar e salvar nota
Como usuário
 quero confirmar a nota lida pelo sistema
 para salvar a despesa corretamente.
Critérios de aceite
●	o sistema apresenta o valor encontrado;
●	o usuário confirma ou corrige;
●	o lançamento é salvo após confirmação.
Prioridade
P0
Dependências
OCR da nota
________________________________________
Épico 6 — Dashboard e relatórios
História 6.1 — Exibir saldo geral
Como usuário
 quero ver meu saldo consolidado
 para entender minha situação financeira.
Critérios de aceite
●	saldo aparece no painel;
●	saldo considera ganhos e gastos;
●	atualização é automática.
Prioridade
P0
Dependências
Registro de lançamentos
________________________________________
História 6.2 — Exibir ganhos e gastos por período
Como usuário
 quero ver meus números por dia, semana e mês
 para acompanhar meu desempenho.
Critérios de aceite
●	filtro por período;
●	total de ganhos visível;
●	total de gastos visível;
●	lucro visível.
Prioridade
P0
Dependências
Histórico de lançamentos
________________________________________
História 6.3 — Exibir categorias de despesa
Como usuário
 quero ver onde estou gastando mais
 para tomar decisões melhores.
Critérios de aceite
●	categorias aparecem no painel;
●	valores por categoria são calculados;
●	gráficos ou listas mostram distribuição.
Prioridade
P1
Dependências
Classificação de lançamentos
________________________________________
História 6.4 — Gerar resumo financeiro
Como usuário
 quero receber um resumo simples
 para entender rapidamente meu resultado.
Critérios de aceite
●	resumo diário funciona;
●	resumo semanal funciona;
●	resumo mensal funciona;
●	linguagem simples.
Prioridade
P0
Dependências
Registro de lançamentos
________________________________________
Épico 7 — Histórico de lançamentos
História 7.1 — Listar lançamentos
Como usuário
 quero ver meu histórico
 para revisar o que já registrei.
Critérios de aceite
●	lista de transações aparece;
●	mostra data, valor, categoria e tipo;
●	ordenação por data funciona.
Prioridade
P0
Dependências
Registro de lançamentos
________________________________________
História 7.2 — Filtrar lançamentos
Como usuário
 quero filtrar lançamentos
 para encontrar informações específicas.
Critérios de aceite
●	filtro por período;
●	filtro por categoria;
●	filtro por tipo (ganho/gasto);
●	filtro por contexto (pessoal/trabalho).
Prioridade
P1
Dependências
Listagem de lançamentos
________________________________________
Épico 8 — Mensageria e respostas automáticas
História 8.1 — Confirmar lançamento com linguagem natural
Como usuário
 quero receber uma resposta clara
 para saber que o sistema entendeu minha mensagem.
Critérios de aceite
●	resposta curta;
●	resposta amigável;
●	resposta confirma valor e tipo;
●	resposta sugere correção se necessário.
Prioridade
P0
Dependências
Processamento de mensagens
________________________________________
História 8.2 — Solicitar esclarecimento quando faltar dado
Como sistema
 quero pedir mais informações quando a mensagem estiver incompleta
 para evitar erros.
Critérios de aceite
●	sistema detecta falta de valor ou contexto;
●	pede esclarecimento;
●	não salva dado incompleto.
Prioridade
P0
Dependências
Interpretação de mensagem
________________________________________
História 8.3 — Responder perguntas do usuário
Como usuário
 quero perguntar coisas como “quanto gastei hoje?”
 para receber um resumo imediato.
Critérios de aceite
●	sistema entende perguntas simples;
●	responde com total correto;
●	mensagem é clara.
Prioridade
P1
Dependências
Relatórios e resumo
________________________________________
Épico 9 — Configurações do usuário
História 9.1 — Editar perfil
Como usuário
 quero alterar meus dados
 para manter meu cadastro atualizado.
Critérios de aceite
●	nome pode ser alterado;
●	cidade pode ser alterada;
●	tipo de atividade pode ser alterado;
●	mudanças são salvas.
Prioridade
P1
Dependências
Cadastro
________________________________________
História 9.2 — Definir categorias personalizadas
Como usuário
 quero criar categorias próprias
 para adaptar o sistema à minha realidade.
Critérios de aceite
●	adicionar categoria;
●	renomear categoria;
●	desativar categoria;
●	categoria aparece nas sugestões.
Prioridade
P2
Dependências
Classificação de lançamentos
________________________________________
História 9.3 — Definir preferências de notificação
Como usuário
 quero controlar o que o sistema me avisa
 para não receber mensagens desnecessárias.
Critérios de aceite
●	ativar/desativar lembretes;
●	configurar frequência;
●	salvar preferências.
Prioridade
P2
Dependências
Sistema de notificações
________________________________________
Épico 10 — Segurança, logs e auditoria
História 10.1 — Registrar logs de operação
Como sistema
 quero salvar logs das ações
 para facilitar auditoria e diagnóstico.
Critérios de aceite
●	log de mensagens recebidas;
●	log de lançamentos criados;
●	log de erros de processamento;
●	logs acessíveis pela equipe técnica.
Prioridade
P0
Dependências
Processamento geral do sistema
________________________________________
História 10.2 — Proteger dados sensíveis
Como sistema
 quero armazenar informações com segurança
 para proteger dados financeiros e pessoais.
Critérios de aceite
●	dados sigilosos não aparecem em texto aberto indevido;
●	tokens e chaves ficam protegidos;
●	acesso é controlado por autenticação.
Prioridade
P0
Dependências
Infraestrutura de autenticação
________________________________________
História 10.3 — Rastrear alterações
Como sistema
 quero registrar quem alterou o quê
 para manter histórico confiável.
Critérios de aceite
●	alteração de lançamento fica registrada;
●	exclusões ficam auditáveis;
●	dados anteriores podem ser consultados por admin.
Prioridade
P1
Dependências
Edição e exclusão de lançamentos
________________________________________
5. Backlog consolidado por prioridade
P0 — Essencial para o MVP
●	cadastro por telefone
●	completar perfil
●	definir perfil financeiro
●	conectar WhatsApp
●	receber mensagens de texto
●	responder automaticamente
●	registrar ganho
●	registrar gasto
●	classificar entrada/saída
●	classificar pessoal/profissional
●	receber foto de nota
●	OCR da nota
●	confirmar e salvar nota
●	saldo geral
●	resumo diário/semanal/mensal
●	listar lançamentos
●	solicitar esclarecimento quando faltar dado
●	logs básicos
●	proteção de dados
P1 — Importante logo após o MVP
●	editar lançamento
●	excluir lançamento
●	filtros avançados
●	categorias por gráfico
●	responder perguntas do usuário
●	editar perfil
●	rastrear alterações
P2 — Evolução e inteligência
●	aprender com correções
●	categorias personalizadas
●	preferências de notificação
●	automações de recomendação
P3 — Futuro avançado
●	integração bancária
●	múltiplos perfis
●	relatórios avançados
●	gamificação completa
●	analytics preditivo
________________________________________
6. Ordem recomendada de implementação
Se a gente fosse construir com disciplina, eu faria nessa ordem:
Fase A — Base
1.	cadastro
2.	perfil
3.	WhatsApp
4.	logs
5.	segurança
Fase B — Núcleo financeiro
6.	ganho e gasto por texto
7.	classificação pessoal/profissional
8.	histórico
9.	resumo financeiro
Fase C — Inteligência visual
10.	foto de nota
11.	OCR
12.	confirmação e salvamento
Fase D — Experiência de uso
13.	respostas automáticas melhores
14.	filtros
15.	edição e exclusão
________________________________________
7. Como esse backlog ajuda o desenvolvimento
Esse documento agora já permite:
●	organizar sprint;
●	distribuir tarefas;
●	estimar tempo;
●	montar MVP;
●	definir dependências;
●	criar tickets de desenvolvimento.

