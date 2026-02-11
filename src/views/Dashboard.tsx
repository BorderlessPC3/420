import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Plus,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { getAllSolicitacoes } from '../services/solicitacao/solicitacaoService'
import type { SolicitacaoWithFiles } from '../models/Solicitacao'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoWithFiles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSolicitacoes()
  }, [])

  const loadSolicitacoes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllSolicitacoes()
      setSolicitacoes(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados.'
      console.error('Erro ao carregar solicitações:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const total = solicitacoes.length
  const pendentes = solicitacoes.filter((s) => s.status === 'pendente').length
  const emAnalise = solicitacoes.filter((s) => s.status === 'em_analise').length
  const aprovadas = solicitacoes.filter((s) => s.status === 'aprovada').length
  const rejeitadas = solicitacoes.filter((s) => s.status === 'rejeitada').length
  const analisadasIA = solicitacoes.filter((s) => s.analisadoPorIA).length

  const ultimasSolicitacoes = [...solicitacoes]
    .sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return db - da
    })
    .slice(0, 5)

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'aprovada':
        return 'Aprovada'
      case 'rejeitada':
        return 'Rejeitada'
      case 'em_analise':
        return 'Em Análise'
      default:
        return 'Pendente'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'aprovada':
        return 'var(--dashboard-status-aprovada)'
      case 'rejeitada':
        return 'var(--dashboard-status-rejeitada)'
      case 'em_analise':
        return 'var(--dashboard-status-em-analise)'
      default:
        return 'var(--dashboard-status-pendente)'
    }
  }

  const formatDate = (date?: Date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="dashboard-spinner" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Visão geral das solicitações de obras
          </p>
        </div>
        <button
          className="dashboard-btn-nova"
          onClick={() => navigate('/nova-solicitacao')}
        >
          <Plus size={20} />
          Nova Solicitação
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={loadSolicitacoes} className="dashboard-btn-retry">
            Tentar novamente
          </button>
        </div>
      )}

      {!error && (
        <>
          <div className="dashboard-cards">
            <div className="dashboard-card dashboard-card-total">
              <div className="dashboard-card-icon">
                <FileText size={24} />
              </div>
              <div className="dashboard-card-content">
                <span className="dashboard-card-value">{total}</span>
                <span className="dashboard-card-label">Total de Solicitações</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-icon dashboard-card-icon-pendente">
                <Clock size={24} />
              </div>
              <div className="dashboard-card-content">
                <span className="dashboard-card-value">{pendentes}</span>
                <span className="dashboard-card-label">Pendentes</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-icon dashboard-card-icon-analise">
                <TrendingUp size={24} />
              </div>
              <div className="dashboard-card-content">
                <span className="dashboard-card-value">{emAnalise}</span>
                <span className="dashboard-card-label">Em Análise</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-icon dashboard-card-icon-aprovada">
                <CheckCircle size={24} />
              </div>
              <div className="dashboard-card-content">
                <span className="dashboard-card-value">{aprovadas}</span>
                <span className="dashboard-card-label">Aprovadas</span>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-icon dashboard-card-icon-rejeitada">
                <XCircle size={24} />
              </div>
              <div className="dashboard-card-content">
                <span className="dashboard-card-value">{rejeitadas}</span>
                <span className="dashboard-card-label">Rejeitadas</span>
              </div>
            </div>

            <div className="dashboard-card dashboard-card-ia">
              <div className="dashboard-card-icon dashboard-card-icon-ia">
                <Sparkles size={24} />
              </div>
              <div className="dashboard-card-content">
                <span className="dashboard-card-value">{analisadasIA}</span>
                <span className="dashboard-card-label">Analisadas por IA</span>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>Últimas Solicitações</h2>
              <button
                className="dashboard-link-todas"
                onClick={() => navigate('/solicitacoes')}
              >
                Ver todas
                <ArrowRight size={16} />
              </button>
            </div>

            {ultimasSolicitacoes.length === 0 ? (
              <div className="dashboard-empty">
                <FileText size={40} />
                <p>Nenhuma solicitação cadastrada</p>
                <button
                  className="dashboard-btn-nova-inline"
                  onClick={() => navigate('/nova-solicitacao')}
                >
                  Criar primeira solicitação
                </button>
              </div>
            ) : (
              <div className="dashboard-list">
                {ultimasSolicitacoes.map((s) => (
                  <div
                    key={s.id}
                    className="dashboard-list-item"
                    onClick={() => navigate('/solicitacoes')}
                  >
                    <div className="dashboard-list-main">
                      <span className="dashboard-list-titulo">
                        {s.titulo}
                      </span>
                      {s.analisadoPorIA && (
                        <span className="dashboard-list-badge-ia">
                          <Sparkles size={12} />
                          IA
                        </span>
                      )}
                    </div>
                    <div className="dashboard-list-meta">
                      <span
                        className="dashboard-list-status"
                        style={{ color: getStatusColor(s.status) }}
                      >
                        {getStatusLabel(s.status)}
                      </span>
                      <span className="dashboard-list-date">
                        {formatDate(s.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
