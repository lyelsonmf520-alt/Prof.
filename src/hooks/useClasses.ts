import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCollection, addToCollection, updateInCollection, deleteFromCollection } from '@/services/firestore.service'
import type { TeacherClass } from '@/types/teacher.types'

export function useClasses() {
  const { currentUser } = useAuth()
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!currentUser) return
    const data = await getCollection<TeacherClass>(currentUser.uid, 'classes', [])
    setClasses(data)
    setLoading(false)
  }, [currentUser])

  useEffect(() => { fetch() }, [fetch])

  const addClass = async (data: Omit<TeacherClass, 'id'>) => {
    if (!currentUser) return
    const id = await addToCollection(currentUser.uid, 'classes', data)
    setClasses((prev) => [...prev, { id, ...data }])
  }

  const updateClass = async (id: string, data: Partial<TeacherClass>) => {
    if (!currentUser) return
    await updateInCollection(currentUser.uid, 'classes', id, data)
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)))
  }

  const deleteClass = async (id: string) => {
    if (!currentUser) return
    await deleteFromCollection(currentUser.uid, 'classes', id)
    setClasses((prev) => prev.filter((c) => c.id !== id))
  }

  return { classes, loading, addClass, updateClass, deleteClass, refetch: fetch }
}
