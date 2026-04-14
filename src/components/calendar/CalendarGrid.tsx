import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getDaysInMonth, isSameDay, isToday, formatMonthYear } from '@/utils/formatters'
import type { CalendarEvent } from '@/types/calendar.types'

interface CalendarGridProps {
  events: CalendarEvent[]
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function CalendarGrid({ events }: CalendarGridProps) {
  const [current, setCurrent] = useState(new Date())

  const year = current.getFullYear()
  const month = current.getMonth()

  const days = getDaysInMonth(year, month)
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1))

  const getEventsForDay = (date: Date) =>
    events.filter((e) => isSameDay(e.date, date))

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800 capitalize">{formatMonthYear(current)}</h2>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ChevronLeft size={18} />
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-xs font-medium text-slate-500 py-2">
            {wd}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-20 border-r border-b border-slate-100" />
        ))}

        {days.map((date, i) => {
          const dayEvents = getEventsForDay(date)
          const today = isToday(date)
          const isWeekend = date.getDay() === 0 || date.getDay() === 6

          return (
            <div
              key={i}
              className={`h-20 border-r border-b border-slate-100 p-1.5 flex flex-col ${
                isWeekend ? 'bg-slate-50/50' : ''
              }`}
            >
              <span
                className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                  today
                    ? 'bg-primary-600 text-white'
                    : isWeekend
                    ? 'text-slate-400'
                    : 'text-slate-700'
                }`}
              >
                {date.getDate()}
              </span>
              <div className="space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs px-1 rounded truncate font-medium"
                    style={{
                      backgroundColor: `${event.color}20`,
                      color: event.color,
                    }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-slate-400 px-1">+{dayEvents.length - 2}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
