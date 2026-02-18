# Configuração do Groq para Análise de Solicitações

Este projeto agora suporta **Groq** como provider inicial de IA, com migração fácil para OpenAI no futuro.

## Por que Groq?

- **Alta velocidade**: Processamento muito rápido
- **Custo eficiente**: Ideal para desenvolvimento e testes
- **Modelos open-source**: Suporta Llama, Mixtral, etc.
- **Fácil migração**: Estrutura preparada para trocar para OpenAI quando necessário

## Configuração Inicial

### 1. Obter Chave da API Groq

1. Acesse [https://console.groq.com/](https://console.groq.com/)
2. Crie uma conta ou faça login
3. Vá em **API Keys** e gere uma nova chave
4. Adicione no arquivo `.env`:

```env
GROQ_API_KEY=sua_chave_groq_aqui
GROQ_MODEL=llama-3.3-70b-versatile
```

### 2. Modelos Disponíveis no Groq

**Modelos Atuais (2026):**
- `llama-3.3-70b-versatile` (recomendado) - Mais completo, alta qualidade
- `llama-3.1-8b-instant` - Mais rápido, boa para testes
- `openai/gpt-oss-120b` - Alternativa poderosa
- `openai/gpt-oss-20b` - Alternativa rápida

**Nota:** O modelo `llama-3.1-70b-versatile` foi descontinuado. Use `llama-3.3-70b-versatile` como substituição.

### 3. Estrutura de Providers

O sistema detecta automaticamente qual provider usar:

**Prioridade:**
1. Se `GROQ_API_KEY` estiver configurado → usa Groq
2. Caso contrário, se `OPENAI_API_KEY` estiver configurado → usa OpenAI
3. Se nenhum estiver configurado → erro

## Migração para OpenAI

Quando quiser migrar para OpenAI:

1. **Opção 1: Remover Groq** (usa OpenAI automaticamente)
   ```env
   # Comente ou remova estas linhas:
   # GROQ_API_KEY=...
   # GROQ_MODEL=...
   
   # Configure OpenAI:
   OPENAI_API_KEY=sua_chave_openai
   OPENAI_MODEL=gpt-4o
   ```

2. **Opção 2: Manter ambos** (Groq tem prioridade)
   - O sistema sempre usa Groq se `GROQ_API_KEY` estiver configurado
   - Para forçar OpenAI, remova temporariamente `GROQ_API_KEY`

## Arquivos Criados

### `server/services/aiProvider.ts`
- Detecta qual provider usar
- Interface comum para ambos os providers
- Configuração centralizada

### `server/services/groqService.ts`
- Integração com Groq API
- Tratamento de erros específicos
- Interface compatível com OpenAI

### `server/services/openaiService.ts`
- Integração com OpenAI API
- Mantido para migração futura
- Mesma interface que Groq

### `server/services/aiService.ts` (Refatorado)
- Usa a estrutura de providers
- Suporta Groq e OpenAI transparentemente
- Função `getAIProviderInfo()` para verificar qual está ativo

## Verificar Provider Ativo

O servidor mostra no console qual provider foi inicializado:

```
✅ Groq inicializado com modelo: llama-3.1-70b-versatile
```

Ou:

```
✅ OpenAI inicializado com modelo: gpt-4o
```

## Endpoint de Informações

Você pode adicionar um endpoint para verificar o provider:

```typescript
// GET /api/ai/info
app.get('/api/ai/info', (req, res) => {
  const info = getAIProviderInfo()
  res.json(info)
})
```

## Vantagens da Estrutura

✅ **Flexibilidade**: Troca fácil entre providers
✅ **Manutenibilidade**: Código organizado e separado
✅ **Testabilidade**: Fácil testar com diferentes providers
✅ **Escalabilidade**: Fácil adicionar novos providers no futuro

## Exemplo de Uso

O uso permanece o mesmo, independente do provider:

```typescript
import { analisarSolicitacaoComIA } from './services/aiService'

const relatorio = await analisarSolicitacaoComIA({
  titulo: "Duplicação BR-101",
  tipoObra: "duplicacao",
  localizacao: "BR-101, km 45 ao km 78",
  descricao: "...",
  arquivosPaths: ["/path/to/file.pdf"],
})
```

O sistema automaticamente usa Groq ou OpenAI conforme configurado!

## Troubleshooting

### Erro: "Nenhuma chave de API configurada"
- Verifique se `GROQ_API_KEY` ou `OPENAI_API_KEY` está no `.env`
- Reinicie o servidor após alterar o `.env`

### Erro: "Chave da API Groq inválida"
- Verifique se a chave está correta
- Certifique-se de que não há espaços extras
- Verifique se a chave não expirou no console do Groq

### Quer usar OpenAI mesmo com Groq configurado?
- Comente temporariamente `GROQ_API_KEY` no `.env`
- Ou remova a linha completamente
- Reinicie o servidor
