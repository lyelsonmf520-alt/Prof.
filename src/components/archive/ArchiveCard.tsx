import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, BookOpen, ClipboardList, Presentation } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'
import { formatRelativeDate } from '@/utils/formatters'
import type { ArchivedMaterial } from '@/types/archive.types'

const typeConfig = {
  lesson_plan: { label: 'Plano de Aula', icon: BookOpen, color: 'blue' as const },
  activities: { label: 'Atividades', icon: ClipboardList, color: 'green' as const },
  slides: { label: 'Slides', icon: Presentation, color: 'pink' as const },
}

interface ArchiveCardProps {
  material: ArchivedMaterial
  onDelete: (id: string) => void
}

export function ArchiveCard({ material, onDelete }: ArchiveCardProps) {
  const [expanded, setExpanded] = useState(false)
  const config = typeConfig[material.type]
  const Icon = config.icon

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-slate-800 text-sm leading-snug">{material.title}</h3>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              <button
                onClick={() => onDelete(material.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge color={config.color}>{config.label}</Badge>
            {material.className && <Badge color="gray">{material.className}</Badge>}
            <span className="text-xs text-slate-400">{formatRelativeDate(material.createdAt)}</span>
          </div>
        </div>
      </div>

      {expanded && material.content && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 max-h-80 overflow-y-auto">
          <MarkdownRenderer content={material.content} />
        </div>
      )}

      {expanded && material.slidesJson && !material.content && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3">
          <p className="text-sm text-slate-500">
            Apresentação com {JSON.parse(material.slidesJson).length} slides gerados.
          </p>
        </div>
      )}
    </div>
  )
}
