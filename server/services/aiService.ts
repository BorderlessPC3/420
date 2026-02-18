/**
 * Serviço de análise de solicitações com IA
 * Suporta Groq (padrão inicial) e OpenAI (migração futura)
 */
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { getAIConfig, detectAIProvider, type ChatMessage } from './aiProvider.js'
import { initializeGroq, createChatCompletion as groqChatCompletion } from './groqService.js'
import { initializeOpenAI, createChatCompletion as openaiChatCompletion } from './openaiService.js'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

// Inicializar provider de IA
let aiInitialized = false

function initializeAI() {
  if (aiInitialized) return

  try {
    const config = getAIConfig()
    
    if (config.provider === 'groq') {
      initializeGroq(config.apiKey)
      console.log(`✅ Groq inicializado com modelo: ${config.model}`)
    } else {
      initializeOpenAI(config.apiKey)
      console.log(`✅ OpenAI inicializado com modelo: ${config.model}`)
    }
    
    aiInitialized = true
  } catch (error: any) {
    // Não bloquear o servidor se a IA não estiver configurada
    console.warn(`⚠️  IA não configurada: ${error.message}`)
    console.warn(`⚠️  A funcionalidade de análise com IA não estará disponível até configurar GROQ_API_KEY ou OPENAI_API_KEY`)
  }
}

// Inicializar na importação do módulo (não bloqueia se falhar)
try {
  initializeAI()
} catch (error) {
  // Silenciosamente falha - o servidor ainda pode rodar sem IA
}

export interface AnaliseSolicitacaoParams {
  titulo: string
  tipoObra: string
  localizacao: string
  descricao: string
  arquivosPaths: string[]
  promptCustomizado?: string
}

/**
 * Extrai texto de um arquivo PDF
 */
async function extrairTextoPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    return data.text
  } catch (error) {
    console.error(`Erro ao extrair texto do PDF ${filePath}:`, error)
    throw new Error(`Não foi possível processar o PDF: ${path.basename(filePath)}`)
  }
}

/**
 * Processa múltiplos PDFs e retorna o texto extraído
 */
async function processarPDFs(arquivosPaths: string[]): Promise<string[]> {
  const textosPDFs: string[] = []
  
  for (const arquivoPath of arquivosPaths) {
    // Verificar se é PDF
    if (arquivoPath.toLowerCase().endsWith('.pdf')) {
      try {
        const texto = await extrairTextoPDF(arquivoPath)
        textosPDFs.push(`\n--- Conteúdo do arquivo ${path.basename(arquivoPath)} ---\n${texto}`)
      } catch (error) {
        console.error(`Erro ao processar PDF ${arquivoPath}:`, error)
        textosPDFs.push(`\n--- Erro ao processar arquivo ${path.basename(arquivoPath)} ---\n`)
      }
    } else {
      textosPDFs.push(`\n--- Arquivo ${path.basename(arquivoPath)} (não é PDF, apenas referência) ---\n`)
    }
  }
  
  return textosPDFs
}

/**
 * Gera o prompt padrão para análise de solicitações
 * Esta função é usada apenas como fallback se não houver prompt customizado
 */
function gerarPromptPadrao(params: AnaliseSolicitacaoParams): string {
  return `Você é um analista de projetos de infraestrutura rodoviária. Analise a solicitação e os documentos (PDFs) anexados e preencha o checklist de verificação.

INFORMAÇÕES DA SOLICITAÇÃO:
- Título: ${params.titulo}
- Tipo de Obra: ${params.tipoObra}
- Localização: ${params.localizacao}
- Descrição: ${params.descricao}

DOCUMENTOS ANEXADOS:
${params.arquivosPaths.length > 0 ? `Foram anexados ${params.arquivosPaths.length} documento(s) para análise.` : 'Nenhum documento foi anexado.'}

INSTRUÇÕES:
1. Extraia e valide as informações dos documentos/plantas.
2. Para cada item do checklist, indique conformidade ou preencha com o valor encontrado (texto ou número conforme o campo).
3. Retorne APENAS um objeto JSON válido, sem alterar os nomes dos campos. Use exatamente as chaves abaixo. Para itens conformes use o valor "Aprovado". Para não conformidades use "Não conformidade" ou descreva. Para dados (KM, BR, coordenadas) preencha com o valor encontrado.

FORMATO DE SAÍDA - OBJETO JSON (use exatamente estes nomes de campos):
{
  "LOCALIZACAO": "texto ou descrição",
  "KM_INICIO": "valor ou texto",
  "KM_FIM": "valor ou texto",
  "NOME_BR": "nome da BR",
  "COORDENADAS_GEORREFERENCIAIS_E": "valor",
  "COORDENADAS_GEORREFERENCIAIS_N": "valor",
  "TRACADO_FAIXA_DOMINIO": "conforme/não conforme ou observação",
  "COTAS_TEXTOS_LEGIVEIS": "conforme/não conforme ou observação",
  "VERIFICACAO_ESCALA": "conforme/não conforme ou observação",
  "MEMORIAL": "conforme/não conforme ou observação",
  "LARGURA_PISTA_DNIT": "valor ou observação",
  "LEGENDAS": "conforme/não conforme ou observação",
  "ANOTACAO_NOTA": "conforme/não conforme ou observação",
  "SIGLA_ABREVIACAO": "conforme/não conforme ou observação",
  "LOC_KM_PREFIXO": "conforme/não conforme ou observação",
  "CARIMBO_CORRETO": "conforme/não conforme ou observação",
  "LIMITE_PROPRIEDADE": "conforme/não conforme ou observação",
  "DELIMITACAO_DOMINIO_NAO_EDIFICANTE": "conforme/não conforme ou observação",
  "ART_PDF": "conforme/não conforme ou observação",
  "QTD_FOLHAS": "número ou texto"
}

Responda somente com o JSON, sem texto antes ou depois. Se algum dado não estiver disponível no documento, use "não informado" ou "não aplicável" no valor.`
}

/**
 * Analisa uma solicitação usando IA (Groq ou OpenAI)
 */
export async function analisarSolicitacaoComIA(
  params: AnaliseSolicitacaoParams
): Promise<string> {
  // Verificar se há provider configurado
  if (!aiInitialized) {
    try {
      initializeAI()
    } catch (error: any) {
      throw new Error(
        'Nenhum provider de IA configurado. Configure GROQ_API_KEY ou OPENAI_API_KEY no arquivo .env'
      )
    }
  }

  try {
    const config = getAIConfig()
    const provider = detectAIProvider()

    // Processar PDFs se houver
    let conteudoPDFs = ''
    if (params.arquivosPaths.length > 0) {
      const textosPDFs = await processarPDFs(params.arquivosPaths)
      conteudoPDFs = textosPDFs.join('\n\n')
    }

    // Usar prompt customizado ou padrão
    const promptBase = params.promptCustomizado || gerarPromptPadrao(params)
    
    // Construir mensagem completa
    const mensagemCompleta = `${promptBase}

${conteudoPDFs ? `\n\nCONTEÚDO DOS DOCUMENTOS:\n${conteudoPDFs}` : ''}

Por favor, gere o relatório de análise conforme as instruções acima.`

    // Preparar mensagens para o chat
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'Você é um especialista em análise de projetos de infraestrutura rodoviária. Forneça análises detalhadas e profissionais.'
      },
      {
        role: 'user',
        content: mensagemCompleta
      }
    ]

    // Chamar API do provider selecionado
    let completion
    if (provider === 'groq') {
      completion = await groqChatCompletion(messages, config.model, {
        temperature: 0.7,
        maxTokens: 4000,
      })
    } else {
      completion = await openaiChatCompletion(messages, config.model, {
        temperature: 0.7,
        maxTokens: 4000,
      })
    }

    console.log(`✅ Análise concluída usando ${completion.provider} (modelo: ${completion.model})`)

    return completion.content
  } catch (error: any) {
    console.error('Erro ao analisar solicitação com IA:', error)
    throw error
  }
}

/**
 * Obtém informações sobre o provider atual
 */
export function getAIProviderInfo(): { provider: string; model: string; available: boolean } {
  try {
    const config = getAIConfig()
    return {
      provider: config.provider,
      model: config.model,
      available: aiInitialized,
    }
  } catch {
    return {
      provider: 'none',
      model: 'none',
      available: false,
    }
  }
}
