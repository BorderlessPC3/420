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
  // Overview Dados do cliente
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

export interface SolicitacaoWithFiles extends Solicitacao {
  arquivosUrls?: string[]
}
