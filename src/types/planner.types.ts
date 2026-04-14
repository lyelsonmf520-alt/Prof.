import type { MaterialType } from '@/config/constants'

export interface LessonPlan {
  objectives: string[]
  materials: string[]
  methodology: string
  evaluation: string
  homework: string
  rawMarkdown: string
}

export interface ActivityItem {
  question: string
  type: 'multiple_choice' | 'open_ended' | 'true_false' | 'fill_blank'
  options?: string[]
  answer?: string
}

export interface SlideItem {
  title: string
  bullets: string[]
  speakerNotes: string
  imagePrompt: string
  layout: 'title' | 'content' | 'image_text' | 'closing'
}

export type GenerationStatus = 'idle' | 'uploading' | 'generating' | 'done' | 'error'

export interface GenerationResult {
  type: MaterialType
  content: string
  slides?: SlideItem[]
}
