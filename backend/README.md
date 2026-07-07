# ZapMonei V2 - Backend API

Esta é a API de backend do **ZapMonei V2**, desenvolvida com Node.js, Express, TypeScript e Prisma ORM.

## Arquitetura Oficial
*   **PostgreSQL** é a única fonte oficial de dados e estado do sistema.
*   **Prisma ORM** é o único ORM e a única forma de acesso ao banco de dados pelo backend.
*   **Acesso Indireto:** Nenhum outro componente externo (n8n, Evolution, frontend) acessa o banco diretamente. Todos interagem por meio da API de backend.

### Fluxo de Dados Oficial
```
WhatsApp ──> Evolution ──> n8n ──> API ──> Prisma ──> PostgreSQL
```


## Requisitos
*   Node.js 20 ou superior
*   Docker & Docker Compose (para rodar o Redis local de desenvolvimento)

## Instalação

1. Acesse o diretório `backend`:
   ```bash
   cd "ZapMonei - V2/backend"
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   *Nota: Edite o arquivo `.env` para apontar para a string de conexão real do PostgreSQL hospedado na VPS.*

## Execução em Desenvolvimento

1. Inicie a infraestrutura de cache local (apenas Redis):
   ```bash
   docker compose -f docker-compose.dev.yml up -d redis
   ```

2. Gere o cliente do Prisma ORM:
   ```bash
   npx prisma generate
   ```

3. Execute a API em modo hot-reload:
   ```bash
   npm run dev
   ```
   O servidor estará disponível em `http://localhost:3000`.

## Endpoints Disponíveis

*   `GET /`: Retorna metadados básicos de status da API.
*   `GET /health`: Health Check que valida a saúde da API e das conexões com o Postgres e o Redis.

## Compilação e Produção

Para testar a compilação do TypeScript:
```bash
npm run build
```

Para subir a aplicação completa e o Redis local utilizando Docker Compose:
```bash
docker compose -f docker-compose.dev.yml up --build -d app
```
