import { Card } from '@/components/ui/Card'
import { DailyOverview } from '@/components/dashboard/DailyOverview'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { NotepadInbox } from '@/components/dashboard/NotepadInbox'
import { useTeacher } from '@/contexts/TeacherContext'
import { useClasses } from '@/hooks/useClasses'
import { Spinner } from '@/components/ui/Spinner'

export function DashboardPage() {
  const { profile } = useTeacher()
  const { classes, loading } = useClasses()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-3xl mx-auto">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Olá, {profile?.name?.split(' ')[0] || 'Professor'}! 👋
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">Veja o que está programado para hoje.</p>
      </div>

      {/* Today's overview */}
      <Card header="📅 Hoje">
        <DailyOverview classes={classes} />
      </Card>

      {/* Quick actions */}
      <Card header="⚡ Ações rápidas">
        <QuickActions />
      </Card>

      {/* Notepad */}
      <Card header="📝 Bloco de notas">
        <NotepadInbox />
      </Card>
    </div>
  )
}
