import { X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './RelatorioViewer.css'

interface RelatorioViewerProps {
  relatorio: string
  titulo: string
  onClose: () => void
}

export default function RelatorioViewer({ relatorio, titulo, onClose }: RelatorioViewerProps) {
  return (
    <div className="relatorio-viewer-overlay" onClick={onClose}>
      <div className="relatorio-viewer-container" onClick={(e) => e.stopPropagation()}>
        <div className="relatorio-viewer-header">
          <h2>Relatório de Análise - {titulo}</h2>
          <button className="relatorio-viewer-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="relatorio-viewer-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{relatorio}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
