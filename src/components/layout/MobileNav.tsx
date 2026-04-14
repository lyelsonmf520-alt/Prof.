import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Brain, Calendar, Library, UserCircle } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Início' },
  { to: '/planejador', icon: Brain, label: 'Planejar' },
  { to: '/calendario', icon: Calendar, label: 'Agenda' },
  { to: '/acervo', icon: Library, label: 'Acervo' },
  { to: '/perfil', icon: UserCircle, label: 'Perfil' },
]

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex lg:hidden z-30 safe-area-bottom">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs font-medium transition-colors ${
              isActive ? 'text-primary-600' : 'text-slate-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
