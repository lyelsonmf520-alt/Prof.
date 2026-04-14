import { useEffect, useState } from 'react'
import { CalendarCheck2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getCollection } from '@/services/firestore.service'
import type { ScheduleSlot } from '@/types/teacher.types'
import type { TeacherClass } from '@/types/teacher.types'
import { useCalendar } from '@/hooks/useCalendar'
import { isSameDay, formatDateLong } from '@/utils/formatters'

interface DailyOverviewProps {
  classes: TeacherClass[]
}

export function DailyOverview({ classes }: DailyOverviewProps) {
  const { currentUser } = useAuth()
  const { events } = useCalendar()
  const [slots, setSlots] = useState<ScheduleSlot[]>([])
  const today = new Date()
  const todayDow = today.getDay()

  useEffect(() => {
    if (!currentUser) return
    getCollection<ScheduleSlot>(currentUser.uid, 'schedule').then((data) => {
      setSlots(data.filter((s) => s.dayOfWeek === todayDow))
    })
  }, [currentUser, todayDow])

  const todayEvents = events.filter((e) => isSameDay(e.date, today))
  const getClass = (id: string) => classes.find((c) => c.id === id)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <CalendarCheck2 size={16} />
        <span className="capitalize">{formatDateLong(today)}</span>
      </div>

      {slots.length === 0 && todayEvents.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">Nenhuma aula ou evento para hoje</p>
      ) : (
        <div className="space-y-2">
          {slots.map((slot) => {
            const cls = getClass(slot.classId)
            if (!cls) return null
            return (
              <div
                key={slot.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-100"
                style={{ borderLeftColor: cls.color, borderLeftWidth: 3 }}
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{cls.name}</p>
                  <p className="text-xs text-slate-500">{slot.period}º horário · {cls.level}</p>
                </div>
              </div>
            )
          })}

          {todayEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: `${event.color}15` }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: event.color }}
              />
              <p className="text-sm font-medium" style={{ color: event.color }}>{event.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
