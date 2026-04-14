import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTeacher } from '@/contexts/TeacherContext'
import { apiStream, apiUpload } from '@/services/api.service'
import { buildLessonPlanPrompt, buildActivitiesPrompt, buildSlidesPrompt } from '@/utils/promptBuilders'
import { useArchive } from './useArchive'
import type { GenerationStatus, SlideItem } from '@/types/planner.types'
import type { TeacherClass } from '@/types/teacher.types'
import type { MaterialType } from '@/config/constants'

interface UseGenerateContentReturn {
  status: GenerationStatus
  content: string
  slides: SlideItem[]
  error: string | null
  generate: (type: MaterialType, topic: string, selectedClass: TeacherClass | null, file?: File) => Promise<void>
  reset: () => void
}

export function useGenerateContent(): UseGenerateContentReturn {
  const { currentUser } = useAuth()
  const { profile } = useTeacher()
  const { saveMaterial } = useArchive()

  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [content, setContent] = useState('')
  const [slides, setSlides] = useState<SlideItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setStatus('idle')
    setContent('')
    setSlides([])
    setError(null)
  }, [])

  const generate = useCallback(
    async (
      type: MaterialType,
      topic: string,
      selectedClass: TeacherClass | null,
      file?: File
    ) => {
      if (!currentUser) return

      try {
        setStatus('uploading')
        setContent('')
        setSlides([])
        setError(null)

        let sourceContext: string | undefined

        // Step 1: Extract text from uploaded file
        if (file) {
          const ext = file.name.split('.').pop()?.toLowerCase()
          const endpoint = ext === 'pdf' ? '/api/upload/pdf' : '/api/upload/image'
          const result = await apiUpload(endpoint, file)
          sourceContext = result.text
        }

        // Step 2: Build prompt
        const ctx = { teacher: profile, selectedClass, topic, sourceContext }
        let prompt = ''
        if (type === 'lesson_plan') prompt = buildLessonPlanPrompt(ctx)
        else if (type === 'activities') prompt = buildActivitiesPrompt(ctx)
        else prompt = buildSlidesPrompt(ctx)

        setStatus('generating')

        // Step 3: Stream from backend
        let accumulated = ''

        await apiStream(
          '/api/ai/generate',
          { prompt, type },
          (chunk) => {
            accumulated += chunk
            setContent(accumulated)
          },
          async () => {
            setStatus('done')

            // Step 4: Parse slides JSON if applicable
            if (type === 'slides') {
              try {
                const parsed = JSON.parse(accumulated) as SlideItem[]
                setSlides(parsed)
              } catch {
                // Content may be markdown, not JSON — handle gracefully
                console.warn('Could not parse slides JSON')
              }
            }

            // Step 5: Auto-save to archive
            const title = `${topic}${selectedClass ? ` — ${selectedClass.name}` : ''}`
            try {
              await saveMaterial({
                type,
                title,
                topic,
                classId: selectedClass?.id || null,
                className: selectedClass?.name || null,
                content: type !== 'slides' ? accumulated : '',
                slidesJson: type === 'slides' ? accumulated : null,
                pptxStorageUrl: null,
                tags: [],
              })
            } catch (saveErr) {
              console.warn('Auto-save failed:', saveErr)
            }
          },
          (err) => {
            setError(err.message)
            setStatus('error')
          }
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        setStatus('error')
      }
    },
    [currentUser, profile, saveMaterial]
  )

  return { status, content, slides, error, generate, reset }
}
