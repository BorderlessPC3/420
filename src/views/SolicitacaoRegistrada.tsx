import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Sparkles, FileText, ArrowRight } from 'lucide-react'
import './SolicitacaoRegistrada.css'

export default function SolicitacaoRegistrada() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { solicitacaoId?: string; titulo?: string } | null
  const titulo = state?.titulo || 'Solicitação'

  return (
    <div className="solicitacao-registrada-container">
      <div className="solicitacao-registrada-card">
        <div className="solicitacao-registrada-icon-success">
          <CheckCircle size={64} />
        </div>
        <h1 className="solicitacao-registrada-title">
          Solicitação registrada com sucesso
        </h1>
        <p className="solicitacao-registrada-subtitle">
          <strong>"{titulo}"</strong>
        </p>

        <div className="solicitacao-registrada-info">
          <div className="solicitacao-registrada-info-item">
            <Sparkles size={24} className="solicitacao-registrada-info-icon" />
            <div>
              <h2>Próximo passo: Primeira Análise</h2>
              <p>
                Será realizada a primeira análise por IA dos documentos e dados da obra.
                Você pode iniciar quando quiser pela lista de solicitações.
              </p>
            </div>
          </div>
          <div className="solicitacao-registrada-info-item">
            <FileText size={24} className="solicitacao-registrada-info-icon" />
            <div>
              <p>
                Na primeira análise você poderá adicionar PDFs e definir um prompt,
                se desejar. O relatório será gerado com base na documentação e no padrão definido.
              </p>
            </div>
          </div>
        </div>

        <div className="solicitacao-registrada-actions">
          <button
            type="button"
            className="solicitacao-registrada-btn-primary"
            onClick={() => navigate('/solicitacoes', { state: state?.solicitacaoId ? { abrirAnaliseId: state.solicitacaoId } : undefined })}
          >
            <Sparkles size={20} />
            Ir para Primeira Análise
          </button>
          <button
            type="button"
            className="solicitacao-registrada-btn-secondary"
            onClick={() => navigate('/solicitacoes')}
          >
            <ArrowRight size={20} />
            Ver todas as solicitações
          </button>
        </div>
      </div>
    </div>
  )
}
