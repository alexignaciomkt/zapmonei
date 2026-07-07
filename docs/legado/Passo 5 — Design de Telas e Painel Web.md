Passo 5 — Design de Telas e Painel Web (Dashboard)
Embora o WhatsApp seja a "porta de entrada" principal, o foco do Painel Web é a Reflexão e a Gestão. No WhatsApp o motorista registra; no painel, ele analisa se está ganhando dinheiro de verdade ou apenas trocando seis por meia dúzia.
Como o motorista acessa muito o celular entre uma corrida e outra, essas telas devem ser Mobile-First (focadas em celular), mas funcionarem bem no computador.
________________________________________
1. Diretrizes de Design (UI/UX)
●	Contraste Alto: O motorista pode estar sob sol forte; o texto deve ser fácil de ler.
●	Elementos Grandes: Facilidade para tocar nos botões com o carro parado.
●	Cores Semânticas: Verde para Ganhos, Vermelho para Gastos, Azul para Pessoal/Neutra.
●	Gráficos Simples: Nada de dashboards de bolsa de valores. Gráficos de barras e roscas simples.
________________________________________
2. Mapa de Telas (Sitemap)
1.	Login/Onboarding (Telefone + SMS)
2.	Dashboard Principal (O "Resumo da Ópera")
3.	Histórico/Extrato (Lista de tudo o que aconteceu)
4.	Detalhes do Lançamento (Edição e visualização da nota fiscal)
5.	Perfil e Veículo (Configurações)
________________________________________
3. Detalhamento das Telas
3.1 Tela Principal: Dashboard (O Painel do Piloto)
Esta é a tela que ele abre quando quer saber "como está o mês".
●	Topo: Filtro de período (Hoje, Semana, Mês).
●	Cards de Destaque:
○	Lucro Real (Líquido): O valor mais importante. Destacado em tamanho maior.
○	Ganhos Totais (Trabalho): Soma de tudo o que entrou.
○	Despesas de Trabalho: Soma de combustível, manutenção, etc.
●	Gráfico de "Saúde Financeira":
○	Uma barra comparativa: Quanto do que ganhei ficou para mim vs. Quanto foi para o carro.
●	Seção "Vida Pessoal":
○	Um card separado com os gastos pessoais para não misturar com o lucro do trabalho.
●	Atalho Rápido: Um botão de "Ajuda via WhatsApp" sempre visível.
________________________________________
3.2 Tela de Histórico (Extrato Inteligente)
Onde ele confere se o sistema entendeu bem o que ele mandou no WhatsApp.
●	Lista Cronológica: Itens agrupados por dia.
●	Visual de Cada Item:
○	Ícone da categoria (Ex: Bomba de combustível, ícone de dinheiro, saco de compras).
○	Badge de "Trabalho" ou "Pessoal".
○	Valor colorido (Verde ou Vermelho).
●	Filtros: Busca por "Combustível", "Uber", "Mercado".
●	Funcionalidade: Toque longo para "Trocar de Trabalho para Pessoal" rapidamente.
________________________________________
3.3 Tela de Detalhe de Lançamento
Aberto ao clicar em um item do histórico.
●	Dados: Valor, Data, Categoria, Tipo.
●	Mídia Associada: Se ele mandou foto da nota fiscal, a foto aparece aqui para conferência.
●	Edição: Campos simples para ajustar o valor ou a categoria caso a IA tenha errado.
●	Botão Excluir: Bem destacado para evitar erros no saldo.
________________________________________
3.4 Tela de Perfil e Configurações
Onde ele personaliza o "cérebro" do sistema.
●	Dados do Veículo: Modelo, placa (opcional), km inicial.
●	Alertas: "Me avisar no Zap todo dia às 21h para fechar o caixa".
●	Categorias: Lista de categorias que ele mais usa para o sistema aprender.
________________________________________
4. Visualização do Conceito (Protótipo de Baixa Fidelidade)
Imagine a tela do celular dividida assim:
text
Copy
__________________________________  
| [Ícone Menu]    Olá, Carlos! [ ] |  <-- Topo amigável  
|________________________________|  
|                                |  
|  LUCRO REAL ESTE MÊS           |  
|      R$ 3.450,00               |  <-- Valor central em destaque  
|   ( +12% que mês passado )     |  
|________________________________|  
| Ganhos Totais | Gastos Trabalho|  
|  R$ 5.800     |   R$ 2.350     |  <-- Métricas de negócio  
|_______________|________________|  
|                                |  
|  ONDE FOI O DINHEIRO? (Trabalho)|  
|  [||||||||||||||] Combustível  |  <-- Barras de progresso simples  
|  [||||          ] Manutenção   |  
|________________________________|  
|                                |  
|  ÚLTIMOS LANÇAMENTOS (Zap)     |  
|  - Posto Ipiranga | - R$ 150   |  <-- Histórico rápido  
|  - Corrida Uber   | + R$ 45    |  
|________________________________|  
|  [ DASHBOARD ]  [ HISTÓRICO ]  |  <-- Menu inferior  
|________________________________|  

________________________________________
5. Requisitos Técnicos do Painel (Frontend)
●	Progressive Web App (PWA): O usuário pode "instalar" o site como se fosse um app, sem precisar baixar da Play Store (diminui a barreira de entrada).
●	Offline First: Se ele estiver num túnel ou área sem sinal, o histórico carregado deve continuar visível.
●	Single Sign-On (SSO): Como ele já usa o telefone no Zap, o login deve ser via Magic Link ou código enviado por SMS/WhatsApp. Sem senhas difíceis.
________________________________________
6. O que entra no MVP (Telas)
Para o Passo 5, focaremos no essencial:
1.	Dashboard Resumo: Ganhos, Gastos e Lucro.
2.	Lista de Histórico: Ver o que foi salvo via Zap.
3.	Botão de Ajuste: Editar categoria/valor.

