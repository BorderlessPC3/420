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

    // Tratamento de erros específicos do Groq
    if (error.status === 401) {
      throw new Error('Chave da API Groq inválida. Verifique a configuração.')
    }

    if (error.status === 429) {
      throw new Error('Limite de requisições do Groq excedido. Tente novamente mais tarde.')
    }

    if (error.status === 400) {
      // Verificar se é erro de modelo descontinuado
      const errorMessage = error.message || ''
      if (errorMessage.includes('decommissioned') || errorMessage.includes('model_decommissioned')) {
        throw new Error(
          'O modelo configurado foi descontinuado pelo Groq. Atualize GROQ_MODEL no arquivo .env para um modelo válido (ex: llama-3.3-70b-versatile ou llama-3.1-8b-instant)'
        )
      }
      throw new Error(`Erro na requisição ao Groq: ${error.message || 'Requisição inválida'}`)
    }

    throw new Error(`Erro ao processar análise com Groq: ${error.message || 'Erro desconhecido'}`)
  }
}
