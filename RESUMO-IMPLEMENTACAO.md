# Resumo da Implementação - Análise de Solicitações com IA

Este documento resume todas as mudanças e configurações realizadas para implementar a análise de solicitações com ChatGPT.

---

## 1. Configuração do Banco de Dados (Prisma)

### Schema Atualizado (`prisma/schema.prisma`)

Foram adicionados novos campos ao modelo `Solicitacao`:

```prisma
model Solicitacao {
  id              String   @id @default(cuid())
  titulo          String
  tipoObra        String
  localizacao     String
  descricao       String
  status          String   @default("pendente")
  arquivos        String?  // JSON array de URLs dos arquivos
  relatorioIA     String?  // ✨ NOVO: Relatório gerado pela IA
  analisadoPorIA  Boolean  @default(false)  // ✨ NOVO: Flag de análise
  analisadoEm     DateTime?  // ✨ NOVO: Data da análise
  createdBy       String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("solicitacoes")
}
```

### Migração Aplicada

- **Nome da migração**: `20260211140244_add_ai_report_fields`
- **Arquivo**: `prisma/migrations/20260211140244_add_ai_report_fields/migration.sql`

A migração adiciona as colunas:
- `relatorioIA` (TEXT, nullable)
- `analisadoPorIA` (BOOLEAN, default false)
- `analisadoEm` (TIMESTAMP, nullable)

### Comandos Executados

```bash
npm run prisma:migrate -- --name add_ai_report_fields
npm run prisma:generate
```

---

## 2. Configuração da API OpenAI

### Variáveis de Ambiente (`.env`)

Adicionadas as seguintes variáveis:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o
```

**Como obter a chave:**
1. Acesse https://platform.openai.com/api-keys
2. Crie uma conta ou faça login
3. Gere uma nova chave de API
4. Substitua `your_openai_api_key_here` pela sua chave

### Dependências Instaladas

```bash
npm install openai pdf-parse
```

- **openai**: Cliente oficial da OpenAI para Node.js
- **pdf-parse**: Biblioteca para extrair texto de arquivos PDF

### Serviço de IA (`server/services/aiService.ts`)

#### Funcionalidades Implementadas:

1. **Extração de Texto de PDFs**
   ```typescript
   async function extrairTextoPDF(filePath: string): Promise<string>
   ```
   - Lê arquivos PDF do sistema de arquivos
   - Extrai o texto usando `pdf-parse`
   - Retorna o texto extraído

2. **Processamento de Múltiplos PDFs**
   ```typescript
   async function processarPDFs(arquivosPaths: string[]): Promise<string[]>
   ```
   - Processa todos os PDFs de uma solicitação
   - Retorna array com textos extraídos
   - Trata erros individualmente

3. **Análise com ChatGPT**
   ```typescript
   export async function analisarSolicitacaoComIA(
     params: AnaliseSolicitacaoParams
   ): Promise<string>
   ```
   - Envia dados da solicitação + textos dos PDFs para ChatGPT
   - Usa modelo configurável (padrão: gpt-4o)
   - Gera relatório estruturado em markdown
   - Trata erros específicos (quota, chave inválida, etc.)

#### Parâmetros de Análise:

```typescript
interface AnaliseSolicitacaoParams {
  titulo: string
  tipoObra: string
  localizacao: string
  descricao: string
  arquivosPaths: string[]
  promptCustomizado?: string
}
```

#### Configuração do Modelo:

- **Modelo padrão**: `gpt-4o` (mais preciso)
- **Alternativas**: `gpt-4-turbo`, `gpt-3.5-turbo` (mais econômico)
- **Temperature**: 0.7 (balanceado entre criatividade e precisão)
- **Max tokens**: 4000 (permite relatórios detalhados)

### Endpoint de Análise (`server/index.ts`)

**Rota**: `POST /api/solicitacoes/:id/analisar`

**Funcionalidades:**
- Busca a solicitação pelo ID
- Converte URLs de arquivos para caminhos locais
- Processa PDFs automaticamente
- Usa prompt padrão ou customizado
- Atualiza status para "em_analise"
- Salva relatório no banco de dados
- Retorna solicitação atualizada

**Request Body:**
```json
{
  "promptCustomizado": "opcional - prompt personalizado"
}
```

**Response:**
```json
{
  "id": "solicitacao-id",
  "titulo": "...",
  "relatorioIA": "# Relatório gerado pela IA\n\n...",
  "analisadoPorIA": true,
  "analisadoEm": "2026-02-11T14:00:00Z",
  "status": "em_analise",
  ...
}
```

### Sistema de Prompts (`server/services/promptService.ts`)

#### Funcionalidades:

1. **Gerenciamento de Prompts**
   - Carrega prompts do arquivo `server/config/prompts.json`
   - Permite criar, atualizar e listar prompts
   - Suporta prompts ativos/inativos

2. **Variáveis Disponíveis**
   - `{titulo}` - Título da solicitação
   - `{tipoObra}` - Tipo de obra
   - `{localizacao}` - Localização
   - `{descricao}` - Descrição
   - `{arquivosInfo}` - Informações sobre arquivos

3. **Endpoints de Prompts**
   - `GET /api/prompts` - Listar todos
   - `GET /api/prompts/:id` - Obter por ID
   - `POST /api/prompts` - Criar novo
   - `PUT /api/prompts/:id` - Atualizar

#### Arquivo de Configuração (`server/config/prompts.json`)

Contém prompts pré-configurados:
- **default**: Análise padrão de obras rodoviárias
- **analise-detalhada**: Análise focada em custos

---

## 3. Parte de Solicitações (Frontend)

### Modelo TypeScript Atualizado (`src/models/Solicitacao.ts`)

```typescript
export interface Solicitacao {
  id?: string
  titulo: string
  tipoObra: string
  localizacao: string
  descricao: string
  arquivos?: string[]
  status?: 'pendente' | 'em_analise' | 'aprovada' | 'rejeitada'
  relatorioIA?: string  // ✨ NOVO
  analisadoPorIA?: boolean  // ✨ NOVO
  analisadoEm?: Date  // ✨ NOVO
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
}
```

### Serviço Atualizado (`src/services/solicitacao/solicitacaoService.ts`)

#### Nova Função Adicionada:

```typescript
export const analisarSolicitacaoComIA = async (
  id: string,
  promptCustomizado?: string
): Promise<SolicitacaoWithFiles>
```

**Funcionalidades:**
- Envia requisição POST para `/api/solicitacoes/:id/analisar`
- Suporta prompt customizado opcional
- Retorna solicitação atualizada com relatório

### Componentes Criados

#### 1. RelatorioViewer (`src/components/RelatorioViewer.tsx`)

**Propósito**: Visualizar relatórios gerados pela IA em formato markdown

**Props:**
```typescript
interface RelatorioViewerProps {
  relatorio: string  // Conteúdo markdown do relatório
  titulo: string     // Título da solicitação
  onClose: () => void  // Callback para fechar
}
```

**Características:**
- Modal fullscreen responsivo
- Renderização de markdown com `react-markdown`
- Suporte a tabelas, listas, código, etc.
- Scroll automático para conteúdo longo
- Botão de fechar

#### 2. ModalReanalise (`src/components/ModalReanalise.tsx`)

**Propósito**: Modal para reanalisar solicitações com prompt customizado

**Props:**
```typescript
interface ModalReanaliseProps {
  titulo: string
  onConfirm: (promptCustomizado?: string) => Promise<void>
  onClose: () => void
}
```

**Características:**
- Checkbox para escolher prompt customizado
- Textarea para inserir prompt personalizado
- Validação de campos
- Estados de loading
- Tratamento de erros

### Página de Solicitações Atualizada (`src/views/Solicitacoes.tsx`)

#### Novos Estados:

```typescript
const [relatorioAberto, setRelatorioAberto] = useState<{ relatorio: string; titulo: string } | null>(null)
const [modalReanaliseAberto, setModalReanaliseAberto] = useState<SolicitacaoWithFiles | null>(null)
const [analisandoId, setAnalisandoId] = useState<string | null>(null)
```

#### Novas Funcionalidades:

1. **Badge de Análise por IA**
   - Mostra quando uma solicitação foi analisada
   - Exibe data da análise
   - Ícone Sparkles para identificação visual

2. **Botão "Ver Relatório"**
   - Aparece apenas quando há relatório disponível
   - Abre modal com visualização formatada

3. **Botão "Reanalisar"**
   - Disponível para todas as solicitações
   - Abre modal para configurar nova análise
   - Mostra estado de loading durante processamento

4. **Atualização Automática**
   - Lista atualiza após reanálise
   - Novo relatório é exibido automaticamente

### Estilos Adicionados (`src/views/Solicitacoes.css`)

```css
/* Badge de análise por IA */
.solicitacao-ia-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  margin-top: 12px;
  font-size: 13px;
  color: #1e40af;
}

/* Botões de ação */
.solicitacao-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-ver-relatorio {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-reanalisar {
  background-color: #3b82f6;
  color: white;
}
```

### Dependências Frontend Instaladas

```bash
npm install react-markdown remark-gfm
```

- **react-markdown**: Renderiza markdown em React
- **remark-gfm**: Suporte a GitHub Flavored Markdown (tabelas, etc.)

---

## Fluxo Completo de Análise

### 1. Criar Solicitação
```
Usuário preenche formulário → Upload de PDFs → POST /api/solicitacoes
```

### 2. Analisar Solicitação
```
Clique em "Reanalisar" → Escolhe prompt → POST /api/solicitacoes/:id/analisar
→ Servidor processa PDFs → Envia para OpenAI → Salva relatório → Retorna resultado
```

### 3. Visualizar Relatório
```
Clique em "Ver Relatório" → Abre modal → Renderiza markdown formatado
```

---

## Estrutura de Arquivos Criados/Modificados

### Backend
```
server/
├── services/
│   ├── aiService.ts          ✨ NOVO
│   └── promptService.ts      ✨ NOVO
├── config/
│   └── prompts.json          ✨ NOVO
└── index.ts                  ✏️ MODIFICADO
```

### Frontend
```
src/
├── components/
│   ├── RelatorioViewer.tsx   ✨ NOVO
│   ├── RelatorioViewer.css   ✨ NOVO
│   ├── ModalReanalise.tsx    ✨ NOVO
│   └── ModalReanalise.css   ✨ NOVO
├── models/
│   └── Solicitacao.ts        ✏️ MODIFICADO
├── services/
│   └── solicitacao/
│       └── solicitacaoService.ts  ✏️ MODIFICADO
└── views/
    ├── Solicitacoes.tsx      ✏️ MODIFICADO
    └── Solicitacoes.css      ✏️ MODIFICADO
```

### Banco de Dados
```
prisma/
├── schema.prisma             ✏️ MODIFICADO
└── migrations/
    └── 20260211140244_add_ai_report_fields/  ✨ NOVO
```

### Configuração
```
.env                          ✏️ MODIFICADO
package.json                   ✏️ MODIFICADO
```

---

## Exemplo de Uso

### 1. Analisar uma Solicitação

```typescript
import { analisarSolicitacaoComIA } from './services/solicitacao/solicitacaoService'

// Com prompt padrão
const resultado = await analisarSolicitacaoComIA('solicitacao-id')

// Com prompt customizado
const resultado = await analisarSolicitacaoComIA(
  'solicitacao-id',
  'Analise focando em aspectos ambientais e impacto ecológico'
)
```

### 2. Visualizar Relatório

O relatório gerado segue este formato markdown:

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

---

## Notas Importantes

### Limitações
- PDFs escaneados (imagens) não são processados automaticamente
- Tamanho máximo recomendado: 50MB por arquivo
- A API OpenAI tem limites de tokens e custos associados

### Segurança
- Chave da API deve estar no `.env` e nunca commitada
- Validação de tipos de arquivo no upload
- Tratamento de erros em todas as operações

### Performance
- Processamento de PDFs pode demorar para arquivos grandes
- Análise com IA pode levar alguns segundos
- Recomenda-se usar `gpt-3.5-turbo` para análises mais rápidas e econômicas

---

## Próximos Passos Sugeridos

1. Adicionar cache de relatórios para evitar reanálises desnecessárias
2. Implementar fila de processamento para múltiplas análises
3. Adicionar histórico de análises (múltiplos relatórios por solicitação)
4. Criar dashboard com estatísticas de análises
5. Implementar exportação de relatórios (PDF, DOCX)
