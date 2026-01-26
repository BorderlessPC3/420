import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Plus } from 'lucide-react'
import './Layout.css'

export default function Layout() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Portal de Análise</h2>
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/solicitacoes"
            className={`nav-item ${isActive('/solicitacoes') ? 'active' : ''}`}
          >
            <FileText size={20} />
            <span>Solicitações</span>
          </Link>
          <Link
            to="/nova-solicitacao"
            className={`nav-item ${isActive('/nova-solicitacao') ? 'active' : ''}`}
          >
            <Plus size={20} />
            <span>Nova Solicitação</span>
          </Link>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
