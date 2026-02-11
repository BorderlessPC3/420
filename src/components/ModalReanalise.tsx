import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import './ModalReanalise.css'

interface ModalReanaliseProps {
  titulo: string
  onConfirm: (promptCustomizado?: string) => Promise<void>
  onClose: () => void
}

export default function ModalReanalise({ titulo, onConfirm, onClose }: ModalReanaliseProps) {
  const [promptCustomizado, setPromptCustomizado] = useState('')
  const [usarPromptCustomizado, setUsarPromptCustomizado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    setLoading(true)

    try {
      await onConfirm(usarPromptCustomizado && promptCustomizado ? promptCustomizado : undefined)
      onClose()
    } catch (error: any) {
      setErro(error.message || 'Erro ao reanalisar solicitação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-reanalise-overlay" onClick={onClose}>
      <div className="modal-reanalise-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-reanalise-header">
          <div className="modal-reanalise-header-content">
            <Sparkles size={24} className="modal-reanalise-icon" />
            <h2>Reanalisar com IA</h2>
          </div>
          <button className="modal-reanalise-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-reanalise-body">
          <p className="modal-reanalise-description">
            A solicitação <strong>"{titulo}"</strong> será reenviada para análise pela IA.
            Você pode usar o prompt padrão ou fornecer um prompt customizado para uma análise mais específica.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="modal-reanalise-option">
              <label className="modal-reanalise-checkbox-label">
                <input
                  type="checkbox"
                  checked={usarPromptCustomizado}
                  onChange={(e) => setUsarPromptCustomizado(e.target.checked)}
                />
                <span>Usar prompt customizado</span>
              </label>
            </div>

            {usarPromptCustomizado && (
              <div className="modal-reanalise-prompt-group">
                <label htmlFor="prompt-customizado">Prompt Customizado</label>
                <textarea
                  id="prompt-customizado"
                  value={promptCustomizado}
                  onChange={(e) => setPromptCustomizado(e.target.value)}
                  placeholder="Ex: Analise focando em aspectos ambientais e impacto ecológico..."
                  rows={6}
                  className="modal-reanalise-textarea"
                />
                <p className="modal-reanalise-hint">
                  Descreva o tipo de análise que deseja. A IA usará este prompt junto com as informações da solicitação e documentos.
                </p>
              </div>
            )}

            {erro && (
              <div className="modal-reanalise-error">
                {erro}
              </div>
            )}

            <div className="modal-reanalise-actions">
              <button
                type="button"
                className="modal-reanalise-btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="modal-reanalise-btn-confirm"
                disabled={loading || (usarPromptCustomizado && !promptCustomizado.trim())}
              >
                {loading ? 'Analisando...' : 'Reanalisar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
