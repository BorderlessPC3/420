/**
 * Serviço de análise de solicitações com IA (Groq ou OpenAI)
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
    console.warn(`⚠️  IA não configurada: ${error.message}`)
    console.warn(`⚠️  Configure GROQ_API_KEY ou OPENAI_API_KEY no arquivo .env`)
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
  cliente?: string
  kilometragem?: string
  nroProcessoErp?: string
  rodovia?: string
  nomeConcessionaria?: string
  sentido?: string
  ocupacao?: string
  municipioEstado?: string
  ocupacaoArea?: string
  responsavelTecnico?: string
  faseProjeto?: string
  analistaResponsavel?: string
  memorial?: string
  dataRecebimento?: string
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

const v = (s: string | undefined) => s ?? 'não informado'

/**
 * Gera o prompt padrão para análise de solicitações (comparação formulário x PDFs)
 */
function gerarPromptPadrao(params: AnaliseSolicitacaoParams): string {
  return `Você é um analista de projetos de infraestrutura rodoviária. Sua tarefa é COMPARAR as informações preenchidas no formulário com o conteúdo dos PDFs anexados.

DADOS DO FORMULÁRIO:
- Cliente: ${v(params.cliente)}
- Kilometragem: ${v(params.kilometragem)}
- Nro Processo ERP: ${v(params.nroProcessoErp)}
- Rodovia: ${v(params.rodovia)}
- Nome Concessionária: ${v(params.nomeConcessionaria)}
- Sentido: ${v(params.sentido)}
- Ocupação: ${v(params.ocupacao)}
- Município - Estado: ${v(params.municipioEstado)}
- Ocupação Área: ${v(params.ocupacaoArea)}
- Responsável Técnico: ${v(params.responsavelTecnico)}
- Fase do Projeto: ${v(params.faseProjeto)}
- Analista Responsável: ${v(params.analistaResponsavel)}
- Memorial: ${v(params.memorial)}
- Data de Recebimento: ${v(params.dataRecebimento)}
- Título: ${params.titulo}
- Tipo de Obra: ${params.tipoObra}
- Localização: ${params.localizacao}
- Descrição: ${params.descricao}

DOCUMENTOS ANEXADOS:
${params.arquivosPaths.length > 0 ? `Foram anexados ${params.arquivosPaths.length} documento(s) para análise.` : 'Nenhum documento foi anexado.'}

INSTRUÇÕES:
1. Compare cada informação do formulário com o que consta nos PDFs.
2. Para cada item do checklist, use "ok" quando batem ou "informações não batem; [motivo]" quando há divergência.
3. Retorne APENAS um objeto JSON válido com as chaves: LOCALIZACAO, KM_INICIO, KM_FIM, NOME_BR, COORDENADAS_GEORREFERENCIAIS_E, COORDENADAS_GEORREFERENCIAIS_N, TRACADO_FAIXA_DOMINIO, COTAS_TEXTOS_LEGIVEIS, VERIFICACAO_ESCALA, MEMORIAL, LARGURA_PISTA_DNIT, LEGENDAS, ANOTACAO_NOTA, SIGLA_ABREVIACAO, LOC_KM_PREFIXO, CARIMBO_CORRETO, LIMITE_PROPRIEDADE, DELIMITACAO_DOMINIO_NAO_EDIFICANTE, ART_PDF, QTD_FOLHAS.

Responda somente com o JSON, sem texto antes ou depois.`
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
    const completion =
      provider === 'groq'
        ? await groqChatCompletion(messages, config.model, {
            temperature: 0.7,
            maxTokens: 4000,
          })
        : await openaiChatCompletion(messages, config.model, {
            temperature: 0.7,
            maxTokens: 4000,
          })

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
