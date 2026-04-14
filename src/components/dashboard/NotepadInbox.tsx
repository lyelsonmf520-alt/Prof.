import { useState } from 'react'
import { Plus, Trash2, StickyNote } from 'lucide-react'
import { useNotes } from '@/hooks/useArchive'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

export function NotepadInbox() {
  const { notes, loading, addNote, deleteNote } = useNotes()
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!text.trim()) return
    setSaving(true)
    await addNote(text.trim())
    setText('')
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Anote uma ideia rápida..."
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Button
          size="sm"
          onClick={handleAdd}
          loading={saving}
          icon={<Plus size={16} />}
        >
          Adicionar
        </Button>
      </div>

      {loading && <Spinner size="sm" className="mx-auto" />}

      <div className="space-y-2">
        {notes.map((note) => (
          <div
            key={note.id}
            className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg group"
          >
            <StickyNote size={14} className="text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-700 flex-1 leading-relaxed">{note.body}</p>
            <button
              onClick={() => deleteNote(note.id)}
              className="p-1 rounded hover:bg-yellow-100 text-yellow-400 hover:text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
