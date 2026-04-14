import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/services/api.service'
import { getBrazilianHolidays } from '@/utils/holidays'
import type { CalendarEvent } from '@/types/calendar.types'

export function useCalendar() {
  const { currentUser } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!currentUser) return
    try {
      const data = await apiFetch<Array<CalendarEvent & { date: string }>>('/api/data/events')
      const parsed = data.map((e) => ({
        ...e,
        date: new Date(e.date),
      }))

      // Merge with current year's Brazilian holidays (local computation, no DB needed)
      const year = new Date().getFullYear()
      const holidays = getBrazilianHolidays(year)
      const userIds = new Set(parsed.map((e) => e.id))
      const merged = [
        ...holidays.filter((h) => !userIds.has(h.id)),
        ...parsed,
      ]
      setEvents(merged)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => { fetch() }, [fetch])

  const addEvent = async (data: Omit<CalendarEvent, 'id'>) => {
    const res = await apiFetch<{ id: string }>('/api/data/events', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
        type: data.type,
        classId: data.classId,
      }),
    })
    setEvents((prev) => [...prev, { id: res.id, ...data }])
  }

  const deleteEvent = async (id: string) => {
    await apiFetch(`/api/data/events/${id}`, { method: 'DELETE' })
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return { events, loading, addEvent, deleteEvent, refetch: fetch }
}
