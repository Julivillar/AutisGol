import { NavLink } from 'react-router-dom'
import { ReactNode } from 'react'
import { DevAuth } from '../../components/common/DevAuth'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-20 bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-lg">Autisgol</div>
          <nav className="flex items-center gap-2">
            <NavItem to="/">Dashboard</NavItem>
            <NavItem to="/estadisticas">Estadísticas</NavItem>
            <NavItem to="/partidos">Partidos</NavItem>
          </nav>
          <DevAuth />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}

function NavItem({ to, children }: { to: string, children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'px-3 py-1.5 rounded-lg text-sm border ' +
        (isActive ? 'bg-primary text-white border-primary' : 'bg-white hover:bg-gray-50')
      }
      end
    >
      {children}
    </NavLink>
  )
}