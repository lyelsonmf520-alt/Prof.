import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/services/api.service'
import type { ArchivedMaterial, Note } from '@/types/archive.types'

export function useArchive() {
  const { currentUser } = useAuth()
  const [materials, setMaterials] = useState<ArchivedMaterial[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!currentUser) return
    try {
      const data = await apiFetch<Array<ArchivedMaterial & { createdAt: number }>>('/api/data/materials')
      setMaterials(
        data.map((m) => ({
          ...m,
          createdAt: new Date(m.createdAt),
        }))
      )
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => { fetch() }, [fetch])

  const saveMaterial = async (
    data: Omit<ArchivedMaterial, 'id' | 'createdAt'>
  ): Promise<string> => {
    const res = await apiFetch<{ id: string }>('/api/data/materials', {
      method: 'POST',
      body: JSON.stringify({
        type: data.type,
        title: data.title,
        topic: data.topic,
        classId: data.classId,
        className: data.className,
        content: data.content,
        slidesJson: data.slidesJson,
        tags: data.tags,
      }),
    })
    setMaterials((prev) => [{ id: res.id, createdAt: new Date(), ...data }, ...prev])
    return res.id
  }

  const deleteMaterial = async (id: string) => {
    await apiFetch(`/api/data/materials/${id}`, { method: 'DELETE' })
    setMaterials((prev) => prev.filter((m) => m.id !== id))
  }

  return { materials, loading, saveMaterial, deleteMaterial, refetch: fetch }
}

export function useNotes() {
  const { currentUser } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!currentUser) return
    try {
      const data = await apiFetch<Array<Note & { createdAt: number }>>('/api/data/notes')
      setNotes(data.map((n) => ({ ...n, createdAt: new Date(n.createdAt) })))
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => { fetch() }, [fetch])

  const addNote = async (body: string) => {
    const res = await apiFetch<{ id: string }>('/api/data/notes', {
      method: 'POST',
      body: JSON.stringify({ body }),
    })
    setNotes((prev) => [{ id: res.id, body, pinned: false, createdAt: new Date() }, ...prev])
  }

  const deleteNote = async (id: string) => {
    await apiFetch(`/api/data/notes/${id}`, { method: 'DELETE' })
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return { notes, loading, addNote, deleteNote }
}
