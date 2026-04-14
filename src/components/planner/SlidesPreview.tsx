import { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { SlideCard } from './SlideCard'
import { Button } from '@/components/ui/Button'
import { API_BASE_URL } from '@/config/constants'
import type { SlideItem } from '@/types/planner.types'

const TOKEN_KEY = 'prof_raposo_token'

interface SlidesPreviewProps {
  slides: SlideItem[]
  topic: string
  lessonPlanContent?: string
  teacher?: string
  subject?: string
  school?: string
}

export function SlidesPreview({ slides, topic, lessonPlanContent, teacher, subject, school }: SlidesPreviewProps) {
  const [downloading, setDownloading] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  function getHeaders(): Record<string, string> {
    const token = localStorage.getItem(TOKEN_KEY)
    const base: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) base['Authorization'] = `Bearer ${token}`
    return base
  }

  const handleDownloadPPTX = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/slides/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ slides, topic }),
      })
      if (!res.ok) throw new Error('Falha ao gerar PPTX')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${topic.replace(/[^a-z0-9]/gi, '_')}_slides.pptx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!lessonPlanContent) return
    setDownloadingPdf(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/slides/pdf`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          content: lessonPlanContent,
          title: topic,
          topic,
          teacher,
          subject,
          school,
        }),
      })
      if (!res.ok) throw new Error('Falha ao gerar PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${topic.replace(/[^a-z0-9]/gi, '_')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloadingPdf(false)
    }
  }

  if (slides.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-slate-600 font-medium">{slides.length} slides gerados</p>
        <div className="flex gap-2">
          {lessonPlanContent && (
            <Button
              variant="outline"
              size="sm"
              loading={downloadingPdf}
              icon={<FileText size={15} />}
              onClick={handleDownloadPDF}
            >
              Baixar PDF
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            loading={downloading}
            icon={<Download size={15} />}
            onClick={handleDownloadPPTX}
          >
            Baixar PPTX
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {slides.map((slide, i) => (
          <SlideCard key={i} slide={slide} index={i} />
        ))}
      </div>
    </div>
  )
}
