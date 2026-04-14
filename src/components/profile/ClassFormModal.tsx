import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CLASS_COLORS, EDUCATION_LEVELS } from '@/config/constants'
import type { TeacherClass } from '@/types/teacher.types'

interface ClassFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<TeacherClass, 'id'>) => Promise<void>
  editingClass?: TeacherClass | null
}

const defaultForm: Omit<TeacherClass, 'id'> = {
  name: '',
  level: EDUCATION_LEVELS[2],
  studentProfile: '',
  color: CLASS_COLORS[0],
  subjectOverride: null,
}

export function ClassFormModal({ open, onClose, onSave, editingClass }: ClassFormModalProps) {
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingClass) {
      setForm({
        name: editingClass.name,
        level: editingClass.level,
        studentProfile: editingClass.studentProfile,
        color: editingClass.color,
        subjectOverride: editingClass.subjectOverride,
      })
    } else {
      setForm(defaultForm)
    }
  }, [editingClass, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingClass ? 'Editar turma' : 'Nova turma'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome da turma *</label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ex: 8º Ano A, 1ª série EM..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nível de ensino</label>
          <select
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {EDUCATION_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Perfil dos alunos</label>
          <textarea
            value={form.studentProfile}
            onChange={(e) => setForm({ ...form, studentProfile: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Ex: Turma participativa, dificuldade em algebra, gosta de atividades em grupo..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Cor de identificação</label>
          <div className="flex flex-wrap gap-2">
            {CLASS_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm({ ...form, color })}
                className={`w-7 h-7 rounded-full transition-all ${
                  form.color === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving}>
            {editingClass ? 'Atualizar' : 'Criar turma'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
