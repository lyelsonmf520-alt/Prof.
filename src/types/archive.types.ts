import type { MaterialType } from '@/config/constants'

export interface ArchivedMaterial {
  id: string
  type: MaterialType
  title: string
  topic: string
  classId: string | null
  className: string | null
  content: string
  slidesJson: string | null
  pptxStorageUrl: string | null
  createdAt: Date
  tags: string[]
}

export interface Note {
  id: string
  body: string
  createdAt: Date
  pinned: boolean
}
