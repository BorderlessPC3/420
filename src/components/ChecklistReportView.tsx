import './ChecklistReportView.css'

const CHECKLIST_LABELS: Record<string, string> = {
  LOCALIZACAO: 'Localização do acesso conforme SRE vigente',
  KM_INICIO: 'KM+M do início (eixo do acesso)',
  KM_FIM: 'KM+M do final (eixo do acesso)',
  NOME_BR: 'Identificação da BR',
  COORDENADAS_GEORREFERENCIAIS_E: 'Coordenadas georreferenciais (E)',
  COORDENADAS_GEORREFERENCIAIS_N: 'Coordenadas georreferenciais (N)',
  TRACADO_FAIXA_DOMINIO: 'Traçado em faixa de domínio',
  COTAS_TEXTOS_LEGIVEIS: 'Cotas e textos legíveis',
  VERIFICACAO_ESCALA: 'Verificação de escala',
  MEMORIAL: 'Memorial descritivo',
  LARGURA_PISTA_DNIT: 'Largura de pista (padrão DNIT)',
  LEGENDAS: 'Legendação',
  ANOTACAO_NOTA: 'Anotação / Nota',
  SIGLA_ABREVIACAO: 'Siglas e abreviações',
  LOC_KM_PREFIXO: 'Localização km + prefixo',
  CARIMBO_CORRETO: 'Carimbo correto',
  LIMITE_PROPRIEDADE: 'Limite de propriedade',
  DELIMITACAO_DOMINIO_NAO_EDIFICANTE: 'Delimitação domínio não edificante',
  ART_PDF: 'ART em PDF',
  QTD_FOLHAS: 'Quantidade de folhas',
}

const CHECKLIST_ORDER = [
  'LOCALIZACAO', 'KM_INICIO', 'KM_FIM', 'NOME_BR',
  'COORDENADAS_GEORREFERENCIAIS_E', 'COORDENADAS_GEORREFERENCIAIS_N',
  'TRACADO_FAIXA_DOMINIO', 'COTAS_TEXTOS_LEGIVEIS', 'VERIFICACAO_ESCALA',
  'MEMORIAL', 'LARGURA_PISTA_DNIT', 'LEGENDAS', 'ANOTACAO_NOTA',
  'SIGLA_ABREVIACAO', 'LOC_KM_PREFIXO', 'CARIMBO_CORRETO',
  'LIMITE_PROPRIEDADE', 'DELIMITACAO_DOMINIO_NAO_EDIFICANTE', 'ART_PDF', 'QTD_FOLHAS',
]

function isAprovado(val: string): boolean {
  if (!val || typeof val !== 'string') return false
  const v = val.toLowerCase().trim()
  return v === 'aprovado' || v === 'conforme' || v === 'ok' || v === 'sim' || v === 'presente'
}

export interface ChecklistReportViewProps {
  data: Record<string, string>
  titulo: string
  localizacao?: string
  tipoObra?: string
  descricao?: string
}

export default function ChecklistReportView({
  data,
  titulo,
  localizacao,
  tipoObra,
  descricao,
}: ChecklistReportViewProps) {
  const rows = CHECKLIST_ORDER.filter((key) => key in data).map((key, index) => {
    const value = String(data[key] ?? '').trim()
    const aprovado = isAprovado(value)
    const situacao = aprovado ? 'Aprovado' : (value || '—')
    return {
      item: index + 1,
      documento: CHECKLIST_LABELS[key] || key,
      situacao,
      aprovado,
    }
  })

  return (
    <div className="checklist-report">
      <header className="checklist-report-header">
        <p className="checklist-report-empresa">BASEINFRA PROJETOS E CONSULTORIA</p>
        <h1 className="checklist-report-titulo">
          CHECKLIST DE DOCUMENTOS PARA PROCEDIMENTO DE SOLICITAÇÃO DE AUTORIZAÇÃO DE OCUPAÇÃO
        </h1>
      </header>

      <div className="checklist-report-protocolo">
        <span>Análise por IA</span>
        <span>Relatório de conformidade</span>
      </div>

      <div className="checklist-report-identificacao">
        <div className="checklist-report-campo">
          <span className="checklist-report-label">Título / Processo:</span>
          <span className="checklist-report-valor">{titulo}</span>
        </div>
        {localizacao && (
          <div className="checklist-report-campo">
            <span className="checklist-report-label">Localização:</span>
            <span className="checklist-report-valor">{localizacao}</span>
          </div>
        )}
        {tipoObra && (
          <div className="checklist-report-campo">
            <span className="checklist-report-label">Tipo de obra:</span>
            <span className="checklist-report-valor">{tipoObra}</span>
          </div>
        )}
        {descricao && (
          <div className="checklist-report-campo">
            <span className="checklist-report-label">Descrição:</span>
            <span className="checklist-report-valor">{descricao}</span>
          </div>
        )}
      </div>

      <div className="checklist-report-nota">
        <span className="checklist-report-nota-label">Nota:</span>
        <p>
          Itens analisados automaticamente pela IA com base nos documentos e plantas anexados.
          Situação “Aprovado” indica conformidade identificada na análise.
        </p>
      </div>

      <table className="checklist-report-table">
        <thead>
          <tr>
            <th className="col-item">ITEM</th>
            <th className="col-documento">TIPO DO DOCUMENTO / PROJETO NECESSÁRIOS</th>
            <th className="col-situacao">SITUAÇÃO</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.item}>
              <td className="col-item">{row.item}</td>
              <td className="col-documento">{row.documento}</td>
              <td className="col-situacao">
                <span className={row.aprovado ? 'situacao-aprovado' : 'situacao-outro'}>
                  {row.situacao}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
