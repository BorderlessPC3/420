# Integração com ChatGPT para Análise de Solicitações

Este projeto inclui integração com a API do OpenAI (ChatGPT) para análise automática de solicitações de obras rodoviárias e geração de relatórios detalhados.

## Configuração

### 1. Obter Chave da API OpenAI

1. Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crie uma conta ou faça login
3. Gere uma nova chave de API
4. Adicione a chave no arquivo `.env`:

```env
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4o
```

### 2. Modelos Disponíveis

- `gpt-4o` (recomendado) - Mais preciso e capaz de processar PDFs melhor
- `gpt-4-turbo` - Alternativa rápida
- `gpt-3.5-turbo` - Mais econômico, mas menos preciso

## Como Funciona

### Processo de Análise

1. **Upload de PDFs**: Quando uma solicitação é criada, os PDFs são salvos no servidor
2. **Extração de Texto**: O sistema extrai o texto de todos os PDFs anexados
3. **Análise com IA**: O conteúdo é enviado para o ChatGPT com um prompt configurável
4. **Geração de Relatório**: A IA gera um relatório estruturado em markdown
5. **Armazenamento**: O relatório é salvo no banco de dados junto com a solicitação

### Endpoint de Análise

```http
POST /api/solicitacoes/:id/analisar
Content-Type: application/json

{
  "promptCustomizado": "opcional - prompt personalizado"
}
```

### Resposta

```json
{
  "id": "solicitacao-id",
  "titulo": "...",
  "relatorioIA": "# Relatório gerado pela IA\n\n...",
  "analisadoPorIA": true,
  "analisadoEm": "2026-02-11T14:00:00Z",
  "status": "em_analise"
}
```

## Sistema de Prompts

### Prompts Configuráveis

O sistema permite criar e gerenciar múltiplos prompts para diferentes tipos de análise:

#### Endpoints de Prompts

- `GET /api/prompts` - Listar todos os prompts
- `GET /api/prompts/:id` - Obter prompt específico
- `POST /api/prompts` - Criar novo prompt
- `PUT /api/prompts/:id` - Atualizar prompt

#### Estrutura de um Prompt

```json
{
  "id": "analise-detalhada",
  "nome": "Análise Detalhada com Foco em Custos",
  "descricao": "Análise focada em aspectos financeiros",
  "prompt": "Você é um especialista...",
  "ativo": true
}
```

#### Variáveis Disponíveis nos Prompts

- `{titulo}` - Título da solicitação
- `{tipoObra}` - Tipo de obra
- `{localizacao}` - Localização
- `{descricao}` - Descrição da solicitação
- `{arquivosInfo}` - Informações sobre arquivos anexados

### Exemplo de Uso no Frontend

```typescript
import { analisarSolicitacaoComIA } from './services/solicitacao/solicitacaoService'

// Análise com prompt padrão
const resultado = await analisarSolicitacaoComIA(solicitacaoId)

// Análise com prompt customizado
const resultado = await analisarSolicitacaoComIA(
  solicitacaoId,
  "Analise focando em aspectos ambientais..."
)
```

## Estrutura do Relatório

O relatório gerado pela IA segue este formato:

```markdown
# Resumo Executivo
[Resumo da análise]

# Análise dos Documentos
[Análise detalhada dos PDFs]

# Viabilidade Técnica
[Avaliação técnica]

# Riscos Identificados
[Lista de riscos]

# Recomendações
[Sugestões e melhorias]

# Conclusão
[Conclusão final]
```

## Limitações e Considerações

### Limites da API OpenAI

- **Tokens**: Cada análise consome tokens (aproximadamente 2000-4000 tokens por análise)
- **Custo**: O uso da API tem custo associado (verifique preços em [openai.com/pricing](https://openai.com/pricing))
- **Rate Limits**: A API tem limites de requisições por minuto

### Processamento de PDFs

- Apenas PDFs com texto extraível são processados
- PDFs escaneados (imagens) não são processados automaticamente
- Tamanho máximo recomendado: 50MB por arquivo

### Melhores Práticas

1. **Use prompts específicos** para obter análises mais relevantes
2. **Revise os relatórios** antes de tomar decisões importantes
3. **Monitore os custos** da API OpenAI
4. **Teste diferentes prompts** para encontrar o melhor formato

## Troubleshooting

### Erro: "Cota da API OpenAI esgotada"
- Verifique sua conta OpenAI e adicione créditos
- Considere usar um modelo mais barato (gpt-3.5-turbo)

### Erro: "Chave da API OpenAI inválida"
- Verifique se a chave está correta no `.env`
- Certifique-se de que reiniciou o servidor após alterar o `.env`

### Erro: "Não foi possível processar o PDF"
- Verifique se o PDF não está corrompido
- PDFs escaneados precisam de OCR antes do processamento

## Exemplo Completo

```typescript
// 1. Criar solicitação com PDFs
const solicitacao = await createSolicitacao({
  titulo: "Duplicação BR-101",
  tipoObra: "duplicacao",
  localizacao: "BR-101, km 45 ao km 78",
  descricao: "Duplicação de pista..."
}, [arquivoPDF1, arquivoPDF2])

// 2. Analisar com IA
const analisada = await analisarSolicitacaoComIA(solicitacao.id)

// 3. Visualizar relatório
console.log(analisada.relatorioIA)
```
