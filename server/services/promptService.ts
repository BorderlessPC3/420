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
    nome: 'Checklist SysBaseInfra - IA Analista',
    descricao: 'Análise de plantas/documentos com checklist padronizado (Documentação SysBaseInfra)',
    prompt: `Você é um analista de projetos de infraestrutura rodoviária. Analise a solicitação e os documentos (PDFs) anexados e preencha o checklist de verificação.

INFORMAÇÕES DA SOLICITAÇÃO:
- Título: {titulo}
- Tipo de Obra: {tipoObra}
- Localização: {localizacao}
- Descrição: {descricao}

DOCUMENTOS ANEXADOS:
{arquivosInfo}

INSTRUÇÕES:
1. Extraia e valide as informações dos documentos/plantas.
2. Para cada item do checklist, indique conformidade ou preencha com o valor encontrado.
3. Retorne APENAS um objeto JSON válido, sem alterar os nomes dos campos. Use exatamente as chaves: LOCALIZACAO, KM_INICIO, KM_FIM, NOME_BR, COORDENADAS_GEORREFERENCIAIS_E, COORDENADAS_GEORREFERENCIAIS_N, TRACADO_FAIXA_DOMINIO, COTAS_TEXTOS_LEGIVEIS, VERIFICACAO_ESCALA, MEMORIAL, LARGURA_PISTA_DNIT, LEGENDAS, ANOTACAO_NOTA, SIGLA_ABREVIACAO, LOC_KM_PREFIXO, CARIMBO_CORRETO, LIMITE_PROPRIEDADE, DELIMITACAO_DOMINIO_NAO_EDIFICANTE, ART_PDF, QTD_FOLHAS.

Responda somente com o JSON, sem texto antes ou depois.`,
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
