import type { CalendarEvent } from '@/types/calendar.types'

/** Computes Easter Sunday date for a given year using the Anonymous Gregorian algorithm */
function getEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function d(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

export function getBrazilianHolidays(year: number): CalendarEvent[] {
  const easter = getEaster(year)
  const holidays: Array<{ date: Date; name: string }> = [
    // Fixed national holidays
    { date: d(year, 1, 1), name: 'Confraternização Universal' },
    { date: d(year, 4, 21), name: 'Tiradentes' },
    { date: d(year, 5, 1), name: 'Dia do Trabalho' },
    { date: d(year, 9, 7), name: 'Independência do Brasil' },
    { date: d(year, 10, 12), name: 'Nossa Senhora Aparecida' },
    { date: d(year, 11, 2), name: 'Finados' },
    { date: d(year, 11, 15), name: 'Proclamação da República' },
    { date: d(year, 11, 20), name: 'Dia da Consciência Negra' },
    { date: d(year, 12, 25), name: 'Natal' },
    // Easter-based
    { date: addDays(easter, -48), name: 'Carnaval (Segunda)' },
    { date: addDays(easter, -47), name: 'Carnaval (Terça)' },
    { date: addDays(easter, -2), name: 'Sexta-feira Santa' },
    { date: easter, name: 'Páscoa' },
    { date: addDays(easter, 60), name: 'Corpus Christi' },
  ]

  return holidays.map((h, i) => ({
    id: `holiday-${year}-${i}`,
    title: h.name,
    date: h.date,
    type: 'holiday' as const,
    classId: null,
    color: '#dc2626',
  }))
}
