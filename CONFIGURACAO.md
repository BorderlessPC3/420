# Configuração do .env para Servidor AWS

## Passo a Passo

1. **Crie o arquivo `.env` na raiz do projeto**

   Na raiz do projeto (mesmo nível do `package.json`), crie um arquivo chamado `.env`

2. **Adicione a URL do seu servidor AWS**

   ```env
   VITE_API_BASE_URL=https://seu-servidor-aws.com/api
   ```

   **Exemplos:**
   - Se seu servidor está em `https://api.exemplo.com`, use:
     ```env
     VITE_API_BASE_URL=https://api.exemplo.com/api
     ```
   
   - Se seu servidor está em `https://abc123.execute-api.us-east-1.amazonaws.com/prod`, use:
     ```env
     VITE_API_BASE_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod
     ```

3. **Reinicie o servidor de desenvolvimento**

   Após criar ou modificar o arquivo `.env`, você precisa reiniciar o servidor:
   ```bash
   # Pare o servidor (Ctrl+C) e inicie novamente
   npm run dev
   ```

## Importante

- ✅ As variáveis devem começar com `VITE_` para funcionar no Vite
- ✅ Não coloque espaços ao redor do `=` no arquivo `.env`
- ✅ Não use aspas na URL (a menos que seja necessário)
- ✅ O arquivo `.env` não deve ser commitado no Git
- ✅ Para produção, configure as variáveis de ambiente no seu provedor de hospedagem

## Verificação

Para verificar se a configuração está funcionando, você pode adicionar temporariamente no console:

```typescript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
```

Isso deve mostrar a URL que você configurou.
