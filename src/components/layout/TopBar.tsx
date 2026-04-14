import { Menu } from 'lucide-react'
import { useUI } from '@/contexts/UIContext'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/': 'Início',
  '/planejador': 'Planejador com IA',
  '/calendario': 'Calendário',
  '/acervo': 'Acervo',
  '/perfil': 'Perfil',
}

export function TopBar() {
  const { toggleSidebar } = useUI()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Prof. Raposo'

  return (
    <header className="h-14 flex items-center gap-4 px-4 border-b border-slate-200 bg-white sticky top-0 z-30">
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
      >
        <Menu size={20} />
      </button>
      <h1 className="font-semibold text-slate-800 text-base">{title}</h1>
    </header>
  )
}
