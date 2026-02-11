import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

// Inicializar OpenAI apenas se a chave estiver configurada
let openai: OpenAI | null = null

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
} else {
  console.warn('⚠️  OPENAI_API_KEY não configurada. A funcionalidade de análise com IA não estará disponível.')
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
  return `Você é um especialista em análise de projetos de infraestrutura rodoviária. Analise a seguinte solicitação de obra e os documentos anexados.

INFORMAÇÕES DA SOLICITAÇÃO:
- Título: ${params.titulo}
- Tipo de Obra: ${params.tipoObra}
- Localização: ${params.localizacao}
- Descrição: ${params.descricao}

DOCUMENTOS ANEXADOS:
${params.arquivosPaths.length > 0 ? `Foram anexados ${params.arquivosPaths.length} documento(s) para análise.` : 'Nenhum documento foi anexado.'}

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

Seja detalhado e específico na análise.`
}

/**
 * Analisa uma solicitação usando ChatGPT
 */
export async function analisarSolicitacaoComIA(
  params: AnaliseSolicitacaoParams
): Promise<string> {
  if (!openai) {
    throw new Error('OPENAI_API_KEY não configurada. Configure a chave da API no arquivo .env')
  }

  try {
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

    // Chamar API do OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em análise de projetos de infraestrutura rodoviária. Forneça análises detalhadas e profissionais.'
        },
        {
          role: 'user',
          content: mensagemCompleta
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const relatorio = completion.choices[0]?.message?.content
    
    if (!relatorio) {
      throw new Error('A IA não retornou um relatório válido')
    }

    return relatorio
  } catch (error: any) {
    console.error('Erro ao analisar solicitação com IA:', error)
    
    if (error.code === 'insufficient_quota') {
      throw new Error('Cota da API OpenAI esgotada. Verifique sua conta.')
    }
    
    if (error.code === 'invalid_api_key') {
      throw new Error('Chave da API OpenAI inválida. Verifique a configuração.')
    }
    
    throw new Error(`Erro ao processar análise: ${error.message}`)
  }
}
