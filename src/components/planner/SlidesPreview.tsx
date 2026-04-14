import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { SlideCard } from './SlideCard'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/services/api.service'
import type { SlideItem } from '@/types/planner.types'
import { auth } from '@/config/firebase'
import { API_BASE_URL } from '@/config/constants'

interface SlidesPreviewProps {
  slides: SlideItem[]
  topic: string
}

export function SlidesPreview({ slides, topic }: SlidesPreviewProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const user = auth.currentUser
      const token = user ? await user.getIdToken() : ''
      const res = await fetch(`${API_BASE_URL}/api/slides/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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

  if (slides.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 font-medium">{slides.length} slides gerados</p>
        <Button
          variant="outline"
          size="sm"
          loading={downloading}
          icon={<Download size={15} />}
          onClick={handleDownload}
        >
          Baixar PPTX
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {slides.map((slide, i) => (
          <SlideCard key={i} slide={slide} index={i} />
        ))}
      </div>
    </div>
  )
}
