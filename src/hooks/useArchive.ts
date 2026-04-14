import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCollection, addToCollection, deleteFromCollection } from '@/services/firestore.service'
import type { ArchivedMaterial, Note } from '@/types/archive.types'

export function useArchive() {
  const { currentUser } = useAuth()
  const [materials, setMaterials] = useState<ArchivedMaterial[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!currentUser) return
    const data = await getCollection<ArchivedMaterial>(currentUser.uid, 'materials')
    const parsed = data.map((m) => ({
      ...m,
      createdAt: m.createdAt instanceof Date ? m.createdAt : (m.createdAt as any)?.toDate?.() || new Date(),
    }))
    setMaterials(parsed)
    setLoading(false)
  }, [currentUser])

  useEffect(() => { fetch() }, [fetch])

  const saveMaterial = async (
    data: Omit<ArchivedMaterial, 'id' | 'createdAt'>
  ): Promise<string> => {
    if (!currentUser) throw new Error('Not authenticated')
    const id = await addToCollection(currentUser.uid, 'materials', data)
    setMaterials((prev) => [{ id, createdAt: new Date(), ...data }, ...prev])
    return id
  }

  const deleteMaterial = async (id: string) => {
    if (!currentUser) return
    await deleteFromCollection(currentUser.uid, 'materials', id)
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
    const data = await getCollection<Note>(currentUser.uid, 'notes')
    const parsed = data.map((n) => ({
      ...n,
      createdAt: n.createdAt instanceof Date ? n.createdAt : (n.createdAt as any)?.toDate?.() || new Date(),
    }))
    setNotes(parsed)
    setLoading(false)
  }, [currentUser])

  useEffect(() => { fetch() }, [fetch])

  const addNote = async (body: string) => {
    if (!currentUser) return
    const data = { body, pinned: false }
    const id = await addToCollection(currentUser.uid, 'notes', data)
    setNotes((prev) => [{ id, body, pinned: false, createdAt: new Date() }, ...prev])
  }

  const deleteNote = async (id: string) => {
    if (!currentUser) return
    await deleteFromCollection(currentUser.uid, 'notes', id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return { notes, loading, addNote, deleteNote }
}
