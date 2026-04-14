import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Brain,
  Calendar,
  Library,
  UserCircle,
  X,
  GraduationCap,
} from 'lucide-react'
import { useUI } from '@/contexts/UIContext'
import { useTeacher } from '@/contexts/TeacherContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Início' },
  { to: '/planejador', icon: Brain, label: 'Planejador IA' },
  { to: '/calendario', icon: Calendar, label: 'Calendário' },
  { to: '/acervo', icon: Library, label: 'Acervo' },
  { to: '/perfil', icon: UserCircle, label: 'Perfil' },
]

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUI()
  const { profile } = useTeacher()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50
          flex flex-col transition-transform duration-300
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">Prof. Raposo</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Teacher info */}
        {profile && (
          <div className="px-4 py-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                  {profile.name.charAt(0) || 'P'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{profile.name || 'Professor'}</p>
                <p className="text-xs text-slate-500 truncate">{profile.subject || 'Configure seu perfil'}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
