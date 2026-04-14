import { useState } from 'react'
import { Brain, BookOpen, ClipboardList, Presentation } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FileDropzone } from '@/components/ui/FileDropzone'
import type { TeacherClass } from '@/types/teacher.types'
import type { MaterialType } from '@/config/constants'

const typeOptions: { value: MaterialType; label: string; icon: typeof Brain; desc: string }[] = [
  { value: 'lesson_plan', label: 'Plano de Aula', icon: BookOpen, desc: 'Objetivos, metodologia e avaliação' },
  { value: 'activities', label: 'Atividades', icon: ClipboardList, desc: 'Exercícios adaptados à turma' },
  { value: 'slides', label: 'Slides', icon: Presentation, desc: 'Apresentação completa com IA' },
]

interface PlannerInputFormProps {
  classes: TeacherClass[]
  loading: boolean
  onGenerate: (type: MaterialType, topic: string, cls: TeacherClass | null, file?: File) => void
}

export function PlannerInputForm({ classes, loading, onGenerate }: PlannerInputFormProps) {
  const [selectedType, setSelectedType] = useState<MaterialType>('lesson_plan')
  const [topic, setTopic] = useState('')
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    const cls = classes.find((c) => c.id === selectedClassId) || null
    onGenerate(selectedType, topic, cls, file || undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">O que deseja criar?</label>
        <div className="grid grid-cols-3 gap-2">
          {typeOptions.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedType(value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                selectedType === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-xs text-slate-400 hidden sm:block">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Topic */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tema / Conteúdo *</label>
        <textarea
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          placeholder="Ex: Revolução Francesa, Equações do 2º grau, Fotossíntese..."
        />
      </div>

      {/* Class selector */}
      {classes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Turma (opcional)</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Sem turma específica</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name} — {cls.level}</option>
            ))}
          </select>
        </div>
      )}

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Material de referência (opcional)
        </label>
        <FileDropzone
          selectedFile={file}
          onFileSelect={setFile}
          onClear={() => setFile(null)}
        />
      </div>

      <Button
        type="submit"
        loading={loading}
        size="lg"
        className="w-full"
        icon={<Brain size={18} />}
      >
        {loading ? 'Gerando com IA...' : 'Gerar com IA'}
      </Button>
    </form>
  )
}
