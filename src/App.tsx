import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PlannerPage } from '@/pages/PlannerPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { ArchivePage } from '@/pages/ArchivePage'
import { ProfilePage } from '@/pages/ProfilePage'
import { Spinner } from '@/components/ui/Spinner'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Spinner size="lg" className="mx-auto" />
          <p className="text-sm text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <AuthGuard>
            <AppShell>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/planejador" element={<PlannerPage />} />
                <Route path="/calendario" element={<CalendarPage />} />
                <Route path="/acervo" element={<ArchivePage />} />
                <Route path="/perfil" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </AuthGuard>
        }
      />
    </Routes>
  )
}
