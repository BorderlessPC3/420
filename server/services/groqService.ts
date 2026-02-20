/**
 * Serviço de integração com Groq API
 */
import Groq from 'groq-sdk'
import type { ChatMessage, ChatCompletion } from './aiProvider.js'

let groqClient: Groq | null = null

export function initializeGroq(apiKey: string): void {
  groqClient = new Groq({
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
  if (!groqClient) {
    throw new Error('Groq client não inicializado. Chame initializeGroq primeiro.')
  }

  try {
    const completion = await groqClient.chat.completions.create({
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
      throw new Error('Groq não retornou uma resposta válida')
    }

    return {
      content,
      model: completion.model,
      provider: 'groq',
    }
  } catch (error: any) {
    console.error('Erro ao chamar Groq API:', error)
    throw new Error(`Erro ao processar análise com Groq: ${error.message || 'Erro desconhecido'}`)
  }
}
