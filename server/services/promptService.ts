import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROMPTS_FILE = path.join(__dirname, '../config/prompts.json')

export interface PromptConfig {
  id: string
  nome: string
  descricao: string
  prompt: string
  ativo: boolean
}

/**
 * Carrega prompts do arquivo de configuração
 */
export function carregarPrompts(): PromptConfig[] {
  try {
    if (fs.existsSync(PROMPTS_FILE)) {
      const data = fs.readFileSync(PROMPTS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Erro ao carregar prompts:', error)
  }
  
  // Retornar prompt padrão se não houver arquivo
  return [getPromptPadrao()]
}

/**
 * Salva prompts no arquivo de configuração
 */
export function salvarPrompts(prompts: PromptConfig[]): void {
  try {
    const dir = path.dirname(PROMPTS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2), 'utf-8')
  } catch (error) {
    console.error('Erro ao salvar prompts:', error)
    throw error
  }
}

/**
 * Obtém um prompt por ID
 */
export function obterPromptPorId(id: string): PromptConfig | null {
  const prompts = carregarPrompts()
  return prompts.find(p => p.id === id) || null
}

/**
 * Obtém o prompt ativo padrão
 */
export function obterPromptAtivo(): PromptConfig {
  const prompts = carregarPrompts()
  const promptAtivo = prompts.find(p => p.ativo)
  return promptAtivo || getPromptPadrao()
}

/**
 * Retorna o prompt padrão
 */
function getPromptPadrao(): PromptConfig {
  return {
    id: 'default',
    nome: 'Análise Padrão de Obras',
    descricao: 'Prompt padrão para análise de solicitações de obras rodoviárias',
    prompt: `Você é um especialista em análise de projetos de infraestrutura rodoviária. Analise a seguinte solicitação de obra e os documentos anexados.

INFORMAÇÕES DA SOLICITAÇÃO:
- Título: {titulo}
- Tipo de Obra: {tipoObra}
- Localização: {localizacao}
- Descrição: {descricao}

DOCUMENTOS ANEXADOS:
{arquivosInfo}

INSTRUÇÕES PARA ANÁLISE:
1. Analise os documentos PDFs fornecidos e extraia informações relevantes
2. Avalie a viabilidade técnica da obra proposta
3. Identifique possíveis problemas ou riscos
4. Sugira melhorias ou considerações importantes
5. Forneça uma análise detalhada e estruturada

FORMATO DO RELATÓRIO:
Gere um relatório estruturado em formato markdown com as seguintes seções:
- Resumo Executivo
- Análise dos Documentos
- Viabilidade Técnica
- Riscos Identificados
- Recomendações
- Conclusão

Seja detalhado e específico na análise.`,
    ativo: true
  }
}

/**
 * Substitui placeholders no prompt
 */
export function processarPrompt(promptTemplate: string, variaveis: Record<string, string>): string {
  let promptProcessado = promptTemplate
  
  for (const [key, value] of Object.entries(variaveis)) {
    const placeholder = `{${key}}`
    promptProcessado = promptProcessado.replace(new RegExp(placeholder, 'g'), value)
  }
  
  return promptProcessado
}
