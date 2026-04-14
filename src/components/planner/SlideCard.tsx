import { Image } from 'lucide-react'
import type { SlideItem } from '@/types/planner.types'

interface SlideCardProps {
  slide: SlideItem
  index: number
}

const layoutLabels: Record<string, string> = {
  title: 'Abertura',
  content: 'Conteúdo',
  image_text: 'Imagem + Texto',
  closing: 'Fechamento',
}

export function SlideCard({ slide, index }: SlideCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Slide preview area */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-4 min-h-[120px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-primary-200">{layoutLabels[slide.layout] || slide.layout}</span>
          <span className="text-xs text-primary-300">#{index + 1}</span>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm leading-snug">{slide.title}</h3>
          {slide.bullets.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {slide.bullets.slice(0, 3).map((b, i) => (
                <li key={i} className="text-primary-200 text-xs flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span className="line-clamp-1">{b}</span>
                </li>
              ))}
              {slide.bullets.length > 3 && (
                <li className="text-primary-300 text-xs">+{slide.bullets.length - 3} pontos</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Image prompt indicator */}
      {slide.imagePrompt && (
        <div className="px-3 py-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
          <Image size={12} />
          <span className="truncate">{slide.imagePrompt}</span>
        </div>
      )}
    </div>
  )
}
