# Configuração do Prisma

Este projeto agora usa Prisma com SQLite para gerenciar o banco de dados.

## Instalação e Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Gerar o Prisma Client

```bash
npm run prisma:generate
```

### 3. Criar o banco de dados e executar migrações

```bash
npm run prisma:migrate
```

Isso criará o banco de dados SQLite em `prisma/dev.db` e aplicará o schema.

## Scripts Disponíveis

- `npm run prisma:generate` - Gera o Prisma Client
- `npm run prisma:migrate` - Executa migrações do banco de dados
- `npm run prisma:studio` - Abre o Prisma Studio (interface visual para o banco)
- `npm run dev:server` - Inicia o servidor Express na porta 3001
- `npm run dev` - Inicia o frontend Vite
- `npm run dev:all` - Inicia frontend e backend simultaneamente (requer `concurrently`)

## Estrutura do Banco de Dados

### Modelo Solicitacao

- `id` - ID único (CUID)
- `titulo` - Título da solicitação
- `tipoObra` - Tipo de obra (duplicacao, recapeamento, etc)
- `localizacao` - Localização da obra
- `descricao` - Descrição detalhada
- `status` - Status da solicitação (pendente, em_analise, aprovada, rejeitada)
- `arquivos` - JSON array com URLs dos arquivos
- `createdBy` - ID do usuário que criou (opcional)
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

## API Endpoints

O servidor Express está disponível em `http://localhost:3001/api`:

- `GET /api/solicitacoes` - Lista todas as solicitações
- `GET /api/solicitacoes/:id` - Busca uma solicitação por ID
- `POST /api/solicitacoes` - Cria uma nova solicitação (com upload de arquivos)
- `PUT /api/solicitacoes/:id` - Atualiza uma solicitação
- `DELETE /api/solicitacoes/:id` - Deleta uma solicitação

## Upload de Arquivos

Os arquivos são salvos na pasta `uploads/` e servidos estaticamente em `/uploads`.

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
VITE_API_BASE_URL=http://localhost:3001/api
```

## Migrando para Produção

Para usar PostgreSQL ou MySQL em produção:

1. Altere o `provider` no `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql" // ou "mysql"
     url      = env("DATABASE_URL")
   }
   ```

2. Atualize a `DATABASE_URL` no `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
   ```

3. Execute as migrações:
   ```bash
   npm run prisma:migrate
   ```
