import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCollection, addToCollection, deleteFromCollection } from '@/services/firestore.service'
import { getBrazilianHolidays } from '@/utils/holidays'
import type { CalendarEvent } from '@/types/calendar.types'

export function useCalendar() {
  const { currentUser } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!currentUser) return
    const data = await getCollection<CalendarEvent>(currentUser.uid, 'events')
    const parsed = data.map((e) => ({
      ...e,
      date: e.date instanceof Date ? e.date : (e.date as any)?.toDate?.() || new Date(),
    }))

    // Merge with current year's holidays
    const year = new Date().getFullYear()
    const holidays = getBrazilianHolidays(year)
    const holidayIds = new Set(holidays.map((h) => h.id))
    const firestoreHolidays = parsed.filter((e) => holidayIds.has(e.id))
    const customEvents = parsed.filter((e) => !holidayIds.has(e.id))

    setEvents([...holidays.filter((h) => !firestoreHolidays.some((f) => f.id === h.id)), ...parsed])
    setLoading(false)
  }, [currentUser])

  useEffect(() => { fetch() }, [fetch])

  const addEvent = async (data: Omit<CalendarEvent, 'id'>) => {
    if (!currentUser) return
    const id = await addToCollection(currentUser.uid, 'events', {
      ...data,
      date: data.date,
    })
    setEvents((prev) => [...prev, { id, ...data }])
  }

  const deleteEvent = async (id: string) => {
    if (!currentUser) return
    await deleteFromCollection(currentUser.uid, 'events', id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return { events, loading, addEvent, deleteEvent, refetch: fetch }
}
