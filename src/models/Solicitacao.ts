export interface Solicitacao {
  id?: string
  titulo: string
  tipoObra: string
  localizacao: string
  descricao: string
  arquivos?: string[]
  status?: 'pendente' | 'em_analise' | 'aprovada' | 'rejeitada'
  relatorioIA?: string
  analisadoPorIA?: boolean
  analisadoEm?: Date
  createdAt?: Date
  updatedAt?: Date
  createdBy?: string
}

export interface SolicitacaoWithFiles extends Solicitacao {
  arquivosUrls?: string[]
}
