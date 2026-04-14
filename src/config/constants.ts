export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const EDUCATION_LEVELS = [
  'Educação Infantil',
  'Ensino Fundamental I (1º ao 5º)',
  'Ensino Fundamental II (6º ao 9º)',
  'Ensino Médio',
  'Ensino Técnico',
  'Ensino Superior',
  'EJA',
  'Pré-vestibular',
]

export const CLASS_COLORS = [
  '#4f46e5', // indigo
  '#7c3aed', // violet
  '#db2777', // pink
  '#dc2626', // red
  '#d97706', // amber
  '#16a34a', // green
  '#0891b2', // cyan
  '#0284c7', // sky
  '#9333ea', // purple
  '#c2410c', // orange
]

export const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const PERIODS = [
  '1º Horário',
  '2º Horário',
  '3º Horário',
  '4º Horário',
  '5º Horário',
  '6º Horário',
]

export const MATERIAL_TYPES = {
  lesson_plan: { label: 'Plano de Aula', icon: 'BookOpen', color: '#4f46e5' },
  activities: { label: 'Atividades', icon: 'ClipboardList', color: '#16a34a' },
  slides: { label: 'Slides', icon: 'Presentation', color: '#db2777' },
} as const

export type MaterialType = keyof typeof MATERIAL_TYPES
