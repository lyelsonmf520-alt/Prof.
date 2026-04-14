import { useState } from 'react'
import { Plus, LogOut } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TeacherForm } from '@/components/profile/TeacherForm'
import { ClassCard } from '@/components/profile/ClassCard'
import { ClassFormModal } from '@/components/profile/ClassFormModal'
import { ScheduleGrid } from '@/components/profile/ScheduleGrid'
import { useClasses } from '@/hooks/useClasses'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/Spinner'
import type { TeacherClass } from '@/types/teacher.types'

export function ProfilePage() {
  const { classes, loading, addClass, updateClass, deleteClass } = useClasses()
  const { signOut } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<TeacherClass | null>(null)

  const handleSave = async (data: Omit<TeacherClass, 'id'>) => {
    if (editingClass) {
      await updateClass(editingClass.id, data)
    } else {
      await addClass(data)
    }
  }

  const handleEdit = (cls: TeacherClass) => {
    setEditingClass(cls)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingClass(null)
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Meu Perfil</h2>
          <p className="text-slate-500 text-sm mt-0.5">Configure seus dados e turmas.</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          icon={<LogOut size={15} />}
        >
          Sair
        </Button>
      </div>

      {/* Teacher info */}
      <Card header="👤 Dados do Professor">
        <TeacherForm />
      </Card>

      {/* Classes */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <span>🏫 Minhas Turmas</span>
            <Button
              size="sm"
              variant="outline"
              icon={<Plus size={15} />}
              onClick={() => { setEditingClass(null); setModalOpen(true) }}
            >
              Nova turma
            </Button>
          </div>
        }
      >
        {loading ? (
          <Spinner size="sm" className="mx-auto" />
        ) : classes.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            Nenhuma turma cadastrada. Clique em "Nova turma" para começar.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {classes.map((cls) => (
              <ClassCard key={cls.id} cls={cls} onEdit={handleEdit} onDelete={deleteClass} />
            ))}
          </div>
        )}
      </Card>

      {/* Schedule */}
      {classes.length > 0 && (
        <Card header="📅 Grade de Horários">
          <ScheduleGrid classes={classes} />
        </Card>
      )}

      <ClassFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingClass={editingClass}
      />
    </div>
  )
}
