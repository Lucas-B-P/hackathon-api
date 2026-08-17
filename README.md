# Patinhas API

API REST do Patinhas Pet Shop, construída com Node.js, Express e PostgreSQL (`pg`), sem ORM.

## Como executar

1. Crie um banco PostgreSQL chamado `patinhas`.
2. Copie `.env.example` para `.env` e ajuste `DATABASE_URL`.
3. Instale as dependências:

```bash
npm install
```

4. Execute as migrations:

```bash
npm run db:migrate
```

5. Inicie a API:

```bash
npm run dev
```

## Testes

Execute a suíte com:

```bash
npm test
```

Os testes HTTP não dependem de dados pré-cadastrados. O teste do healthcheck é de integração e é ignorado automaticamente quando o PostgreSQL de teste não está disponível.

Endpoints iniciais:

- `GET /` — informações da API
- `GET /api/health` — verifica API e conexão com o banco

## Organização

- `src/config` — configuração e variáveis de ambiente
- `src/database` — pool PostgreSQL e migrations
- `src/middlewares` — middlewares HTTP compartilhados
- `src/modules` — módulos organizados por domínio, com rotas, controllers e services
- `src/app.js` — composição do Express
- `src/server.js` — inicialização e encerramento gracioso

As queries devem usar parâmetros (`$1`, `$2`, etc.) e transações devem usar uma conexão obtida com `pool.connect()`.
