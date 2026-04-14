export type CalendarEventType = 'class' | 'holiday' | 'recess' | 'custom'

export interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: CalendarEventType
  classId: string | null
  color: string
}

export interface Holiday {
  date: Date
  name: string
  type: 'national' | 'school'
}
