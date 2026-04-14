import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { useCalendar } from '@/hooks/useCalendar'
import { Spinner } from '@/components/ui/Spinner'

export function CalendarPage() {
  const { events, loading } = useCalendar()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Calendário</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Feriados nacionais incluídos automaticamente.
        </p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          Feriado Nacional
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-primary-500 inline-block" />
          Aula / Evento
        </div>
      </div>

      <CalendarGrid events={events} />
    </div>
  )
}
