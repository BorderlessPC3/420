import { apiClient } from '../api/apiClient'

export interface LoginResponse {
  token?: string
  user?: {
    id: string
    email: string
    name?: string
  }
  message?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    })

    // Se houver token na resposta, você pode salvá-lo aqui
    if (response.data.token) {
      // Exemplo: localStorage.setItem('token', response.data.token)
      // ou usar um serviço de storage
    }

    return response.data
  } catch (error: any) {
    // Tratamento de erros da API
    if (error.response) {
      // Erro com resposta do servidor
      const message =
        error.response.data?.message || 'Erro ao fazer login'
      throw new Error(message)
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão. Verifique sua internet.')
    } else {
      // Outro tipo de erro
      throw new Error('Erro inesperado ao fazer login')
    }
  }
}

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout')
    // Limpar token do storage
    // localStorage.removeItem('token')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}
