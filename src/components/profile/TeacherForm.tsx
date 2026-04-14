import { useState } from 'react'
import { Save } from 'lucide-react'
import { useTeacher } from '@/contexts/TeacherContext'
import { Button } from '@/components/ui/Button'

export function TeacherForm() {
  const { profile, updateProfile } = useTeacher()
  const [form, setForm] = useState({
    name: profile?.name || '',
    subject: profile?.subject || '',
    school: profile?.school || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Seu nome"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Disciplina</label>
        <input
          type="text"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ex: Matemática, Português..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Escola</label>
        <input
          type="text"
          value={form.school}
          onChange={(e) => setForm({ ...form, school: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Nome da escola"
        />
      </div>
      <Button
        type="submit"
        loading={saving}
        icon={<Save size={16} />}
      >
        {saved ? 'Salvo!' : 'Salvar alterações'}
      </Button>
    </form>
  )
}
