import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import './NovaSolicitacao.css'

export default function NovaSolicitacao() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    tipoObra: '',
    localizacao: '',
    descricao: ''
  })
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const validFiles = Array.from(selectedFiles).filter(file => {
      const maxSize = 50 * 1024 * 1024 // 50MB
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      
      if (file.size > maxSize) {
        alert(`O arquivo ${file.name} excede o tamanho máximo de 50MB`)
        return false
      }
      
      if (!validTypes.includes(file.type)) {
        alert(`O arquivo ${file.name} não é um tipo válido (PDF, JPG, PNG, XLSX)`)
        return false
      }
      
      return true
    })

    setFiles(prev => [...prev, ...validFiles])
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementar envio do formulário
    console.log('Form data:', formData)
    console.log('Files:', files)
    alert('Solicitação criada com sucesso!')
    navigate('/solicitacoes')
  }

  const handleCancel = () => {
    navigate('/solicitacoes')
  }

  return (
    <div className="nova-solicitacao-container">
      <form onSubmit={handleSubmit} className="nova-solicitacao-form">
        {/* Seção Informações da Obra */}
        <div className="form-section">
          <h2 className="section-title">Informações da Obra</h2>
          
          <div className="form-group">
            <label htmlFor="titulo">Título da Solicitação</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ex: Duplicação BR-101 - Trecho Norte"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipoObra">Tipo de Obra</label>
              <select
                id="tipoObra"
                name="tipoObra"
                value={formData.tipoObra}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="duplicacao">Duplicação</option>
                <option value="recapeamento">Recapeamento</option>
                <option value="reforma">Reforma</option>
                <option value="construcao">Construção</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="localizacao">Localização</label>
              <input
                type="text"
                id="localizacao"
                name="localizacao"
                value={formData.localizacao}
                onChange={handleInputChange}
                placeholder="Ex: BR-101, km 45 ao km 78"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Descreva o escopo da obra e os principais elementos do projeto..."
              rows={5}
              required
            />
          </div>
        </div>

        {/* Seção Documentos e Imagens */}
        <div className="form-section">
          <h2 className="section-title">Documentos e Imagens</h2>
          
          <div
            className={`upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} className="upload-icon" />
            <p className="upload-text">Arraste arquivos aqui ou clique para selecionar</p>
            <p className="upload-info">PDF, JPG, PNG, XLSX (máx. 50MB por arquivo)</p>
            <button
              type="button"
              className="select-files-button"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              Selecionar Arquivos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.xlsx"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </div>

          {files.length > 0 && (
            <div className="files-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <button
                    type="button"
                    className="remove-file-button"
                    onClick={() => handleRemoveFile(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancelar"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-criar"
          >
            Criar Solicitação
          </button>
        </div>
      </form>
    </div>
  )
}
