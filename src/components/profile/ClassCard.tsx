import { Pencil, Trash2 } from 'lucide-react'
import type { TeacherClass } from '@/types/teacher.types'

interface ClassCardProps {
  cls: TeacherClass
  onEdit: (cls: TeacherClass) => void
  onDelete: (id: string) => void
}

export function ClassCard({ cls, onEdit, onDelete }: ClassCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors group">
      {/* Color indicator */}
      <div
        className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: cls.color }}
      >
        {cls.name.charAt(0)}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm truncate">{cls.name}</p>
        <p className="text-xs text-slate-500 truncate">{cls.level}</p>
      </div>
      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(cls)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(cls.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
