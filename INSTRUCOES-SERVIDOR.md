# Instruções para Iniciar o Servidor Backend

## Problema: "Failed to fetch"

Se você está recebendo o erro "Failed to fetch", significa que o servidor backend não está rodando.

## Solução:

### 1. Gerar o Prisma Client (primeira vez)
```bash
npm run prisma:generate
```

### 2. Criar o banco de dados (primeira vez)
```bash
npm run prisma:migrate
```

### 3. Iniciar o servidor backend

**Opção A: Apenas o servidor**
```bash
npm run dev:server
```

**Opção B: Frontend e Backend juntos**
```bash
npm run dev:all
```

### 4. Verificar se o servidor está rodando

Abra no navegador ou use curl:
```
http://localhost:3001/api/health
```

Você deve ver:
```json
{
  "status": "ok",
  "message": "Servidor rodando"
}
```

## Verificação de Problemas

### O servidor não inicia?

1. Verifique se a porta 3001 está livre:
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :3001
   ```

2. Verifique se o Prisma Client foi gerado:
   ```bash
   npm run prisma:generate
   ```

3. Verifique se o banco de dados está configurado corretamente no `.env`

### O frontend não consegue conectar?

1. Certifique-se de que o servidor está rodando na porta 3001
2. Verifique se a variável `VITE_API_BASE_URL` no `.env` está correta:
   ```
   VITE_API_BASE_URL=http://localhost:3001/api
   ```
3. Reinicie o servidor de desenvolvimento do frontend após alterar o `.env`

## Estrutura de Portas

- **Frontend (Vite)**: `http://localhost:5173` (porta padrão do Vite)
- **Backend (Express)**: `http://localhost:3001`
- **API Endpoints**: `http://localhost:3001/api/*`
