/**
 * Serviço de integração com OpenAI API
 */
import OpenAI from 'openai'
import type { ChatMessage, ChatCompletion } from './aiProvider.js'

let openaiClient: OpenAI | null = null

export function initializeOpenAI(apiKey: string): void {
  openaiClient = new OpenAI({
    apiKey,
  })
}

export async function createChatCompletion(
  messages: ChatMessage[],
  model: string,
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<ChatCompletion> {
  if (!openaiClient) {
    throw new Error('OpenAI client não inicializado. Chame initializeOpenAI primeiro.')
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      model,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4000,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('OpenAI não retornou uma resposta válida')
    }

    return {
      content,
      model: completion.model,
      provider: 'openai',
    }
  } catch (error: any) {
    console.error('Erro ao chamar OpenAI API:', error)

    // Tratamento de erros específicos do OpenAI
    if (error.code === 'insufficient_quota') {
      throw new Error('Cota da API OpenAI esgotada. Verifique sua conta.')
    }

    if (error.code === 'invalid_api_key') {
      throw new Error('Chave da API OpenAI inválida. Verifique a configuração.')
    }

    if (error.status === 429) {
      throw new Error('Limite de requisições do OpenAI excedido. Tente novamente mais tarde.')
    }

    throw new Error(`Erro ao processar análise com OpenAI: ${error.message || 'Erro desconhecido'}`)
  }
}
