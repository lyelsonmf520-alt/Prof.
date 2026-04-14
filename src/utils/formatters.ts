const ptBR = 'pt-BR'

export function formatDate(date: Date): string {
  return date.toLocaleDateString(ptBR, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString(ptBR, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString(ptBR, { day: '2-digit', month: 'short' })
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(ptBR, { month: 'long', year: 'numeric' })
}

export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays} dias atrás`
  return formatDate(date)
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}
