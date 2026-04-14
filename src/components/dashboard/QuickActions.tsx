import { useNavigate } from 'react-router-dom'
import { BookOpen, ClipboardList, Presentation, Brain } from 'lucide-react'

const actions = [
  {
    icon: BookOpen,
    label: 'Plano de Aula',
    desc: 'Gerar um plano completo',
    color: 'text-blue-600 bg-blue-50',
    href: '/planejador',
  },
  {
    icon: ClipboardList,
    label: 'Atividades',
    desc: 'Lista de exercícios',
    color: 'text-green-600 bg-green-50',
    href: '/planejador',
  },
  {
    icon: Presentation,
    label: 'Slides',
    desc: 'Apresentação com IA',
    color: 'text-pink-600 bg-pink-50',
    href: '/planejador',
  },
  {
    icon: Brain,
    label: 'Acervo',
    desc: 'Ver materiais salvos',
    color: 'text-purple-600 bg-purple-50',
    href: '/acervo',
  },
]

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(({ icon: Icon, label, desc, color, href }) => (
        <button
          key={label}
          onClick={() => navigate(href)}
          className="flex flex-col items-start gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-primary-200 hover:shadow-sm text-left transition-all"
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
            <Icon size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{label}</p>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
